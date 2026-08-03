import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Device } from '../types';
import { networkService } from '../services/networkService';
import { Radio, Key, ShieldCheck, QrCode, Smartphone, Wifi, CheckCircle2 } from 'lucide-react';

interface ReceiveScreenProps {
  selfDevice: Device;
  onOpenScanner: () => void;
}

export const ReceiveScreen: React.FC<ReceiveScreenProps> = ({
  selfDevice,
  onOpenScanner,
}) => {
  const connectionCode = networkService.getConnectionCode();
  const shareUrl = `${window.location.origin}?connectCode=${connectionCode}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Waiting Radar Screen Header */}
      <div className="text-center p-8 sm:p-10 rounded-[40px] bg-[#1A1A1A] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Listening Pulse */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-30" />
          <span className="animate-pulse absolute inline-flex h-20 w-20 rounded-full bg-[#E63946] opacity-20" />
          <div className="relative z-10 w-20 h-20 bg-[#E63946] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(230,57,70,0.5)] border-4 border-[#111111]">
            <Radio size={34} className="text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Waiting for Incoming Files...
        </h2>
        <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
          This device is visible as <strong className="text-white font-semibold">{selfDevice.name}</strong> on your local mesh network.
        </p>

        {/* Connection Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
          <Wifi size={14} /> Ready on Local Network ({selfDevice.ip})
        </div>
      </div>

      {/* QR Code & Connection PIN Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* QR Code Frame */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 text-center flex flex-col items-center justify-between shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2 mb-1">
              <QrCode size={18} className="text-[#E63946]" /> Receiver QR Code
            </h3>
            <p className="text-xs text-white/40 mb-5">
              Sender can scan this QR code with their camera to connect.
            </p>
          </div>

          <div className="p-4 bg-white rounded-3xl shadow-2xl my-2 inline-block border-4 border-[#E63946]/20">
            <QRCodeSVG value={shareUrl} size={160} level="H" />
          </div>

          <div className="text-[11px] text-white/40 mt-3 font-mono">
            {selfDevice.name} • {selfDevice.os.toUpperCase()}
          </div>
        </div>

        {/* Connection PIN Frame */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Key size={18} className="text-[#E63946]" /> 6-Digit Receiver PIN
            </h3>
            <p className="text-xs text-white/40 mb-5">
              Share this PIN code with the sender device.
            </p>

            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/5 text-center my-4">
              <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
                Your Connection Code
              </div>
              <div className="text-3xl font-mono font-black text-[#E63946] tracking-widest">
                {connectionCode}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Receiver approval required before transfer starts.</span>
            </div>

            <button
              onClick={onOpenScanner}
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Scan Sender Code Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
