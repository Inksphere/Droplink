export type DeviceOS = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';

export type FileCategory = 'image' | 'video' | 'document' | 'audio' | 'folder' | 'app' | 'other';

export interface Device {
  id: string;
  name: string;
  os: DeviceOS;
  ip: string;
  signalStrength: number; // 0 - 100
  status: 'online' | 'busy' | 'offline';
  avatar?: string;
  isSelf?: boolean;
  lastSeen: number;
  connectionCode?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: FileCategory;
  mimeType: string;
  blobUrl?: string;
  dataUrl?: string;
  fileObject?: File;
  relativePath?: string;
}

export type TransferStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'transferring' | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TransferSession {
  id: string;
  code: string;
  senderDevice: Device;
  receiverDevice: Device;
  files: FileItem[];
  totalSize: number;
  status: TransferStatus;
  progress: number; // 0 - 100
  transferredBytes: number;
  speedBytesPerSec: number;
  remainingSeconds: number;
  startTime?: number;
  isEncrypted: boolean;
  activeFileIndex?: number;
}

export interface HistoryRecord {
  id: string;
  sessionId: string;
  direction: 'sent' | 'received';
  senderName: string;
  senderOs: DeviceOS;
  receiverName: string;
  receiverOs: DeviceOS;
  files: {
    id: string;
    name: string;
    size: number;
    type: FileCategory;
    blobUrl?: string;
  }[];
  totalSize: number;
  timestamp: number;
  status: 'completed' | 'cancelled' | 'failed';
}

export interface AppSettings {
  theme: 'dark' | 'light';
  deviceName: string;
  deviceOS: DeviceOS;
  saveLocation: string;
  language: string;
  encryptionEnabled: boolean;
  soundEnabled: boolean;
  autoAcceptKnown: boolean;
}
