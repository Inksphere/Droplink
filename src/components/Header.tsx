import React from 'react';
import { AppSettings, Device } from '../types';
import { Network, Sun, Moon, ShieldCheck, Zap, Key } from 'lucide-react';
import { networkService } from '../services/networkService';
import { PwaInstallPrompt } from './PwaInstallPrompt';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  selfDevice: Device;
  onlinePeersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  selfDevice,
  onlinePeersCount,
}) => {
  const isDark = settings.theme === 'dark';
  const connectionCode = networkService.getConnectionCode();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#111111]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E63946] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(230,57,70,0.4)] text-white shrink-0">
            <Zap size={22} className="fill-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              DropLink
            </h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
              Secure P2P Mesh
            </p>
          </div>
        </div>

        {/* Network Status & Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* PWA Install Button Prompt */}
          <PwaInstallPrompt />

          {/* Connection PIN Badge */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-white/80">
            <Key size={13} className="text-[#E63946]" />
            <span className="text-white/40 font-semibold">My PIN:</span>
            <span className="font-mono font-bold text-white tracking-widest">{connectionCode}</span>
          </div>

          {/* Network Badge */}
          <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 text-xs">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-white/70 hidden sm:inline">
              Local Network
            </span>
            <span className="text-white/40 text-[11px] font-mono">
              ({onlinePeersCount} active)
            </span>
          </div>

          {/* E2E Shield */}
          <div
            title="AES-256 E2E Encryption Enabled"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold"
          >
            <ShieldCheck size={14} />
            <span className="hidden lg:inline">Encrypted</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => onUpdateSettings({ theme: isDark ? 'light' : 'dark' })}
            className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
