import React from 'react';
import { TransferSession } from '../types';
import { formatBytes, formatSpeed, formatDuration } from '../utils/formatters';
import { DeviceBadge } from './DeviceBadge';
import {
  Pause,
  Play,
  XCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Download,
} from 'lucide-react';

interface TransferModalProps {
  session: TransferSession | null;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  session,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onClose,
}) => {
  if (!session) return null;

  const isCompleted = session.status === 'completed';
  const isFailed = session.status === 'failed';
  const isCancelled = session.status === 'cancelled';
  const isPaused = session.status === 'paused';
  const isTransferring = session.status === 'transferring' || session.status === 'accepted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-lg rounded-[32px] bg-[#1A1A1A] border border-white/10 p-6 sm:p-8 shadow-2xl">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946]">
              <Zap size={20} className={isTransferring ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {isCompleted
                  ? 'Transfer Complete!'
                  : isCancelled
                  ? 'Transfer Cancelled'
                  : isFailed
                  ? 'Transfer Failed'
                  : isPaused
                  ? 'Transfer Paused'
                  : 'Live Peer Transfer'}
              </h3>
              <p className="text-xs text-white/40">
                Session ID: <span className="font-mono text-white/70">{session.id.slice(0, 12)}</span>
              </p>
            </div>
          </div>

          <span
            className={`px-3.5 py-1 rounded-full text-xs font-bold ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isPaused
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : isCancelled || isFailed
                ? 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20'
                : 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30 animate-pulse'
            }`}
          >
            {session.status.toUpperCase()}
          </span>
        </div>

        {/* Sender -> Receiver Badges */}
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 p-3.5 rounded-2xl bg-zinc-950/80 border border-white/5 mb-6">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
              Sender
            </span>
            <DeviceBadge device={session.senderDevice} compact />
          </div>

          <div className="flex items-center justify-center p-2 rounded-full bg-zinc-900 border border-white/10 text-[#E63946]">
            <ArrowRight size={16} />
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
              Receiver
            </span>
            <DeviceBadge device={session.receiverDevice} compact />
          </div>
        </div>

        {/* Live Speed & Progress Section */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-black text-white font-mono">
                {Math.round(session.progress)}%
              </span>
              <span className="text-xs text-white/40 ml-2 font-mono">
                {formatBytes(session.transferredBytes)} / {formatBytes(session.totalSize)}
              </span>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-[#E63946] font-mono">
                {formatSpeed(session.speedBytesPerSec)}
              </div>
              <div className="text-xs text-white/40">
                {formatDuration(session.remainingSeconds)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-4 rounded-full bg-zinc-950 overflow-hidden border border-white/10 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isPaused
                  ? 'bg-amber-500'
                  : isFailed || isCancelled
                  ? 'bg-[#E63946]'
                  : 'bg-gradient-to-r from-[#E63946] via-red-500 to-amber-500 animate-pulse'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, session.progress))}%` }}
            />
          </div>
        </div>

        {/* Files Checklist */}
        <div className="mb-6">
          <div className="text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
            Transferring Files ({session.files.length})
          </div>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {session.files.map((file, idx) => (
              <div
                key={file.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : isFailed ? (
                    <AlertTriangle size={16} className="text-[#E63946] shrink-0" />
                  ) : (
                    <Zap size={16} className="text-[#E63946] shrink-0" />
                  )}
                  <span className="font-semibold text-white truncate">{file.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/40 font-mono shrink-0">
                    {formatBytes(file.size)}
                  </span>
                  {file.blobUrl && isCompleted && (
                    <a
                      href={file.blobUrl}
                      download={file.name}
                      className="p-1.5 rounded-xl bg-[#E63946]/20 text-[#E63946] hover:bg-[#E63946] hover:text-white transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-between text-xs text-white/40 mb-6 bg-zinc-950/60 p-3 rounded-2xl border border-white/5">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck size={14} /> AES-256 E2E Encrypted
          </span>
          <span className="text-white/40">Direct Socket Stream</span>
        </div>

        {/* Controls Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          {isTransferring && (
            <>
              <button
                onClick={onPause}
                className="py-3 px-4 rounded-2xl font-bold text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Pause size={15} /> Pause
              </button>
              <button
                onClick={onCancel}
                className="py-3 px-4 rounded-2xl font-bold text-xs bg-[#E63946]/10 hover:bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle size={15} /> Cancel
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={onResume}
                className="py-3 px-4 rounded-2xl font-bold text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play size={15} /> Resume
              </button>
              <button
                onClick={onCancel}
                className="py-3 px-4 rounded-2xl font-bold text-xs bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle size={15} /> Cancel
              </button>
            </>
          )}

          {(isFailed || isCancelled) && (
            <>
              <button
                onClick={onRetry}
                className="py-3 px-5 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] text-white flex items-center gap-1.5 shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all cursor-pointer"
              >
                <RefreshCw size={15} /> Retry Transfer
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-2xl font-bold text-xs bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-all cursor-pointer"
              >
                Close
              </button>
            </>
          )}

          {isCompleted && (
            <button
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all cursor-pointer"
            >
              Done & Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
