import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ShieldCheck, Key } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  deviceName: string;
  payloadUrl?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  code,
  deviceName,
  payloadUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = payloadUrl || `${window.location.origin}?connectCode=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#1A1A1A] border border-white/10 p-6 sm:p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-3">
            <Key size={13} /> Pair Device
          </span>
          <h3 className="text-xl font-bold text-white">{deviceName}</h3>
          <p className="text-xs text-white/40 mt-1">
            Scan this QR code with another device camera or DropLink app to pair instantly.
          </p>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="my-5 p-4 bg-white rounded-3xl shadow-2xl inline-block mx-auto border-4 border-[#E63946]/20">
          <QRCodeSVG
            value={shareUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* 6-Digit PIN Display */}
        <div className="mb-5 p-3.5 rounded-2xl bg-zinc-950/80 border border-white/5">
          <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">
            Connection PIN Code
          </div>
          <div className="text-2xl font-mono font-black tracking-widest text-[#E63946]">
            {code}
          </div>
        </div>

        {/* E2E Security Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold mb-5 bg-emerald-500/10 py-2.5 rounded-2xl border border-emerald-500/20">
          <ShieldCheck size={15} />
          <span>AES-256 Encrypted Local Handshake</span>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all cursor-pointer active:scale-98"
        >
          {copied ? (
            <>
              <Check size={16} /> Link Copied to Clipboard
            </>
          ) : (
            <>
              <Copy size={16} /> Copy Pair Link
            </>
          )}
        </button>
      </div>
    </div>
  );
};
