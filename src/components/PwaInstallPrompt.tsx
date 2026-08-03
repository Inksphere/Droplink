import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback instruction trigger
      setShowIosGuide(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
        <CheckCircle2 size={14} />
        <span className="hidden sm:inline">PWA Installed</span>
      </div>
    );
  }

  const canInstall = Boolean(deferredPrompt || isIos);

  return (
    <>
      {/* Header Compact Action Button */}
      {canInstall && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E63946] hover:bg-[#ff4d5a] text-white text-xs font-bold shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all cursor-pointer shrink-0 animate-pulse active:scale-95"
          title="Install DropLink App on Android, iPhone, Windows or Mac"
        >
          <Download size={14} />
          <span>Install App</span>
        </button>
      )}

      {/* Floating Bottom Prompt Banner */}
      {canInstall && !bannerDismissed && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md p-4 rounded-3xl bg-[#1A1A1A] border border-[#E63946]/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#E63946] flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(230,57,70,0.5)]">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">Install DropLink App</div>
              <div className="text-[11px] text-white/50 truncate">
                {isIos ? 'Add to iPhone / iPad Home Screen' : 'Install native desktop & mobile app'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#ff4d5a] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Install
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* iOS / General Installation Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-sm rounded-[32px] bg-[#1A1A1A] border border-white/10 p-6 sm:p-8 shadow-2xl text-center">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white bg-white/5 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 flex items-center justify-center mx-auto mb-4">
              <Share size={26} />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Install DropLink PWA</h3>
            <p className="text-xs text-white/50 mb-5 leading-relaxed">
              {isIos
                ? 'Install DropLink directly on your iPhone or iPad home screen for full offline performance:'
                : 'Install DropLink on your device home screen or desktop:'}
            </p>

            <div className="space-y-3 text-left text-xs bg-zinc-950/80 p-4 rounded-2xl border border-white/5 mb-6">
              <div className="flex items-center gap-3 text-white">
                <span className="w-6 h-6 rounded-full bg-[#E63946]/20 text-[#E63946] font-bold flex items-center justify-center text-xs shrink-0">1</span>
                <span>Tap the <strong className="text-white">Share</strong> button in browser toolbar.</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <span className="w-6 h-6 rounded-full bg-[#E63946]/20 text-[#E63946] font-bold flex items-center justify-center text-xs shrink-0">2</span>
                <span>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <span className="w-6 h-6 rounded-full bg-[#E63946]/20 text-[#E63946] font-bold flex items-center justify-center text-xs shrink-0">3</span>
                <span>Tap <strong className="text-white">Add</strong> in the top right corner.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#E63946] hover:bg-[#ff4d5a] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
