import React, { useState } from 'react';
import { HistoryRecord, FileCategory } from '../types';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  History,
  Send,
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  FileCheck,
} from 'lucide-react';

interface HistoryScreenProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onClearHistory,
}) => {
  const [directionFilter, setDirectionFilter] = useState<'all' | 'sent' | 'received'>('all');

  const filteredHistory =
    directionFilter === 'all'
      ? history
      : history.filter((item) => item.direction === directionFilter);

  const totalSentBytes = history
    .filter((h) => h.direction === 'sent')
    .reduce((sum, h) => sum + h.totalSize, 0);

  const totalReceivedBytes = history
    .filter((h) => h.direction === 'received')
    .reduce((sum, h) => sum + h.totalSize, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* History Stats Header */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <History size={22} className="text-[#E63946]" /> Transfer History
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Logs of all files transferred locally between devices.
          </p>
        </div>

        {/* Total Data Transfer Summary Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/5 text-xs">
            <span className="text-white/40 block text-[10px] font-bold">TOTAL SENT</span>
            <span className="font-mono font-black text-[#E63946]">{formatBytes(totalSentBytes)}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/5 text-xs">
            <span className="text-white/40 block text-[10px] font-bold">TOTAL RECEIVED</span>
            <span className="font-mono font-black text-emerald-400">{formatBytes(totalReceivedBytes)}</span>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5 text-white/40 hover:text-[#E63946] hover:bg-white/5 transition-all cursor-pointer"
              title="Clear all history"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'sent', 'received'] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => setDirectionFilter(dir)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer ${
              directionFilter === dir
                ? 'bg-[#E63946] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]'
                : 'bg-[#1A1A1A] border border-white/5 text-white/40 hover:text-white'
            }`}
          >
            {dir === 'all' ? 'All Transfers' : dir}
          </button>
        ))}
      </div>

      {/* Records List */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center rounded-[32px] bg-[#1A1A1A] border border-white/5 text-white/30 text-sm shadow-xl">
          No transfer records found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const isSent = item.direction === 'sent';
            return (
              <div
                key={item.id}
                className="p-6 rounded-[32px] bg-[#1A1A1A] border border-white/5 hover:border-white/10 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-2xl text-xs ${
                        isSent
                          ? 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isSent ? <Send size={16} /> : <Download size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {isSent ? `Sent to ${item.receiverName}` : `Received from ${item.senderName}`}
                      </h4>
                      <p className="text-[11px] text-white/40">
                        {formatDate(item.timestamp)} • {item.files.length} file(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white font-black">
                      {formatBytes(item.totalSize)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {item.status}
                    </span>
                  </div>
                </div>

                {/* File List Items */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  {item.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <FileText size={15} className="text-[#E63946] shrink-0" />
                        <span className="text-white/90 font-medium truncate">{file.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white/40 font-mono text-[11px]">
                          {formatBytes(file.size)}
                        </span>
                        {file.blobUrl && (
                          <a
                            href={file.blobUrl}
                            download={file.name}
                            className="p-1.5 rounded-xl bg-[#E63946]/20 text-[#E63946] hover:bg-[#E63946] hover:text-white transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <Download size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
