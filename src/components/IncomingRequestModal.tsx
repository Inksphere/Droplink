import React from 'react';
import { TransferSession } from '../types';
import { DeviceBadge } from './DeviceBadge';
import { formatBytes } from '../utils/formatters';
import { FileText, Check, X, ShieldCheck, Download } from 'lucide-react';

interface IncomingRequestModalProps {
  session: TransferSession | null;
  onAccept: (session: TransferSession) => void;
  onDecline: (session: TransferSession) => void;
}

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({
  session,
  onAccept,
  onDecline,
}) => {
  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md rounded-[32px] bg-[#1A1A1A] border border-[#E63946]/40 p-6 sm:p-8 shadow-2xl text-left border-t-4 border-t-[#E63946]">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
            <Download size={13} className="animate-bounce" /> Incoming File Transfer
          </span>
          <span className="text-[11px] font-mono text-white/40">
            ID: {session.id.slice(0, 10)}
          </span>
        </div>

        {/* Sender Info Badge */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 mb-4">
          <DeviceBadge device={session.senderDevice} />
        </div>

        {/* Requested Files Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-white/40 mb-2">
            <span>FILES TO RECEIVE ({session.files.length})</span>
            <span className="text-white font-mono">{formatBytes(session.totalSize)}</span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {session.files.map((file, idx) => (
              <div
                key={file.id || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <FileText size={15} className="text-[#E63946] shrink-0" />
                  <span className="font-semibold text-white truncate">{file.name}</span>
                </div>
                <span className="text-white/40 font-mono shrink-0">
                  {formatBytes(file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* E2E Security Badge */}
        <div className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 mb-6">
          <ShieldCheck size={18} className="shrink-0" />
          <div>
            <div className="font-bold">Encrypted Direct Transfer</div>
            <div className="text-[11px] text-emerald-400/80">
              No cloud server storage. Files remain 100% private on local network.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onDecline(session)}
            className="py-3.5 px-4 rounded-2xl font-bold text-xs bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <X size={17} /> Decline
          </button>

          <button
            onClick={() => onAccept(session)}
            className="py-3.5 px-4 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all cursor-pointer active:scale-98"
          >
            <Check size={17} /> Accept & Save
          </button>
        </div>
      </div>
    </div>
  );
};
