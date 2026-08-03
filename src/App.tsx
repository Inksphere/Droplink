import React, { useState, useEffect } from 'react';
import { TabType, Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { QRCodeModal } from './components/QRCodeModal';
import { QRScannerModal } from './components/QRScannerModal';
import { IncomingRequestModal } from './components/IncomingRequestModal';
import { TransferModal } from './components/TransferModal';

import { HomeScreen } from './screens/HomeScreen';
import { SendScreen } from './screens/SendScreen';
import { ReceiveScreen } from './screens/ReceiveScreen';
import { NearbyScreen } from './screens/NearbyScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

import {
  AppSettings,
  Device,
  FileItem,
  HistoryRecord,
  TransferSession,
} from './types';
import { networkService } from './services/networkService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [settings, setSettings] = useState<AppSettings>(() => ({
    theme: 'dark',
    deviceName: networkService.getSelfDevice().name,
    deviceOS: networkService.getSelfDevice().os,
    saveLocation: '/Downloads/DropLink',
    language: 'English',
    encryptionEnabled: true,
    soundEnabled: true,
    autoAcceptKnown: false,
  }));

  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [selectedTargetDevice, setSelectedTargetDevice] = useState<Device | null>(null);

  // Modals
  const [isQROpen, setIsQROpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [incomingSession, setIncomingSession] = useState<TransferSession | null>(null);
  const [activeTransferSession, setActiveTransferSession] = useState<TransferSession | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>(() => networkService.getHistory());

  const selfDevice = networkService.getSelfDevice();

  useEffect(() => {
    // Check URL parameters for direct connect link
    const params = new URLSearchParams(window.location.search);
    const code = params.get('connectCode');
    if (code) {
      networkService.resolveCode(code).then((dev) => {
        if (dev) {
          setSelectedTargetDevice(dev);
          setActiveTab('send');
        }
      });
    }

    // Subscribe to device list updates
    const unsubscribeDevices = networkService.onDeviceList((devices) => {
      // Filter out self
      const peers = devices.filter((d) => d.id !== selfDevice.id);
      setDiscoveredDevices(peers);
    });

    // Subscribe to incoming transfer requests
    const unsubscribeIncoming = networkService.onIncomingRequest((session) => {
      setIncomingSession(session);
    });

    // Subscribe to transfer response (accept/decline)
    const unsubscribeResponse = networkService.onTransferResponse((sessionId, accepted) => {
      if (accepted) {
        setActiveTransferSession((prev) => {
          if (prev && prev.id === sessionId) {
            return { ...prev, status: 'transferring' };
          }
          return prev;
        });
      } else {
        setActiveTransferSession((prev) => {
          if (prev && prev.id === sessionId) {
            return { ...prev, status: 'declined' };
          }
          return prev;
        });
      }
    });

    // Subscribe to transfer progress updates
    const unsubscribeProgress = networkService.onProgress((update) => {
      setActiveTransferSession((prev) => {
        if (prev && prev.id === update.id) {
          const updated: TransferSession = {
            ...prev,
            ...update,
            progress: update.progress ?? prev.progress,
            status: (update.status as any) || prev.status,
          };

          if (update.status === 'completed') {
            // Record in history
            const histRecord: HistoryRecord = {
              id: 'hist-' + Date.now(),
              sessionId: updated.id,
              direction: updated.senderDevice.id === selfDevice.id ? 'sent' : 'received',
              senderName: updated.senderDevice.name,
              senderOs: updated.senderDevice.os,
              receiverName: updated.receiverDevice.name,
              receiverOs: updated.receiverDevice.os,
              files: updated.files.map((f) => ({
                id: f.id,
                name: f.name,
                size: f.size,
                type: f.type,
                blobUrl: f.blobUrl,
              })),
              totalSize: updated.totalSize,
              timestamp: Date.now(),
              status: 'completed',
            };
            networkService.addHistoryRecord(histRecord);
            setHistory(networkService.getHistory());
          }

          return updated;
        }
        return prev;
      });
    });

    return () => {
      unsubscribeDevices();
      unsubscribeIncoming();
      unsubscribeResponse();
      unsubscribeProgress();
    };
  }, [selfDevice.id]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleStartTransfer = (targetDevice: Device, files: FileItem[]) => {
    const session = networkService.initiateTransfer(targetDevice, files, settings.encryptionEnabled);
    setActiveTransferSession(session);
  };

  const handleAcceptIncomingRequest = (session: TransferSession) => {
    networkService.respondToTransfer(session.id, true);
    setIncomingSession(null);
    setActiveTransferSession({
      ...session,
      status: 'transferring',
    });
  };

  const handleDeclineIncomingRequest = (session: TransferSession) => {
    networkService.respondToTransfer(session.id, false);
    setIncomingSession(null);
  };

  const handlePauseTransfer = () => {
    if (!activeTransferSession) return;
    const targetId =
      activeTransferSession.senderDevice.id === selfDevice.id
        ? activeTransferSession.receiverDevice.id
        : activeTransferSession.senderDevice.id;

    networkService.sendControlEvent(activeTransferSession.id, targetId, 'pause');
    setActiveTransferSession((prev) => (prev ? { ...prev, status: 'paused' } : null));
  };

  const handleResumeTransfer = () => {
    if (!activeTransferSession) return;
    const targetId =
      activeTransferSession.senderDevice.id === selfDevice.id
        ? activeTransferSession.receiverDevice.id
        : activeTransferSession.senderDevice.id;

    networkService.sendControlEvent(activeTransferSession.id, targetId, 'resume');
    setActiveTransferSession((prev) => (prev ? { ...prev, status: 'transferring' } : null));
  };

  const handleCancelTransfer = () => {
    if (!activeTransferSession) return;
    const targetId =
      activeTransferSession.senderDevice.id === selfDevice.id
        ? activeTransferSession.receiverDevice.id
        : activeTransferSession.senderDevice.id;

    networkService.sendControlEvent(activeTransferSession.id, targetId, 'cancel');
    setActiveTransferSession((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  };

  const handleRetryTransfer = () => {
    if (!activeTransferSession) return;
    handleStartTransfer(activeTransferSession.receiverDevice, activeTransferSession.files);
  };

  const isDark = settings.theme === 'dark';

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 relative overflow-x-hidden ${
        isDark ? 'bg-[#111111] text-white' : 'bg-[#F8F9FA] text-zinc-900'
      }`}
    >
      {/* Immersive UI Background Ambient Glows */}
      {isDark && (
        <>
          <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] bg-[#E63946] opacity-10 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#E63946] opacity-5 rounded-full blur-[100px] pointer-events-none z-0" />
        </>
      )}

      {/* Top Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        selfDevice={selfDevice}
        onlinePeersCount={discoveredDevices.length}
      />

      {/* Primary Screen View with space for floating bottom navigation bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 relative z-10">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigate={setActiveTab}
            discoveredDevices={discoveredDevices}
            history={history}
            onOpenQR={() => setIsQROpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onSelectDeviceToSend={(dev) => {
              setSelectedTargetDevice(dev);
              setActiveTab('send');
            }}
          />
        )}

        {activeTab === 'send' && (
          <SendScreen
            discoveredDevices={discoveredDevices}
            selectedTargetDevice={selectedTargetDevice}
            onSelectTargetDevice={setSelectedTargetDevice}
            onStartTransfer={handleStartTransfer}
            onOpenQR={() => setIsQROpen(true)}
          />
        )}

        {activeTab === 'receive' && (
          <ReceiveScreen
            selfDevice={selfDevice}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'nearby' && (
          <NearbyScreen
            discoveredDevices={discoveredDevices}
            onSelectDeviceToSend={(dev) => {
              setSelectedTargetDevice(dev);
              setActiveTab('send');
            }}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            history={history}
            onClearHistory={() => {
              networkService.clearHistory();
              setHistory([]);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            selfDevice={selfDevice}
          />
        )}
      </main>

      {/* Floating Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingRequestsCount={incomingSession ? 1 : 0}
      />

      {/* Modals & Dialogs */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        code={networkService.getConnectionCode()}
        deviceName={selfDevice.name}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDeviceFound={(device) => {
          setSelectedTargetDevice(device);
          setActiveTab('send');
        }}
      />

      <IncomingRequestModal
        session={incomingSession}
        onAccept={handleAcceptIncomingRequest}
        onDecline={handleDeclineIncomingRequest}
      />

      <TransferModal
        session={activeTransferSession}
        onPause={handlePauseTransfer}
        onResume={handleResumeTransfer}
        onCancel={handleCancelTransfer}
        onRetry={handleRetryTransfer}
        onClose={() => setActiveTransferSession(null)}
      />
    </div>
  );
}
