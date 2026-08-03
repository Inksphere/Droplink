import React from 'react';
import { Device, DeviceOS } from '../types';
import { Smartphone, Laptop, Monitor, Globe, Wifi } from 'lucide-react';
import { getOSLabel } from '../utils/formatters';

interface DeviceBadgeProps {
  device: Partial<Device>;
  os?: DeviceOS;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export const DeviceBadge: React.FC<DeviceBadgeProps> = ({
  device,
  os: customOs,
  showStatus = true,
  size = 'md',
  compact = false,
}) => {
  const os = customOs || device.os || 'web';

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
    switch (os) {
      case 'android':
      case 'ios':
        return <Smartphone size={iconSize} className="text-red-500" />;
      case 'macos':
        return <Laptop size={iconSize} className="text-zinc-300" />;
      case 'windows':
        return <Monitor size={iconSize} className="text-sky-400" />;
      case 'linux':
        return <Laptop size={iconSize} className="text-amber-400" />;
      default:
        return <Globe size={iconSize} className="text-emerald-400" />;
    }
  };

  const osBg = {
    android: 'bg-red-500/10 border-red-500/20 text-red-400',
    ios: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    windows: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    macos: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-300',
    linux: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    web: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  }[os] || 'bg-zinc-800 text-zinc-400';

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${osBg}`}>
        {renderIcon()}
        <span>{getOSLabel(os)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`relative p-2.5 rounded-xl border ${osBg} flex items-center justify-center shrink-0`}>
        {renderIcon()}
        {showStatus && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${
              device.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        )}
      </div>

      <div className="min-w-0">
        <h4 className="font-semibold text-white text-sm truncate">{device.name || 'Nearby Device'}</h4>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
          <span>{getOSLabel(os)}</span>
          {device.ip && (
            <>
              <span>•</span>
              <span className="font-mono text-zinc-400">{device.ip}</span>
            </>
          )}
          {device.signalStrength !== undefined && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Wifi size={10} className="text-emerald-400" />
                {device.signalStrength}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
