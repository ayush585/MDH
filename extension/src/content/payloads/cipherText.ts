const CIPHER_CHARS = '01アイウエオカキクケコサシスセソ!@#$%^&*<>?/\\|{}[]~`';
const DURATION_MS = 3000;
const FRAME_INTERVAL = 80;

function randomChar(): string {
  return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
}

function scrambleText(original: string, progress: number): string {
  // As progress goes from 0→1, more of the text becomes scrambled
  return original
    .split('')
    .map((char) => {
      if (char === ' ' || char === '\n') return char;
      if (Math.random() > progress) return char; // Keep original
      return randomChar();
    })
    .join('');
}

export function executeCipherText(data?: any): void {
  const selectors = 'p, h1, h2, h3, h4, h5, h6, li, td, th, span, label, a';
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));

  // Store originals
  const originals = new Map<HTMLElement, string>();
  elements.forEach((el) => {
    if (el.children.length === 0 && el.textContent?.trim()) {
      originals.set(el, el.textContent);
    }
  });

  const startTime = Date.now();

  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / DURATION_MS, 1);

    originals.forEach((text, el) => {
      el.textContent = scrambleText(text, progress);
      el.style.color = `hsl(${120 + progress * 60}, 100%, ${40 + progress * 20}%)`;
      el.style.fontFamily = 'monospace';
      el.style.letterSpacing = '0.05em';
    });

    if (progress >= 1) {
      clearInterval(interval);
      // Leave it scrambled
    }
  }, FRAME_INTERVAL);

  console.log(`[DOM Hijacker] CIPHER: Corrupting ${originals.size} text nodes.`);
}
