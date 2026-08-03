import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Key, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { networkService } from '../services/networkService';
import { Device } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceFound: (device: Device) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onDeviceFound,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanningActive, setScanningActive] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen && scanningActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or not available
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, scanningActive]);

  if (!isOpen) return null;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length < 6) {
      setError('Please enter a 6-digit connection PIN');
      return;
    }

    setLoading(true);
    setError(null);

    const device = await networkService.resolveCode(pinInput.trim());
    setLoading(false);

    if (device) {
      onDeviceFound(device);
      onClose();
    } else {
      setError('No nearby device found with this connection code.');
    }
  };

  const simulateScanSuccess = () => {
    // Simulate camera detecting a nearby device QR
    setLoading(true);
    setTimeout(async () => {
      const code = '839210';
      const dev = await networkService.resolveCode(code);
      setLoading(false);
      if (dev) {
        onDeviceFound(dev);
        onClose();
      } else {
        onDeviceFound({
          id: 'sim-scanned-iphone',
          name: 'Scanned iPhone 15',
          os: 'ios',
          ip: '192.168.1.108',
          signalStrength: 96,
          status: 'online',
          lastSeen: Date.now(),
        });
        onClose();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 mb-2">
            <Camera size={13} /> Scan or Enter PIN
          </span>
          <h3 className="text-xl font-bold text-white">Connect Nearby Device</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Point camera at sender’s QR code or enter their 6-digit connection PIN.
          </p>
        </div>

        {/* Camera Scanner Simulation View */}
        <div className="relative w-full h-48 rounded-xl bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center mb-5 group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scanner Overlay Box */}
          <div className="absolute inset-0 border-2 border-red-500/40 rounded-xl pointer-events-none flex items-center justify-center">
            <div className="w-36 h-36 border-2 border-red-500 rounded-lg relative animate-pulse">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500 -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500 -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 -mb-1 -mr-1" />
            </div>
          </div>

          <button
            onClick={simulateScanSuccess}
            className="absolute bottom-3 bg-zinc-900/90 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 transition-all shadow-lg flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Test Simulate QR Scan
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-400 font-medium">or enter code</span>
          </div>
        </div>

        {/* PIN Code Form */}
        <form onSubmit={handlePinSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">6-Digit Connection PIN</label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 839210"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-red-500 transition-all"
              />
              <Key size={18} className="absolute right-3.5 top-3.5 text-zinc-400" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pinInput.length < 6}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-98"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Connect to Device
          </button>
        </form>
      </div>
    </div>
  );
};
