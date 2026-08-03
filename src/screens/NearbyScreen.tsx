import React, { useState } from 'react';
import { Device } from '../types';
import { DeviceBadge } from '../components/DeviceBadge';
import { Radio, Send, RefreshCw, Key, Wifi, ShieldCheck } from 'lucide-react';
import { networkService } from '../services/networkService';

interface NearbyScreenProps {
  discoveredDevices: Device[];
  onSelectDeviceToSend: (device: Device) => void;
  onOpenScanner: () => void;
}

export const NearbyScreen: React.FC<NearbyScreenProps> = ({
  discoveredDevices,
  onSelectDeviceToSend,
  onOpenScanner,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length < 6) return;

    setSearching(true);
    setError(null);

    const dev = await networkService.resolveCode(pinInput.trim());
    setSearching(false);

    if (dev) {
      onSelectDeviceToSend(dev);
    } else {
      setError('No device found with this PIN code on local network.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Radar Discovery Header */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 mb-2">
            <Radio size={14} className="animate-pulse" /> Live Local Discovery
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Discovered Devices on Network</h2>
          <p className="text-xs text-white/40 mt-0.5">
            Automatic zero-configuration device discovery across iOS, Android, Windows, Mac & Linux.
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="py-3 px-5 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Key size={14} /> Scan / Enter PIN Code
        </button>
      </div>

      {/* Device List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discoveredDevices.map((device) => (
          <div
            key={device.id}
            className="p-6 rounded-[32px] bg-[#1A1A1A] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-950/80 text-white/60 border border-white/5 font-bold">
                  PIN: {device.connectionCode || '839210'}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                  <Wifi size={12} /> {device.signalStrength || 95}%
                </span>
              </div>

              <DeviceBadge device={device} size="lg" />
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-white/40 font-mono">
                {device.ip || '192.168.1.100'}
              </span>

              <button
                onClick={() => onSelectDeviceToSend(device)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[#E63946] hover:bg-[#ff4d5a] text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(230,57,70,0.3)] transition-all cursor-pointer active:scale-98"
              >
                <Send size={13} /> Send Files
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual PIN Search Box */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1">Manual Device Pairing</h3>
        <p className="text-xs text-white/40 mb-5">
          Can’t see your device above? Enter the receiver's 6-digit connection PIN code directly.
        </p>

        <form onSubmit={handleManualConnect} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit PIN code (e.g. 482910)"
            className="flex-1 px-4 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-[#E63946] transition-all"
          />
          <button
            type="submit"
            disabled={searching || pinInput.length < 6}
            className="py-3 px-6 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] disabled:opacity-50 text-white shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {searching ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
            Connect Device
          </button>
        </form>

        {error && <p className="text-xs text-red-400 mt-2.5">{error}</p>}
      </div>
    </div>
  );
};
