import { executeSuperMax } from './superMax';
import { executeGravityDrop } from './gravityDrop';
import { executeCipherText } from './cipherText';
import { initGhostMouse, stopGhostMouse } from './ghostMouse';

export type PayloadExecutor = (data?: any) => void | Promise<void>;

export const PAYLOAD_REGISTRY: Record<string, PayloadExecutor> = {
  'super-max': executeSuperMax,
  'gravity-drop': executeGravityDrop,
  'cipher-text': executeCipherText,
  'ghost-mouse': initGhostMouse,
};

export async function executePayload(payloadId: string, data?: any): Promise<void> {
  const executor = PAYLOAD_REGISTRY[payloadId];
  if (!executor) {
    console.warn(`[DOM Hijacker] Unknown payload: ${payloadId}`);
    return;
  }
  console.log(`[DOM Hijacker] Executing payload: ${payloadId}`);
  await executor(data);
}
