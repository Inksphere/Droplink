import React from 'react';
import { Home, Send, Download, Radio, History, Settings } from 'lucide-react';

export type TabType = 'home' | 'send' | 'receive' | 'nearby' | 'history' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingRequestsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingRequestsCount = 0,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'send' as TabType, label: 'Send', icon: Send },
    { id: 'receive' as TabType, label: 'Receive', icon: Download, badge: pendingRequestsCount },
    { id: 'nearby' as TabType, label: 'Nearby', icon: Radio },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-[#1A1A1A]/85 backdrop-blur-2xl border border-white/10 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 gap-1.5 sm:gap-2 shadow-2xl z-50 max-w-[92vw] overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3.5 sm:px-5 py-2 rounded-full flex items-center gap-2 sm:gap-2.5 transition-all cursor-pointer shrink-0 ${
              isActive
                ? 'bg-[#E63946] text-white font-bold shadow-[0_0_20px_rgba(230,57,70,0.4)]'
                : 'text-white/50 hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Icon size={18} className={isActive ? 'text-white' : 'text-white/60'} />
              {tab.badge ? (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E63946] text-white border border-[#111111] animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-xs sm:text-sm tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
