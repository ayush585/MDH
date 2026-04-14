import React, { useState } from 'react';
import type { PayloadId } from '@shared/types';

interface PayloadConfig {
  id: PayloadId;
  codename: string;
  descriptor: string;
  icon: string;
  accentClass: string;
  borderClass: string;
  hotkey: string;
}

interface Props {
  config: PayloadConfig;
  onTrigger: (id: PayloadId) => void;
  disabled: boolean;
  cooldownMs?: number;
}

export const PayloadButton: React.FC<Props> = ({ config, onTrigger, disabled, cooldownMs = 3000 }) => {
  const [isCooling, setIsCooling] = useState(false);
  const [fired, setFired] = useState(false);

  const handleClick = () => {
    if (disabled || isCooling) return;
    onTrigger(config.id);
    setFired(true);
    setIsCooling(true);
    setTimeout(() => {
      setIsCooling(false);
      setFired(false);
    }, cooldownMs);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isCooling}
      className={`
        relative w-full border text-left p-3 transition-all duration-150 group
        ${isCooling
          ? 'border-hud-muted opacity-40 cursor-not-allowed'
          : disabled
            ? 'border-hud-border opacity-20 cursor-not-allowed'
            : `${config.borderClass} hover:bg-white/5 active:scale-[0.98] cursor-pointer`
        }
        ${fired ? 'animate-glitch' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-display text-xs tracking-widest uppercase ${isCooling ? 'text-hud-muted' : config.accentClass}`}>
            {config.codename}
          </div>
          <div className="font-mono text-[9px] text-hud-muted mt-0.5 leading-relaxed">{config.descriptor}</div>
        </div>
        <span className="font-mono text-[9px] text-hud-muted border border-hud-border px-1 py-0.5 self-start">
          {config.hotkey}
        </span>
      </div>
      {isCooling && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-hud-muted/30 w-full">
          <div
            className="h-full bg-hud-muted transition-all ease-linear"
            style={{
              width: '100%',
              animation: `width-shrink ${cooldownMs}ms linear forwards`,
            }}
          />
        </div>
      )}
    </button>
  );
};

export const PAYLOAD_CONFIGS: PayloadConfig[] = [
  {
    id: 'super-max',
    codename: 'SUPER MAX',
    descriptor: 'All images replaced with Max Verstappen. IYKYK.',
    icon: '🏎️',
    accentClass: 'text-red-400',
    borderClass: 'border-red-900 hover:border-red-500',
    hotkey: 'F1',
  },
  {
    id: 'gravity-drop',
    codename: '0G DROP',
    descriptor: 'Injects matter.js. Everything falls off the page.',
    icon: '🌑',
    accentClass: 'text-blue-400',
    borderClass: 'border-blue-900 hover:border-blue-500',
    hotkey: 'F2',
  },
  {
    id: 'cipher-text',
    codename: 'CIPHER',
    descriptor: 'All text corrupts into binary/matrix noise.',
    icon: '⬛',
    accentClass: 'text-green-400',
    borderClass: 'border-green-900 hover:border-green-500',
    hotkey: 'F3',
  },
  {
    id: 'ghost-mouse',
    codename: 'GHOST MOUSE',
    descriptor: 'Your cursor appears on their screen live.',
    icon: '👻',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-900 hover:border-purple-500',
    hotkey: 'F4',
  },
];
