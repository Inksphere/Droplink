import { Device, DeviceOS, TransferSession, HistoryRecord } from '../types';
import { detectDeviceOS, generateConnectionCode, generateSessionId } from '../utils/formatters';
import { sounds } from '../utils/soundEffects';

type DeviceListListener = (devices: Device[]) => void;
type IncomingRequestListener = (session: TransferSession) => void;
type TransferResponseListener = (sessionId: string, accepted: boolean) => void;
type ProgressListener = (sessionUpdate: Partial<TransferSession>) => void;
type ChunkListener = (data: { sessionId: string; chunkIndex: number; totalChunks: number; dataB64: string; fileId: string }) => void;

class NetworkService {
  private ws: WebSocket | null = null;
  private selfDevice: Device;
  private connected: boolean = false;
  private deviceListListeners: Set<DeviceListListener> = new Set();
  private incomingRequestListeners: Set<IncomingRequestListener> = new Set();
  private transferResponseListeners: Set<TransferResponseListener> = new Set();
  private progressListeners: Set<ProgressListener> = new Set();
  private chunkListeners: Set<ChunkListener> = new Set();
  private history: HistoryRecord[] = [];

  constructor() {
    const savedName = localStorage.getItem('droplink_device_name');
    const savedOS = (localStorage.getItem('droplink_device_os') as DeviceOS) || detectDeviceOS();

    const deviceName = savedName || this.generateDefaultName(savedOS);
    const code = localStorage.getItem('droplink_connection_code') || generateConnectionCode();
    localStorage.setItem('droplink_connection_code', code);

    this.selfDevice = {
      id: localStorage.getItem('droplink_device_id') || 'dev-' + Math.random().toString(36).substring(2, 9),
      name: deviceName,
      os: savedOS,
      ip: '192.168.1.100',
      signalStrength: 100,
      status: 'online',
      isSelf: true,
      lastSeen: Date.now(),
    };
    localStorage.setItem('droplink_device_id', this.selfDevice.id);

    // Load saved history
    try {
      const savedHist = localStorage.getItem('droplink_history');
      if (savedHist) {
        this.history = JSON.parse(savedHist);
      }
    } catch {
      this.history = [];
    }

    this.connect();
  }

  private generateDefaultName(os: DeviceOS): string {
    const brands = {
      android: ['Galaxy S24', 'Pixel 9 Pro', 'OnePlus 12', 'Xiaomi 14'],
      ios: ['iPhone 15 Pro', 'iPhone 14 Air', 'iPad Pro M2'],
      windows: ['ZenBook Pro', 'Alienware 17', 'Surface Pro 9'],
      macos: ['MacBook Pro M3', 'Mac Studio', 'MacBook Air M2'],
      linux: ['ThinkPad X1 Linux', 'Dell XPS Ubuntu'],
      web: ['Chrome Client', 'Safari Web', 'Firefox Browser'],
    };
    const list = brands[os] || brands.web;
    const randomName = list[Math.floor(Math.random() * list.length)];
    return `${randomName}`;
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this.register();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        // Auto reconnect after 3 seconds
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
      };
    } catch (e) {
      console.error('Could not initiate WebSocket connection', e);
    }
  }

  private register() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const code = localStorage.getItem('droplink_connection_code') || generateConnectionCode();
    this.ws.send(
      JSON.stringify({
        type: 'register-device',
        device: {
          ...this.selfDevice,
          connectionCode: code,
        },
      })
    );
  }

  public updateSelfDevice(name: string, os: DeviceOS) {
    this.selfDevice.name = name;
    this.selfDevice.os = os;
    localStorage.setItem('droplink_device_name', name);
    localStorage.setItem('droplink_device_os', os);
    this.register();
  }

  public getSelfDevice(): Device {
    return { ...this.selfDevice };
  }

  public getConnectionCode(): string {
    return localStorage.getItem('droplink_connection_code') || '123456';
  }

  public isConnected(): boolean {
    return this.connected;
  }

  private handleServerMessage(msg: any) {
    switch (msg.type) {
      case 'registered':
        if (msg.device) {
          this.selfDevice.ip = msg.device.ip;
        }
        break;

      case 'device-list-update':
        if (msg.devices) {
          this.notifyDeviceList(msg.devices);
        }
        break;

      case 'incoming-transfer-request':
        if (msg.session) {
          sounds.playChime();
          this.incomingRequestListeners.forEach((cb) => cb(msg.session));
        }
        break;

      case 'transfer-response':
        if (msg.accepted) {
          sounds.playClick();
        } else {
          sounds.playError();
        }
        this.transferResponseListeners.forEach((cb) => cb(msg.sessionId, msg.accepted));
        break;

      case 'transfer-progress-update':
        if (msg.status === 'completed') {
          sounds.playSuccess();
        }
        this.progressListeners.forEach((cb) => cb(msg));
        break;

      case 'incoming-chunk':
        this.chunkListeners.forEach((cb) => cb(msg));
        break;
    }
  }

  // Subscriptions
  public onDeviceList(cb: DeviceListListener) {
    this.deviceListListeners.add(cb);
    return () => this.deviceListListeners.delete(cb);
  }

  public onIncomingRequest(cb: IncomingRequestListener) {
    this.incomingRequestListeners.add(cb);
    return () => this.incomingRequestListeners.delete(cb);
  }

  public onTransferResponse(cb: TransferResponseListener) {
    this.transferResponseListeners.add(cb);
    return () => this.transferResponseListeners.delete(cb);
  }

  public onProgress(cb: ProgressListener) {
    this.progressListeners.add(cb);
    return () => this.progressListeners.delete(cb);
  }

  public onChunk(cb: ChunkListener) {
    this.chunkListeners.add(cb);
    return () => this.chunkListeners.delete(cb);
  }

  private notifyDeviceList(devices: Device[]) {
    this.deviceListListeners.forEach((cb) => cb(devices));
  }

  // Operations
  public initiateTransfer(targetDevice: Device, files: any[], isEncrypted = true): TransferSession {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = generateSessionId();

    const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

    const session: TransferSession = {
      id: sessionId,
      code,
      senderDevice: this.getSelfDevice(),
      receiverDevice: targetDevice,
      files,
      totalSize,
      status: 'pending',
      progress: 0,
      transferredBytes: 0,
      speedBytesPerSec: 0,
      remainingSeconds: 0,
      isEncrypted,
      startTime: Date.now(),
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'request-transfer',
          session,
          targetDeviceId: targetDevice.id,
        })
      );
    }

    return session;
  }

  public respondToTransfer(sessionId: string, accepted: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'respond-transfer',
          sessionId,
          accepted,
        })
      );
    }
  }

  public sendControlEvent(sessionId: string, targetDeviceId: string, action: 'pause' | 'resume' | 'cancel') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'transfer-control',
          sessionId,
          targetDeviceId,
          action,
        })
      );
    }
  }

  public async resolveCode(code: string): Promise<Device | null> {
    try {
      const res = await fetch('/api/resolve-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.found && data.device) {
        return data.device;
      }
    } catch (e) {
      console.error('Error resolving PIN code', e);
    }
    return null;
  }

  // History management
  public getHistory(): HistoryRecord[] {
    return [...this.history];
  }

  public addHistoryRecord(record: HistoryRecord) {
    this.history.unshift(record);
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }
    try {
      localStorage.setItem('droplink_history', JSON.stringify(this.history));
    } catch (e) {
      console.error('Could not save history to localStorage', e);
    }
  }

  public clearHistory() {
    this.history = [];
    localStorage.removeItem('droplink_history');
  }
}

export const networkService = new NetworkService();
