import React, { useState, useRef } from 'react';
import { Song } from '../types/music';
import { parseAudioFile } from '../services/tagParser';
import { storageService } from '../services/storageService';
import { FolderDown, FileAudio, X, CheckCircle2, Loader2, HardDrive } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongsImported: (newSongs: Song[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSongsImported
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    setImportedCount(null);
    const audioFiles: File[] = [];

    // Filter audio files
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['mp3', 'm4a', 'flac', 'wav', 'aac', 'ogg', 'opus'].includes(ext || '')) {
        audioFiles.push(file);
      }
    }

    if (audioFiles.length === 0) {
      setIsProcessing(false);
      setProgressText('No supported audio files found in selected location.');
      return;
    }

    const parsedSongs: Song[] = [];
    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      setProgressText(`Indexing tags: ${i + 1} of ${audioFiles.length} (${file.name})`);
      try {
        const song = await parseAudioFile(file);
        parsedSongs.push(song);
      } catch (err) {
        console.warn('Failed parsing file', file.name, err);
      }
    }

    // Save to persistent storage
    await storageService.saveSongs(parsedSongs);
    onSongsImported(parsedSongs);
    setIsProcessing(false);
    setImportedCount(parsedSongs.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#1C1C1E] border border-white/12 p-6 shadow-apple-float text-left animate-spring-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FA233B]/10 text-[#FA233B]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Scan Device Music</h3>
              <p className="text-xs text-[#8E8E93]">Load local music into Sora</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-6 space-y-4">
          <p className="text-xs text-white/70 leading-relaxed">
            Choose an audio folder on your Android device (such as <code className="text-[#FA233B]">/Music</code> or <code className="text-[#FA233B]">/Download</code>) or select files directly. Sora extracts ID3 tags and embedded artwork automatically.
          </p>

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-white/5 rounded-2xl border border-white/10">
              <Loader2 className="w-8 h-8 text-[#FA233B] animate-spin" />
              <p className="text-xs text-white font-medium text-center px-4">{progressText}</p>
            </div>
          ) : importedCount !== null ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-sm font-semibold text-white">
                Indexed {importedCount} Songs into Sora!
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-full bg-[#FA233B] text-white text-xs font-bold hover:bg-[#ff3b50] active:scale-95 transition-all shadow-apple-glow"
              >
                Go to Library
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Scan Folder Button */}
              <button
                onClick={() => folderInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all group"
              >
                <FolderDown className="w-8 h-8 text-[#FA233B] mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-semibold text-white">Scan Music Folder</span>
                <span className="text-[10px] text-[#8E8E93] mt-0.5">Whole directory scan</span>
              </button>

              {/* Select Files Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all group"
              >
                <FileAudio className="w-8 h-8 text-white/80 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-semibold text-white">Select Audio Files</span>
                <span className="text-[10px] text-[#8E8E93] mt-0.5">MP3, M4A, FLAC, WAV</span>
              </button>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            type="file"
            ref={folderInputRef}
            /* @ts-expect-error webkitdirectory is standard in Chromium/Android WebViews */
            webkitdirectory="true"
            directory="true"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="audio/*,.mp3,.m4a,.flac,.wav,.aac,.ogg"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8E8E93]">
          <span>Format: MP3, FLAC, M4A, WAV</span>
          <span>100% Offline & Private</span>
        </div>
      </div>
    </div>
  );
};
