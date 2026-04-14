import React from 'react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'synced';

interface Props {
  state: ConnectionState;
  serverUrl: string;
  latency?: number;
}

const STATE_CONFIG = {
  disconnected: { label: 'OFFLINE', color: 'text-red-500', dot: 'bg-red-500' },
  connecting: { label: 'LINKING...', color: 'text-hud-warning', dot: 'bg-hud-warning animate-pulse' },
  connected: { label: 'CONNECTED', color: 'text-hud-accent', dot: 'bg-hud-accent animate-pulse' },
  synced: { label: 'SYNCED', color: 'text-hud-accent', dot: 'bg-hud-accent animate-pulse-accent' },
};

export const StatusBar: React.FC<Props> = ({ state, serverUrl, latency }) => {
  const config = STATE_CONFIG[state];

  let host: string;
  try {
    host = new URL(serverUrl).hostname;
  } catch {
    host = serverUrl;
  }

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-hud-border">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span className={`font-mono text-[9px] tracking-widest ${config.color}`}>{config.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-hud-muted truncate max-w-[120px]">{host}</span>
        {latency !== undefined && (
          <span className="font-mono text-[9px] text-hud-muted">{latency}ms</span>
        )}
      </div>
    </div>
  );
};
