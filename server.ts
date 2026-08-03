import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface ClientDevice {
  ws: WebSocket;
  id: string;
  name: string;
  os: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';
  ip: string;
  signalStrength: number;
  status: 'online' | 'busy' | 'offline';
  connectionCode: string;
  lastSeen: number;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const connectedClients = new Map<string, ClientDevice>();
const activeSessions = new Map<string, any>();
const codeToDeviceId = new Map<string, string>();
const fileBuffers = new Map<string, { chunks: Buffer[]; totalSize: number; mimeType: string; fileName: string }>();

// Simulated seed devices if alone on network
const simulatedDevices: Omit<ClientDevice, 'ws'>[] = [
  {
    id: 'sim-iphone-15',
    name: 'Alex’s iPhone 15 Pro',
    os: 'ios',
    ip: '192.168.1.104',
    signalStrength: 94,
    status: 'online',
    connectionCode: '839210',
    lastSeen: Date.now(),
  },
  {
    id: 'sim-macbook-m3',
    name: 'Studio MacBook Pro',
    os: 'macos',
    ip: '192.168.1.112',
    signalStrength: 98,
    status: 'online',
    connectionCode: '492019',
    lastSeen: Date.now(),
  },
  {
    id: 'sim-galaxy-s24',
    name: 'Samsung Galaxy S24 Ultra',
    os: 'android',
    ip: '192.168.1.120',
    signalStrength: 88,
    status: 'online',
    connectionCode: '109283',
    lastSeen: Date.now(),
  },
  {
    id: 'sim-linux-box',
    name: 'Arch Linux Workstation',
    os: 'linux',
    ip: '192.168.1.145',
    signalStrength: 91,
    status: 'online',
    connectionCode: '654321',
    lastSeen: Date.now(),
  },
];

// Helper to broadcast device updates
function broadcastDeviceList() {
  const realDevices = Array.from(connectedClients.values()).map((c) => ({
    id: c.id,
    name: c.name,
    os: c.os,
    ip: c.ip,
    signalStrength: c.signalStrength,
    status: c.status,
    connectionCode: c.connectionCode,
    isSelf: false,
    lastSeen: c.lastSeen,
  }));

  // Combine real devices with simulated devices
  const allDevices = [...realDevices, ...simulatedDevices];

  for (const client of connectedClients.values()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: 'device-list-update',
          devices: allDevices.map((d) => ({
            ...d,
            isSelf: d.id === client.id,
          })),
        })
      );
    }
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DropLink Peer Network', timestamp: Date.now() });
});

app.get('/api/network-info', (req, res) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || '192.168.1.100';
  res.json({
    localIp: typeof clientIp === 'string' ? clientIp.replace('::ffff:', '') : '192.168.1.100',
    onlinePeersCount: connectedClients.size + simulatedDevices.length,
    ssid: 'Local_WiFi_5G',
  });
});

app.post('/api/resolve-code', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Check real devices
  for (const client of connectedClients.values()) {
    if (client.connectionCode === code) {
      return res.json({
        found: true,
        device: {
          id: client.id,
          name: client.name,
          os: client.os,
          ip: client.ip,
          signalStrength: client.signalStrength,
          status: client.status,
        },
      });
    }
  }

  // Check simulated devices
  const sim = simulatedDevices.find((d) => d.connectionCode === code);
  if (sim) {
    return res.json({
      found: true,
      device: sim,
    });
  }

  res.json({ found: false, error: 'No device found matching connection code' });
});

// Buffer endpoint for local fallback file transfers
app.post('/api/upload-chunk', (req, res) => {
  const { fileId, chunkIndex, totalChunks, dataB64, mimeType, fileName, totalSize } = req.body;
  if (!fileId || !dataB64) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const chunkBuf = Buffer.from(dataB64, 'base64');
  if (!fileBuffers.has(fileId)) {
    fileBuffers.set(fileId, { chunks: [], totalSize, mimeType, fileName });
  }

  const entry = fileBuffers.get(fileId)!;
  entry.chunks[chunkIndex] = chunkBuf;

  const currentReceived = entry.chunks.reduce((acc, cur) => acc + (cur ? cur.length : 0), 0);

  res.json({
    success: true,
    fileId,
    chunkIndex,
    receivedBytes: currentReceived,
    isComplete: currentReceived >= totalSize,
  });
});

app.get('/api/download-file/:fileId', (req, res) => {
  const { fileId } = req.params;
  const entry = fileBuffers.get(fileId);
  if (!entry) {
    return res.status(404).send('File buffer not found or expired');
  }

  const completeBuffer = Buffer.concat(entry.chunks.filter(Boolean));
  res.setHeader('Content-Type', entry.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(entry.fileName)}"`);
  res.send(completeBuffer);
});

