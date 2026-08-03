import React, { useState } from 'react';
import { AppSettings, DeviceOS, Device } from '../types';
import { networkService } from '../services/networkService';
import {
  Settings,
  Sun,
  Moon,
  Smartphone,
  Folder,
  Globe,
  ShieldCheck,
  Info,
  Check,
  Save,
  Key,
} from 'lucide-react';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  selfDevice: Device;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  selfDevice,
}) => {
  const [deviceName, setDeviceName] = useState(selfDevice.name);
  const [deviceOS, setDeviceOS] = useState<DeviceOS>(selfDevice.os);
  const [saveLocation, setSaveLocation] = useState(settings.saveLocation);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    networkService.updateSelfDevice(deviceName, deviceOS);
    onUpdateSettings({ deviceName, deviceOS, saveLocation });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const osOptions: { id: DeviceOS; label: string }[] = [
    { id: 'android', label: 'Android Phone / Tablet' },
    { id: 'ios', label: 'iPhone / iPad (iOS)' },
    { id: 'windows', label: 'Windows PC' },
    { id: 'macos', label: 'macOS Laptop / Workstation' },
    { id: 'linux', label: 'Linux OS' },
    { id: 'web', label: 'Web Browser' },
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Application Settings</h2>
          <p className="text-xs text-white/40">
            Customize device identity, save folder, theme preferences, and security options.
          </p>
        </div>
      </div>

      {/* Device Identity Settings Form */}
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
          <Smartphone size={18} className="text-[#E63946]" /> Device Identity & Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white/40 mb-2">
              Device Display Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Alex’s MacBook Pro"
              className="w-full px-4 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/40 mb-2">
              Operating System Profile
            </label>
            <select
              value={deviceOS}
              onChange={(e) => setDeviceOS(e.target.value as DeviceOS)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all"
            >
              {osOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/40 mb-2">
            Default Save Location Directory
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveLocation}
              onChange={(e) => setSaveLocation(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-zinc-950/80 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#E63946] transition-all"
            />
            <button
              type="button"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 transition-all cursor-pointer border border-white/10"
              title="Browse directory"
            >
              <Folder size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check size={14} /> Profile Saved Successfully
            </span>
          )}
          <button
            type="submit"
            className="py-3 px-6 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] text-white flex items-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all cursor-pointer active:scale-98"
          >
            <Save size={15} /> Save Changes
          </button>
        </div>
      </form>

      {/* Theme & Language */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
          <Globe size={18} className="text-[#E63946]" /> Preferences & Appearance
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-white/5">
          <div>
            <div className="font-bold text-white text-sm">Theme Mode</div>
            <div className="text-xs text-white/40">Switch between dark (#111111) and light modes</div>
          </div>
          <button
            onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            {settings.theme === 'dark' ? (
              <>
                <Moon size={15} className="text-indigo-400" /> Dark Mode
              </>
            ) : (
              <>
                <Sun size={15} className="text-amber-400" /> Light Mode
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-white/5">
          <div>
            <div className="font-bold text-white text-sm">Application Language</div>
            <div className="text-xs text-white/40">Select interface language</div>
          </div>
          <select
            value={settings.language}
            onChange={(e) => onUpdateSettings({ language: e.target.value })}
            className="px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#E63946]"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Security Settings */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
          <ShieldCheck size={18} className="text-[#E63946]" /> Security & Encryption
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-white/5">
          <div>
            <div className="font-bold text-white text-sm">AES-256 E2E Encryption</div>
            <div className="text-xs text-white/40">Encrypt file payloads before local peer transfer</div>
          </div>
          <input
            type="checkbox"
            checked={settings.encryptionEnabled}
            onChange={(e) => onUpdateSettings({ encryptionEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#E63946] rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-white/5">
          <div>
            <div className="font-bold text-white text-sm">Receiver Approval Requirement</div>
            <div className="text-xs text-white/40">Prompt receiver popup before accepting incoming transfers</div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Enforced
          </span>
        </div>
      </div>

      {/* About Box */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#1A1A1A] border border-white/5 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Info size={16} className="text-[#E63946]" /> DropLink v2.4.0 (Production Immersive)
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          Cross-platform peer-to-peer offline file sharing engine built with modern WebRTC & WebSockets. Zero cloud storage required. Transmit directly over local WiFi, hotspot, or LAN.
        </p>
      </div>
    </div>
  );
};
