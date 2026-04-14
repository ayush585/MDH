import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomConnect } from './RoomConnect';
import { PayloadButton, PAYLOAD_CONFIGS } from './PayloadButton';
import { StatusBar } from './StatusBar';
import type { ClientToServerEvents, ServerToClientEvents, PayloadId, RoomState } from '@shared/types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

function generateUserId(): string {
  return `user_${Math.random().toString(36).slice(2, 8)}`;
}

export const HUD: React.FC = () => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'synced'>('disconnected');
  const [roomId, setRoomId] = useState('');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const userIdRef = useRef(generateUserId());

  useEffect(() => {
    // Restore room ID from storage
    chrome.storage.local.get(['roomId', 'userId'], (result: { [key: string]: any }) => {
      if (typeof result.userId === 'string') userIdRef.current = result.userId;
      else chrome.storage.local.set({ userId: userIdRef.current });
    });
  }, []);

  const handleConnect = useCallback((newRoomId: string) => {
    setConnectionState('connecting');
    setRoomId(newRoomId);
    chrome.storage.local.set({ roomId: newRoomId });

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionState('connected');
      const start = Date.now();
      socket.emit('room:join', { roomId: newRoomId, userId: userIdRef.current });
      setLatency(Date.now() - start);
    });

    socket.on('room:joined', (state) => {
      setRoomState(state);
      if (state.members.length >= 2) setConnectionState('synced');
    });

    socket.on('room:updated', (state) => {
      setRoomState(state);
      setConnectionState(state.members.length >= 2 ? 'synced' : 'connected');
    });

    socket.on('disconnect', () => {
      setConnectionState('disconnected');
      setRoomState(null);
    });

    socket.on('payload:execute', (event) => {
      // Tell the active tab's content script to execute this payload
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'EXECUTE_PAYLOAD',
            payloadId: event.payloadId,
          });
        }
      });
    });
  }, []);

  const handlePayloadTrigger = useCallback((payloadId: PayloadId) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('payload:trigger', {
      payloadId,
      roomId,
      triggeredBy: userIdRef.current,
      timestamp: Date.now(),
    });
  }, [roomId]);

  const isReady = connectionState === 'connected' || connectionState === 'synced';
  const memberCount = roomState?.members.length ?? 0;

  return (
    <div className="w-80 bg-hud-bg text-hud-text font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-hud-border">
        <div className="flex items-center gap-2">
          <span className="text-hud-accent font-display text-xs tracking-[0.3em] uppercase">DOM Hijacker</span>
        </div>
        <span className="text-hud-muted text-[9px] tracking-widest">v1.0</span>
      </div>

      <StatusBar state={connectionState} serverUrl={SERVER_URL} latency={latency} />

      <div className="p-3 space-y-3">
        <RoomConnect
          onConnect={handleConnect}
          isConnected={isReady}
          roomId={roomId}
          memberCount={memberCount}
        />

        {/* Payload Arsenal */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-hud-muted text-[9px] tracking-widest uppercase">Arsenal</span>
            <div className="flex-1 h-px bg-hud-border" />
            {!isReady && <span className="text-[8px] text-red-700 tracking-widest">LOCKED</span>}
          </div>
          <div className="space-y-1.5">
            {PAYLOAD_CONFIGS.map((config) => (
              <PayloadButton
                key={config.id}
                config={config}
                onTrigger={handlePayloadTrigger}
                disabled={!isReady}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1 border-t border-hud-border flex items-center justify-between">
          <span className="text-[8px] text-hud-muted tracking-widest">MULTIPLAYER DOM HIJACKER</span>
          <span className="text-[8px] text-hud-muted">◈ {userIdRef.current.slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};