// WebSocket Server Handling
wss.on('connection', (ws, req) => {
  let currentDeviceId: string | null = null;
  const clientIp = (req.socket.remoteAddress || '192.168.1.100').replace('::ffff:', '');

  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString());
      switch (msg.type) {
        case 'register-device': {
          currentDeviceId = msg.device.id;
          const code = msg.device.connectionCode || Math.floor(100000 + Math.random() * 900000).toString();

          const clientData: ClientDevice = {
            ws,
            id: msg.device.id,
            name: msg.device.name || 'Nearby Device',
            os: msg.device.os || 'web',
            ip: clientIp === '127.0.0.1' || clientIp === '::1' ? '192.168.1.105' : clientIp,
            signalStrength: msg.device.signalStrength || 95,
            status: 'online',
            connectionCode: code,
            lastSeen: Date.now(),
          };

          connectedClients.set(msg.device.id, clientData);
          codeToDeviceId.set(code, msg.device.id);

          ws.send(
            JSON.stringify({
              type: 'registered',
              device: {
                ...clientData,
                ws: undefined,
              },
            })
          );

          broadcastDeviceList();
          break;
        }

        case 'request-transfer': {
          const { session, targetDeviceId } = msg;
          activeSessions.set(session.id, session);

          // If target is a real connected client
          const targetClient = connectedClients.get(targetDeviceId);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(
              JSON.stringify({
                type: 'incoming-transfer-request',
                session,
              })
            );
          } else {
            // Target is a simulated device - auto accept after slight delay
            setTimeout(() => {
              ws.send(
                JSON.stringify({
                  type: 'transfer-response',
                  sessionId: session.id,
                  accepted: true,
                })
              );

              // Simulate transfer progress chunks
              simulateSimulatedTransferProgress(ws, session);
            }, 1200);
          }
          break;
        }

        case 'respond-transfer': {
          const { sessionId, accepted } = msg;
          const session = activeSessions.get(sessionId);
          if (session) {
            session.status = accepted ? 'accepted' : 'declined';
            const senderClient = connectedClients.get(session.senderDevice.id);
            if (senderClient && senderClient.ws.readyState === WebSocket.OPEN) {
              senderClient.ws.send(
                JSON.stringify({
                  type: 'transfer-response',
                  sessionId,
                  accepted,
                })
              );
            }
          }
          break;
        }

        case 'transfer-chunk-relay': {
          const { sessionId, targetDeviceId, chunkIndex, totalChunks, dataB64, fileId } = msg;
          const targetClient = connectedClients.get(targetDeviceId);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(
              JSON.stringify({
                type: 'incoming-chunk',
                sessionId,
                chunkIndex,
                totalChunks,
                dataB64,
                fileId,
              })
            );
          }
          break;
        }

        case 'transfer-control': {
          const { sessionId, action, targetDeviceId } = msg; // 'pause' | 'resume' | 'cancel'
          const targetClient = connectedClients.get(targetDeviceId);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(
              JSON.stringify({
                type: 'transfer-control-event',
                sessionId,
                action,
              })
            );
          }
          break;
        }

        case 'webrtc-signal': {
          const { targetDeviceId, signalData } = msg;
          const targetClient = connectedClients.get(targetDeviceId);
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(
              JSON.stringify({
                type: 'webrtc-signal',
                senderDeviceId: currentDeviceId,
                signalData,
              })
            );
          }
          break;
        }
      }
    } catch (err) {
      console.error('WS Error processing message:', err);
    }
  });

  ws.on('close', () => {
    if (currentDeviceId) {
      connectedClients.delete(currentDeviceId);
      broadcastDeviceList();
    }
  });
});

// Helper function to simulate transfer progress for simulated targets
function simulateSimulatedTransferProgress(ws: WebSocket, session: any) {
  let progress = 0;
  const totalSize = session.totalSize || 1024 * 1024 * 10;
  const step = 5; // % per step
  const intervalTime = 150;

  const timer = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      clearInterval(timer);
      return;
    }

    progress += step;
    const transferredBytes = Math.min(totalSize, Math.floor((progress / 100) * totalSize));
    const speed = 18.4 * 1024 * 1024 + (Math.random() - 0.5) * 4 * 1024 * 1024; // ~18.4 MB/s
    const remainingSeconds = Math.max(0, (totalSize - transferredBytes) / speed);

    if (progress >= 100) {
      clearInterval(timer);
      ws.send(
        JSON.stringify({
          type: 'transfer-progress-update',
          sessionId: session.id,
          progress: 100,
          transferredBytes: totalSize,
          speedBytesPerSec: 0,
          remainingSeconds: 0,
          status: 'completed',
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: 'transfer-progress-update',
          sessionId: session.id,
          progress,
          transferredBytes,
          speedBytesPerSec: speed,
          remainingSeconds,
          status: 'transferring',
        })
      );
    }
  }, intervalTime);
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`DropLink Full-Stack Peer Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
