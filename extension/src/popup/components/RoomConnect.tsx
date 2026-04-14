import React, { useState } from 'react';

interface Props {
  onConnect: (roomId: string) => void;
  isConnected: boolean;
  roomId: string;
  memberCount: number;
}

// Generates a human-readable room code like "CHAOS-404"
function generateRoomId(): string {
  const words = ['CHAOS', 'VOID', 'GLITCH', 'ZERO', 'NULL', 'ROGUE', 'SIGMA', 'DELTA'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${word}-${num}`;
}

export const RoomConnect: React.FC<Props> = ({ onConnect, isConnected, roomId, memberCount }) => {
  const [inputId, setInputId] = useState('');

  if (isConnected) {
    return (
      <div className="border border-hud-border bg-hud-surface p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-hud-muted font-mono text-[10px] uppercase tracking-widest">Room Active</span>
          <span className="text-hud-accent font-mono text-[10px]">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
        <div className="font-display text-hud-accent text-lg tracking-widest">{roomId}</div>
        <div className="mt-1 flex gap-1">
          <div className={`w-2 h-2 rounded-full ${memberCount >= 2 ? 'bg-hud-accent animate-pulse' : 'bg-hud-warning'}`} />
          <span className="text-hud-muted font-mono text-[9px]">
            {memberCount >= 2 ? 'SYNC ACTIVE' : 'WAITING FOR PARTNER'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-hud-border bg-hud-surface p-3 space-y-2">
      <span className="text-hud-muted font-mono text-[10px] uppercase tracking-widest block">Establish Link</span>
      <button
        onClick={() => onConnect(generateRoomId())}
        className="w-full border border-hud-accent text-hud-accent font-mono text-xs py-2 hover:bg-hud-accent hover:text-hud-bg transition-colors duration-150 tracking-widest uppercase"
      >
        + Generate Room
      </button>
      <div className="flex gap-2">
        <input
          value={inputId}
          onChange={(e) => setInputId(e.target.value.toUpperCase())}
          placeholder="ENTER ROOM ID"
          className="flex-1 bg-transparent border border-hud-border text-hud-text font-mono text-xs px-2 py-1.5 placeholder:text-hud-muted outline-none focus:border-hud-accent transition-colors"
        />
        <button
          onClick={() => inputId.trim() && onConnect(inputId.trim())}
          className="border border-hud-muted text-hud-muted font-mono text-xs px-3 hover:border-hud-accent hover:text-hud-accent transition-colors"
        >
          JOIN
        </button>
      </div>
    </div>
  );
};
