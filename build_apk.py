import os
import zipfile
import hashlib
import base64
import struct
from datetime import datetime, timezone, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import pkcs7

from sign_v2 import generate_key_and_cert, sign_apk_v2

def build_sora_apk():
    template_apk_path = "template.apk"
    dist_dir = "dist"
    output_apk_path = "Sora.apk"
    
    if not os.path.exists(template_apk_path):
        raise FileNotFoundError(f"{template_apk_path} not found")
        
    print("Reading dist assets...")
    dist_files = {}
    for root, _, files in os.walk(dist_dir):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, dist_dir).replace('\\', '/')
            with open(full_path, 'rb') as fp:
                dist_files[rel_path] = fp.read()
                
    print(f"Loaded {len(dist_files)} files from {dist_dir}")
    
    # Custom settings.json for Sora
    settings_json = b'''{
  "sites": [
    {
      "url": "https://appassets.androidplatform.net/sites/local/index.html",
      "title": "Sora"
    }
  ],
  "local_sites": true,
  "remote_debug": true,
  "web_settings": {
    "JavaScriptEnabled": true
  },
  "source": "assets",
  "timestamp": "2026-10-17T12:00:00Z"
}'''

    config_json = b'''{
  "sites": {
    "local/index.html": "Sora"
  },
  "bundles": [],
  "prefix": "https://appassets.androidplatform.net/sites/"
}'''

    entries = {}
    with zipfile.ZipFile(template_apk_path, 'r') as zin:
        for item in zin.infolist():
            # Skip old signatures and demo web content
            if item.filename.startswith("META-INF/") and (
                item.filename.endswith(".SF") or 
                item.filename.endswith(".RSA") or 
                item.filename.endswith(".DSA") or 
                item.filename.endswith(".MF")
            ):
                continue
            if item.filename.startswith("assets/demo/") or item.filename.startswith("assets/local/"):
                continue
            data = zin.read(item.filename)
            
            # Patch resources.arsc in-place to change "My WebView" -> "Sora"
            if item.filename == "resources.arsc":
                old_bytes = b'\n\nMy WebView\x00'
                new_bytes = b'\x04\x04Sora\x00' + b'\x00' * (len(old_bytes) - 7)
                idx = data.find(old_bytes)
                if idx != -1:
                    data = data[:idx] + new_bytes + data[idx+len(old_bytes):]
                    print("Patched app name to 'Sora' in resources.arsc!")
            
            entries[item.filename] = data

    # Insert Sora dist files into assets/local/
    for rel_path, content in dist_files.items():
        apk_target = f"assets/local/{rel_path}"
        entries[apk_target] = content
        
    entries["assets/settings.json"] = settings_json
    entries["assets/local/config.json"] = config_json

    print("Generating RSA key and self-signed certificate...")
    private_key, cert = generate_key_and_cert()
    
    # 1. Create META-INF/MANIFEST.MF
    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Sora Android Builder)"
    ]
    
    entry_hashes = {}
    for name in sorted(entries.keys()):
        data = entries[name]
        h = hashlib.sha256(data).digest()
        h_b64 = base64.b64encode(h).decode('ascii')
        entry_hashes[name] = h_b64
        manifest_lines.append("")
        manifest_lines.append(f"Name: {name}")
        manifest_lines.append(f"SHA-256-Digest: {h_b64}")
        
    manifest_bytes = "\r\n".join(manifest_lines).encode('utf-8') + b"\r\n"
    entries["META-INF/MANIFEST.MF"] = manifest_bytes
    
    # 2. Create META-INF/CERT.SF
    manifest_sha256 = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode('ascii')
    cert_sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Sora Android Builder)",
        f"SHA-256-Digest-Manifest: {manifest_sha256}"
    ]
    
    for name in sorted(entry_hashes.keys()):
        section = f"Name: {name}\r\nSHA-256-Digest: {entry_hashes[name]}\r\n\r\n".encode('utf-8')
        s_hash = base64.b64encode(hashlib.sha256(section).digest()).decode('ascii')
        cert_sf_lines.append("")
        cert_sf_lines.append(f"Name: {name}")
        cert_sf_lines.append(f"SHA-256-Digest: {s_hash}")
        
    cert_sf_bytes = "\r\n".join(cert_sf_lines).encode('utf-8') + b"\r\n"
    entries["META-INF/CERT.SF"] = cert_sf_bytes
    
    # 3. Create META-INF/CERT.RSA
    signature = (
        pkcs7.PKCS7SignatureBuilder()
        .set_data(cert_sf_bytes)
        .add_signer(cert, private_key, hashes.SHA256())
        .add_certificate(cert)
        .sign(serialization.Encoding.DER, [pkcs7.PKCS7Options.DetachedSignature, pkcs7.PKCS7Options.Binary])
    )
    entries["META-INF/CERT.RSA"] = signature
    
    # Build v1 signed zip bytes
    import io
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for sig_file in ["META-INF/MANIFEST.MF", "META-INF/CERT.SF", "META-INF/CERT.RSA"]:
            zout.writestr(sig_file, entries[sig_file])
            
        for name, data in entries.items():
            if name.startswith("META-INF/"):
                continue
            zout.writestr(name, data)
            
    v1_signed_apk_bytes = zip_buffer.getvalue()

    # 4. Now apply APK Signature Scheme v2 (mandatory for Android 11, 12, 13, 14, 15)
    print("Applying APK Signature Scheme v2 block...")
    v2_signed_apk_bytes = sign_apk_v2(v1_signed_apk_bytes, private_key, cert)

    with open(output_apk_path, 'wb') as fp:
        fp.write(v2_signed_apk_bytes)
            
    apk_size = os.path.getsize(output_apk_path)
    print(f"Success! {output_apk_path} created ({apk_size / 1024 / 1024:.2f} MB)")
    
    # Verify with apksigcopier
    import apksigcopier
    sig = apksigcopier.extract_v2_sig(output_apk_path)
    print("APK v2 Signature verified successfully:", sig is not None)

if __name__ == '__main__':
    build_sora_apk()
