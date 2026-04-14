import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents, RoomState, PayloadId } from '@shared/types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let currentRoomState: RoomState | null = null;
let connectionState: 'disconnected' | 'connecting' | 'connected' | 'synced' = 'disconnected';
let currentLatency: number | undefined = undefined;
let activeRoomId = '';
let activeUserId = '';

// Helper to convert an image URL to a base64 data URI bypassing DOM CSP
async function fetchAndBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to encode image to base64', e);
    return url;
  }
}

let cachedSuperMaxSrc = '';

// Pre-cache the Super Max image
fetchAndBase64('https://c.tenor.com/NmStfoyUX2oAAAAC/tenor.gif').then((data) => {
  cachedSuperMaxSrc = data;
});

function connectSocket(roomId: string, userId: string) {
  if (socket) {
    socket.disconnect();
  }
  
  activeRoomId = roomId;
  activeUserId = userId;
  connectionState = 'connecting';
  broadcastState();

  socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    connectionState = 'connected';
    const start = Date.now();
    socket!.emit('room:join', { roomId, userId });
    currentLatency = Date.now() - start;
    broadcastState();
  });

  socket.on('room:joined', (state) => {
    currentRoomState = state;
    if (state.members.length >= 2) connectionState = 'synced';
    broadcastState();
  });

  socket.on('room:updated', (state) => {
    currentRoomState = state;
    connectionState = state.members.length >= 2 ? 'synced' : 'connected';
    broadcastState();
  });

  socket.on('disconnect', () => {
    connectionState = 'disconnected';
    currentRoomState = null;
    broadcastState();
  });

  socket.on('payload:execute', (event) => {
    // Inject the base64 URL directly into the payload data to bypass page CSP!
    let payloadData: any = {};
    if (event.payloadId === 'super-max') {
      payloadData.imageSrc = cachedSuperMaxSrc;
    }

    // Execute in all active tabs in case they want it everywhere
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'EXECUTE_PAYLOAD',
          payloadId: event.payloadId,
          data: payloadData
        });
      }
    });
  });
}

function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
  currentRoomState = null;
  connectionState = 'disconnected';
  activeRoomId = '';
  chrome.storage.local.remove(['roomId']);
  broadcastState();
}

function broadcastState() {
  chrome.runtime.sendMessage({
    type: 'STATE_UPDATE',
    state: {
      connectionState,
      roomId: activeRoomId,
      roomState: currentRoomState,
      latency: currentLatency
    }
  }).catch(() => { /* ignore error when popup is closed */ });
}

// Auto-connect if previously connected
chrome.storage.local.get(['roomId', 'userId'], (res) => {
  if (typeof res.roomId === 'string' && typeof res.userId === 'string') {
    connectSocket(res.roomId, res.userId);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_STATE') {
    sendResponse({
      connectionState,
      roomId: activeRoomId,
      roomState: currentRoomState,
      latency: currentLatency
    });
  } else if (msg.type === 'CONNECT_ROOM') {
    chrome.storage.local.set({ roomId: msg.roomId });
    connectSocket(msg.roomId, msg.userId);
    sendResponse({ status: 'connecting' });
  } else if (msg.type === 'DISCONNECT') {
    disconnectSocket();
    sendResponse({ status: 'disconnected' });
  } else if (msg.type === 'TRIGGER_PAYLOAD') {
    if (socket && activeRoomId) {
      socket.emit('payload:trigger', {
        payloadId: msg.payloadId,
        roomId: activeRoomId,
        triggeredBy: activeUserId,
        timestamp: Date.now()
      });
    }
    sendResponse({ status: 'triggered' });
  }
  return true; 
});
