package com.sora.music

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ContentUris
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Base64
import android.util.Log
import android.util.Size
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.FileInputStream

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    // Permission launcher for Android 13+ (READ_MEDIA_AUDIO) and older Android versions
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions.entries.all { it.value }
        if (granted) {
            // Notify webview to refresh
            webView.evaluateJavascript("window.onStoragePermissionGranted && window.onStoragePermissionGranted();", null)
        }
    }

    // File chooser launcher for native Android file / audio picking
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val callback = fileChooserCallback
        fileChooserCallback = null
        if (callback == null) return@registerForActivityResult

        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val intent = result.data!!
            val uris = mutableListOf<Uri>()

            val clipData = intent.clipData
            if (clipData != null) {
                for (i in 0 until clipData.itemCount) {
                    uris.add(clipData.getItemAt(i).uri)
                }
            } else if (intent.data != null) {
                uris.add(intent.data!)
            }

            callback.onReceiveValue(if (uris.isNotEmpty()) uris.toTypedArray() else null)
        } else {
            callback.onReceiveValue(null)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make activity edge-to-edge (translucent status bar and navigation bar)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val insetsController = WindowInsetsControllerCompat(window, window.decorView)
        insetsController.isAppearanceLightStatusBars = false
        insetsController.isAppearanceLightNavigationBars = false

        // WebViewAssetLoader serves assets over https://appassets.androidplatform.net
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
                mediaPlaybackRequiresUserGesture = false
                cacheMode = WebSettings.LOAD_DEFAULT
                databaseEnabled = true
                loadsImagesAutomatically = true
                useWideViewPort = true
                loadWithOverviewMode = true
            }

            // Expose native Android bridge for direct MediaStore music scanning
            addJavascriptInterface(AndroidBridge(this@MainActivity), "AndroidBridge")

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    consoleMessage?.let {
                        Log.d("SoraWebView", "${it.message()} -- From line ${it.lineNumber()} of ${it.sourceId()}")
                    }
                    return true
                }

                // Enables HTML <input type="file"> to trigger native Android system file picker
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = filePathCallback

                    val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        type = "audio/*"
                        putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                        addCategory(Intent.CATEGORY_OPENABLE)
                    }

                    try {
                        fileChooserLauncher.launch(Intent.createChooser(intent, "Select Audio Files"))
                    } catch (e: Exception) {
                        Log.e("SoraWebView", "Failed to launch file chooser", e)
                        fileChooserCallback?.onReceiveValue(null)
                        fileChooserCallback = null
                        return false
                    }
                    return true
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    val url = request?.url ?: return null

                    // Intercept local media requests (https://appassets.androidplatform.net/local-media/<id>)
                    if (url.host == "appassets.androidplatform.net" && url.path?.startsWith("/local-media/") == true) {
                        val idStr = url.lastPathSegment
                        if (idStr != null) {
                            try {
                                val id = idStr.toLong()
                                val contentUri = ContentUris.withAppendedId(
                                    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                                    id
                                )
                                val pfd = contentResolver.openFileDescriptor(contentUri, "r")
                                if (pfd != null) {
                                    val fileLength = pfd.statSize
                                    val mimeType = contentResolver.getType(contentUri) ?: "audio/mpeg"
                                    val rangeHeader = request.requestHeaders?.get("Range") ?: request.requestHeaders?.get("range")

                                    // Support HTTP Range requests for instant seeking in audio tracks
                                    if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                                        val ranges = rangeHeader.substring(6).split("-")
                                        val start = ranges[0].toLongOrNull() ?: 0L
                                        val end = if (ranges.size > 1 && ranges[1].isNotEmpty()) {
                                            ranges[1].toLongOrNull() ?: (fileLength - 1)
                                        } else {
                                            fileLength - 1
                                        }
                                        val contentLength = (end - start + 1).coerceAtLeast(0L)

                                        val fis = FileInputStream(pfd.fileDescriptor)
                                        fis.channel.position(start)

                                        val headers = mutableMapOf(
                                            "Content-Type" to mimeType,
                                            "Accept-Ranges" to "bytes",
                                            "Content-Range" to "bytes $start-$end/$fileLength",
                                            "Content-Length" to contentLength.toString(),
                                            "Access-Control-Allow-Origin" to "*"
                                        )

                                        return WebResourceResponse(
                                            mimeType,
                                            "UTF-8",
                                            206,
                                            "Partial Content",
                                            headers,
                                            fis
                                        )
                                    } else {
                                        val fis = FileInputStream(pfd.fileDescriptor)
                                        val headers = mutableMapOf(
                                            "Content-Type" to mimeType,
                                            "Accept-Ranges" to "bytes",
                                            "Content-Length" to fileLength.toString(),
                                            "Access-Control-Allow-Origin" to "*"
                                        )
                                        return WebResourceResponse(
                                            mimeType,
                                            "UTF-8",
                                            200,
                                            "OK",
                                            headers,
                                            fis
                                        )
                                    }
                                }
                            } catch (e: Exception) {
                                Log.e("SoraWebView", "Error streaming media $idStr", e)
                            }
                        }
                    }

                    return assetLoader.shouldInterceptRequest(url)
                }

                override fun onReceivedError(
                    view: WebView?,
                    errorCode: Int,
                    description: String?,
                    failingUrl: String?
                ) {
                    super.onReceivedError(view, errorCode, description, failingUrl)
                    Log.e("SoraWebView", "Error loading $failingUrl: $description")
                }
            }
        }

        setContentView(webView)

        // Request local storage audio permissions on launch
        checkAudioPermissions()

        // Load the Apple Music interface through secure domain
        webView.loadUrl("https://appassets.androidplatform.net/assets/dist/index.html")
    }

    fun checkAudioPermissions() {
        val permissions = mutableListOf<String>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.READ_MEDIA_AUDIO)
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isNotEmpty()) {
            requestPermissionLauncher.launch(missing.toTypedArray())
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // Native Android Bridge for MediaStore Scanning
    class AndroidBridge(private val activity: MainActivity) {

        @JavascriptInterface
        fun isAndroid(): Boolean = true

        @JavascriptInterface
        fun hasStoragePermission(): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.READ_MEDIA_AUDIO
                ) == PackageManager.PERMISSION_GRANTED
            } else {
                ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.READ_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_GRANTED
            }
        }

        @JavascriptInterface
        fun requestStoragePermission() {
            activity.runOnUiThread {
                activity.checkAudioPermissions()
            }
        }

        @JavascriptInterface
        fun scanDeviceMusic(): String {
            val songList = mutableListOf<JSONObject>()
            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.YEAR
            )

            val selection = "(${MediaStore.Audio.Media.IS_MUSIC} != 0 OR ${MediaStore.Audio.Media.MIME_TYPE} LIKE 'audio/%')"
            val sortOrder = "${MediaStore.Audio.Media.TITLE} ASC"

            try {
                val cursor = activity.contentResolver.query(
                    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                    projection,
                    selection,
                    null,
                    sortOrder
                )

                cursor?.use {
                    val idCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                    val titleCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                    val artistCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                    val albumCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                    val durationCol = it.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                    val yearCol = it.getColumnIndex(MediaStore.Audio.Media.YEAR)

                    while (it.moveToNext()) {
                        val id = it.getLong(idCol)
                        val title = it.getString(titleCol) ?: "Unknown Track"
                        val artist = it.getString(artistCol) ?: "Unknown Artist"
                        val album = it.getString(albumCol) ?: "Local Music"
                        val durationMs = it.getLong(durationCol)
                        val year = if (yearCol != -1) it.getString(yearCol) ?: "" else ""

                        // Skip notifications / ringtones under 5 seconds
                        if (durationMs < 5000) continue

                        val contentUri = ContentUris.withAppendedId(
                            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                            id
                        )

                        var coverBase64 = ""
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            try {
                                val bitmap = activity.contentResolver.loadThumbnail(contentUri, Size(300, 300), null)
                                val stream = ByteArrayOutputStream()
                                bitmap.compress(Bitmap.CompressFormat.JPEG, 75, stream)
                                val b64 = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
                                coverBase64 = "data:image/jpeg;base64,$b64"
                            } catch (e: Exception) {
                                // Will fallback to gradient art in frontend
                            }
                        }

                        val item = JSONObject().apply {
                            put("id", "media-$id")
                            put("mediaStoreId", id)
                            put("title", title)
                            put("artist", if (artist == "<unknown>") "Unknown Artist" else artist)
                            put("album", if (album == "<unknown>") "Local Music" else album)
                            put("duration", (durationMs / 1000).toInt())
                            put("year", year)
                            put("coverUrl", coverBase64)
                            put("format", "AUDIO")
                            put("url", "https://appassets.androidplatform.net/local-media/$id")
                        }
                        songList.add(item)
                    }
                }
            } catch (e: Exception) {
                Log.e("AndroidBridge", "Error querying MediaStore", e)
            }

            return JSONArray(songList).toString()
        }
    }
}
