import { DeviceOS, FileCategory } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '0 MB/s';
  const mbps = bytesPerSec / (1024 * 1024);
  if (mbps < 0.1) {
    const kbps = bytesPerSec / 1024;
    return `${kbps.toFixed(1)} KB/s`;
  }
  return `${mbps.toFixed(1)} MB/s`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return 'Calculating...';
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s left`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins}m ${secs}s left`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function generateConnectionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSessionId(): string {
  return 'dl-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

export function getOSLabel(os: DeviceOS): string {
  switch (os) {
    case 'android':
      return 'Android';
    case 'ios':
      return 'iPhone (iOS)';
    case 'windows':
      return 'Windows PC';
    case 'macos':
      return 'macOS';
    case 'linux':
      return 'Linux';
    case 'web':
      return 'Web Browser';
    default:
      return 'Device';
  }
}

export function detectDeviceOS(): DeviceOS {
  if (typeof navigator === 'undefined') return 'windows';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  if (ua.includes('win')) return 'windows';
  return 'web';
}

export function getFileCategory(filename: string, mimeType?: string): FileCategory {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext) || mimeType?.startsWith('image/')) {
    return 'image';
  }
  if (['mp4', 'mkv', 'webm', 'mov', 'avi', 'wmv'].includes(ext) || mimeType?.startsWith('video/')) {
    return 'video';
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'md'].includes(ext) || mimeType?.startsWith('text/')) {
    return 'document';
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext) || mimeType?.startsWith('audio/')) {
    return 'audio';
  }
  if (['apk', 'aab'].includes(ext) || mimeType?.includes('android.package-archive')) {
    return 'app';
  }
  if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) {
    return 'folder';
  }
  return 'other';
}
