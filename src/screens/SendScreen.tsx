import React, { useState, useRef } from 'react';
import { Device, FileCategory, FileItem } from '../types';
import { DeviceBadge } from '../components/DeviceBadge';
import { formatBytes, getFileCategory } from '../utils/formatters';
import { getPresetSampleFiles, createSampleFile } from '../utils/sampleFiles';
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  FolderArchive,
  Smartphone,
  Trash2,
  Send,
  Plus,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Zap,
} from 'lucide-react';

interface SendScreenProps {
  discoveredDevices: Device[];
  selectedTargetDevice: Device | null;
  onSelectTargetDevice: (device: Device | null) => void;
  onStartTransfer: (targetDevice: Device, files: FileItem[]) => void;
  onOpenQR: () => void;
}

export const SendScreen: React.FC<SendScreenProps> = ({
  discoveredDevices,
  selectedTargetDevice,
  onSelectTargetDevice,
  onStartTransfer,
  onOpenQR,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalSize = selectedFiles.reduce((sum, f) => sum + (f.size || 0), 0);

  const categories = [
    { id: 'all', label: 'All Files', icon: FileText },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'folder', label: 'Folders', icon: FolderArchive },
    { id: 'app', label: 'Apps (Android)', icon: Smartphone },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files) as File[];
    const newFiles: FileItem[] = filesArray.map((file: File) => {
      const category = getFileCategory(file.name, file.type);
      return {
        id: 'file-' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: category,
        mimeType: file.type || 'application/octet-stream',
        blobUrl: URL.createObjectURL(file),
        fileObject: file,
      };
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleAddSampleFiles = () => {
    const presets = getPresetSampleFiles();
    setSelectedFiles((prev) => [...prev, ...presets]);
  };

  const handleAddApkPackage = () => {
    const apk = createSampleFile(
      'DropLink_v2.4_Android_Release.apk',
      32.8 * 1024 * 1024,
      'application/vnd.android.package-archive',
      'Android APK binary simulator payload'
    );
    setSelectedFiles((prev) => [...prev, apk]);
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSend = () => {
    if (!selectedTargetDevice) return;
    if (selectedFiles.length === 0) return;
    onStartTransfer(selectedTargetDevice, selectedFiles);
  };

  const filteredFiles =
    activeCategory === 'all'
      ? selectedFiles
      : selectedFiles.filter((f) => f.type === activeCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as FileCategory | 'all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon size={15} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main File Picker Drag & Drop Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-white/10 hover:border-[#E63946]/50 rounded-[32px] p-8 text-center bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] shadow-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={26} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Click or Drag Files to Upload
            </h3>
            <p className="text-xs text-white/40 max-w-sm mb-5">
              Select Photos, Videos, Documents, Audio, Zip Archives, or Android Apps.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#E63946] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:bg-[#ff4d5a] transition-all cursor-pointer"
              >
                Browse Files
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSampleFiles();
                }}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer"
              >
                + Add Preset Test Files
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddApkPackage();
                }}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
              >
                + Add Android APK
              </button>
            </div>
          </div>

          {/* Selected Files List */}
          <div className="p-6 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Selected Files ({selectedFiles.length})
                </h3>
                <span className="text-xs text-white/40">
                  Total Payload Size: <strong className="text-white font-mono">{formatBytes(totalSize)}</strong>
                </span>
              </div>

              {selectedFiles.length > 0 && (
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-xs text-[#E63946] hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Clear All
                </button>
              )}
            </div>

            {filteredFiles.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-xs">
                No files selected yet. Click above to choose files.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <FileText size={18} className="text-[#E63946] shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{file.name}</div>
                        <div className="text-[11px] text-white/40 capitalize">
                          {file.type} • {formatBytes(file.size)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-[#E63946] hover:bg-white/5 transition-all shrink-0 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Recipient Target Selector */}
        <div className="space-y-4">
          <div className="p-6 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Select Recipient</h3>
              <span className="text-[11px] text-white/40">{discoveredDevices.length} available</span>
            </div>

            {discoveredDevices.length === 0 ? (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 text-center text-xs text-white/40">
                No nearby devices detected. Ensure recipient has DropLink open on local network.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {discoveredDevices.map((device) => {
                  const isSelected = selectedTargetDevice?.id === device.id;
                  return (
                    <div
                      key={device.id}
                      onClick={() => onSelectTargetDevice(device)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E63946]/10 border-[#E63946]/50 shadow-md'
                          : 'bg-zinc-950/70 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <DeviceBadge device={device} compact />
                      {isSelected && (
                        <CheckCircle size={16} className="text-[#E63946] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={onOpenQR}
              className="w-full mt-4 py-2.5 px-3 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-white/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <QrCode size={14} className="text-[#E63946]" /> Generate QR / Share Code
            </button>
          </div>

          {/* Security Banner */}
          <div className="p-5 rounded-[24px] bg-[#1A1A1A]/60 border border-white/5 text-xs text-white/50 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck size={16} /> Direct Encrypted Connection
            </div>
            <p className="text-[11px] leading-relaxed">
              Files are streamed peer-to-peer over your local socket connection using AES-256 encryption.
            </p>
          </div>

          {/* Send Action Button */}
          <button
            onClick={handleSend}
            disabled={!selectedTargetDevice || selectedFiles.length === 0}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base bg-[#E63946] hover:bg-[#ff4d5a] disabled:opacity-50 text-white flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(230,57,70,0.3)] transition-all cursor-pointer active:scale-98"
          >
            <Send size={18} />
            Send Files ({selectedFiles.length})
          </button>
        </div>
      </div>
    </div>
  );
};
