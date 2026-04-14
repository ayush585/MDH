import { initMessageBridge } from './socketBridge';
import { executePayload } from './payloads/index';

console.log('[DOM Hijacker] Content script loaded on', window.location.hostname);

initMessageBridge((payloadId: string) => {
  executePayload(payloadId);
});

// Keyboard shortcuts for payload execution
document.addEventListener('keydown', (e: KeyboardEvent) => {
  const keyMap: Record<string, string> = {
    'F1': 'super-max',
    'F2': 'gravity-drop',
    'F3': 'cipher-text',
    'F4': 'ghost-mouse',
  };
  const payloadId = keyMap[e.key];
  if (payloadId) {
    e.preventDefault();
    executePayload(payloadId);
  }
});
