export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: '#0a0a0a',
          border: '#1f1f1f',
          surface: '#111111',
          accent: '#00ff88',
          danger: '#ff3333',
          warning: '#ffaa00',
          ghost: '#6644ff',
          text: '#e8e8e8',
          muted: '#555555',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 0.3s ease forwards',
      },
      keyframes: {
        'pulse-accent': {
          '0%, 100%': { boxShadow: '0 0 0px #00ff88' },
          '50%': { boxShadow: '0 0 12px #00ff8866' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-3px, 1px)' },
          '40%': { transform: 'translate(3px, -1px)' },
          '60%': { transform: 'translate(-1px, 2px)' },
          '80%': { transform: 'translate(1px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
    },
  },
};
