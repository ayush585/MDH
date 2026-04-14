import { io } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types';

const SERVER_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SERVER_URL) || 'http://localhost:3001';
let ghostSocket: ReturnType<typeof io> | null = null;
let ghostCursorEl: HTMLElement | null = null;
let isTracking = false;

function createGhostCursor(): HTMLElement {
  const cursor = document.createElement('div');
  cursor.id = '__dom_hijacker_ghost_cursor__';
  cursor.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L10 20L13 13L20 10L4 4Z" fill="#6644ff" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
    <span style="
      position: absolute;
      top: 22px;
      left: 8px;
      background: #6644ff;
      color: white;
      font-family: monospace;
      font-size: 10px;
      padding: 1px 4px;
      border-radius: 2px;
      white-space: nowrap;
    ">GHOST</span>
  `;
  Object.assign(cursor.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
    transform: 'translate(0px, 0px)',
    transition: 'transform 0.05s linear',
  });
  return cursor;
}

export function initGhostMouse(): void {
  if (isTracking) return;
  isTracking = true;

  // Get room ID from storage
  chrome.storage.local.get(['roomId', 'userId'], ({ roomId, userId }) => {
    if (!roomId) return;

    ghostSocket = io(SERVER_URL, { transports: ['websocket'] }) as ReturnType<typeof io>;

    ghostSocket.on('connect', () => {
      (ghostSocket as ReturnType<typeof io>).emit('room:join', { roomId, userId: `ghost_${userId}` });
    });

    // Show incoming ghost cursor
    ghostSocket.on('cursor:update', (event: { x: number; y: number; userId: string }) => {
      if (!ghostCursorEl) {
        ghostCursorEl = createGhostCursor();
        document.body.appendChild(ghostCursorEl);
      }
      const x = (event.x / 100) * window.innerWidth;
      const y = (event.y / 100) * window.innerHeight;
      ghostCursorEl.style.transform = `translate(${x}px, ${y}px)`;
    });

    // Broadcast local cursor movements (throttled to ~30fps)
    let lastSend = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSend < 33) return; // ~30fps throttle
      lastSend = now;
      if (!ghostSocket || !roomId) return;
      (ghostSocket as ReturnType<typeof io>).emit('cursor:move', {
        roomId,
        userId,
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
  });
}

export function stopGhostMouse(): void {
  isTracking = false;
  ghostSocket?.disconnect();
  ghostCursorEl?.remove();
  ghostCursorEl = null;
}
