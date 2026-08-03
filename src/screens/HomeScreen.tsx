import React, { useState } from 'react';
import { TabType } from '../components/Navigation';
import { Device, HistoryRecord } from '../types';
import { DeviceBadge } from '../components/DeviceBadge';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  Send,
  Download,
  QrCode,
  History,
  Zap,
  ShieldCheck,
  Smartphone,
  Laptop,
  ArrowRight,
  Key,
  Radio,
} from 'lucide-react';
import { networkService } from '../services/networkService';

interface HomeScreenProps {
  onNavigate: (tab: TabType) => void;
  discoveredDevices: Device[];
  history: HistoryRecord[];
  onOpenQR: () => void;
  onOpenScanner: () => void;
  onSelectDeviceToSend: (device: Device) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  discoveredDevices,
  history,
  onOpenQR,
  onOpenScanner,
  onSelectDeviceToSend,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  const selfDevice = networkService.getSelfDevice();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length < 6) return;

    setPinLoading(true);
    setPinError(null);

    const dev = await networkService.resolveCode(pinInput.trim());
    setPinLoading(false);

    if (dev) {
      onSelectDeviceToSend(dev);
    } else {
      setPinError('No nearby device found with this PIN code.');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Immersive UI Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Sidebar Action Cards (Send, Receive, QR, History) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Send Card */}
          <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded-[32px] border border-white/5 flex flex-col justify-between min-h-[220px] relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Send size={100} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">Send</h2>
              <p className="text-white/40 text-sm">Broadcast files to devices in your vicinity.</p>
            </div>
            <button
              onClick={() => onNavigate('send')}
              className="w-full mt-6 bg-[#E63946] py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg text-white shadow-[0_10px_30px_rgba(230,57,70,0.3)] hover:bg-[#ff4d5a] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send size={20} /> Select Assets
            </button>
          </div>

          {/* Quick Actions Grid: Receive & Pairing */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate('receive')}
              className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 flex flex-col justify-between items-start hover:border-white/20 transition-all cursor-pointer group shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Download size={22} className="text-white/80" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Receive</p>
                <h3 className="text-lg font-bold text-white">Waiting...</h3>
              </div>
            </div>

            <div
              onClick={onOpenScanner}
              className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 flex flex-col justify-between items-start hover:border-white/20 transition-all cursor-pointer group shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode size={22} className="text-white/80" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Pairing</p>
                <h3 className="text-lg font-bold text-white">Scan QR</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Radar / Discovery Mesh Card */}
        <div className="lg:col-span-7 bg-[#1A1A1A] rounded-[32px] sm:rounded-[40px] border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[420px] shadow-2xl">
          {/* Radar Background Effects */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[500px] h-[500px] border border-white/5 rounded-full absolute" />
            <div className="w-[340px] h-[340px] border border-white/5 rounded-full absolute" />
            <div className="w-[180px] h-[180px] border border-white/5 rounded-full absolute" />
            {/* Scanner Sweep */}
            <div className="w-[280px] h-[280px] bg-gradient-to-tr from-[#E63946]/20 to-transparent rounded-full rotate-45 absolute animate-spin duration-[8000ms]" />
          </div>

          <div className="relative z-10 p-8 flex flex-col items-center justify-center flex-1 text-center my-6">
            {/* Center Pulsing Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#E63946] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(230,57,70,0.5)] z-20 border-4 border-[#111111] mb-5">
              <Radio size={36} className="text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Discovery Mesh Active</h3>
            <p className="text-white/40 text-xs sm:text-sm max-w-sm mb-6">
              Searching for nearby nodes on your local network.
            </p>

            {/* Render Discovered Devices as floating nodes if available */}
            {discoveredDevices.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-3 max-w-md">
                {discoveredDevices.slice(0, 4).map((device) => (
                  <div
                    key={device.id}
                    onClick={() => onSelectDeviceToSend(device)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-105 transition-all cursor-pointer shadow-lg"
                  >
                    <DeviceBadge device={device} size="sm" />
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Listening for incoming peer connections...
              </div>
            )}
          </div>

          {/* Footer status bar inside Discovery Card */}
          <div className="p-5 sm:p-6 bg-white/5 border-t border-white/10 backdrop-blur-xl relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Zap size={20} className="text-[#E63946]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Local Mesh Protocol v2.4</p>
                <p className="text-[11px] text-white/50">Direct WebRTC DataChannels</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('nearby')}
              className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              View Full Radar ({discoveredDevices.length}) <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Discovered Devices & PIN Pairing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PIN Code Pairing */}
        <div className="lg:col-span-5 bg-[#1A1A1A] p-6 sm:p-8 rounded-[32px] border border-white/5 shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-white font-bold text-base">
            <Key size={18} className="text-[#E63946]" /> Pair by 6-Digit PIN
          </div>
          <p className="text-xs text-white/40 mb-5">
            Enter the receiver's connection PIN to initiate encrypted session.
          </p>

          <form onSubmit={handlePinSubmit} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 482910"
              className="flex-1 px-4 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 text-white font-mono text-center tracking-widest text-base focus:outline-none focus:border-[#E63946] transition-all"
            />
            <button
              type="submit"
              disabled={pinLoading || pinInput.length < 6}
              className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-[#E63946] hover:bg-[#ff4d5a] disabled:opacity-50 text-white shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all cursor-pointer"
            >
              {pinLoading ? 'Connecting...' : 'Connect'}
            </button>
          </form>
          {pinError && <p className="text-xs text-red-400 mt-2.5">{pinError}</p>}
        </div>

        {/* Self Profile Status Card */}
        <div className="lg:col-span-7 bg-[#1A1A1A] p-6 sm:p-8 rounded-[32px] border border-white/5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
              This Device Profile
            </div>
            <DeviceBadge device={selfDevice} size="lg" />
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/60">
            <span>
              Your PIN: <strong className="text-white font-mono text-sm ml-1">{selfDevice.connectionCode || networkService.getConnectionCode()}</strong>
            </span>
            <button
              onClick={onOpenQR}
              className="text-[#E63946] hover:text-red-400 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              Show QR <QrCode size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent History Preview */}
      {history.length > 0 && (
        <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded-[32px] border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-white/40 hover:text-white transition-colors"
            >
              View History ({history.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/60 border border-white/5 text-xs"
              >
                <div>
                  <div className="font-bold text-white">
                    {item.direction === 'sent' ? `Sent to ${item.receiverName}` : `Received from ${item.senderName}`}
                  </div>
                  <div className="text-white/40 text-[11px] mt-0.5">
                    {item.files.length} file(s) • {formatBytes(item.totalSize)} • {formatDate(item.timestamp)}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
