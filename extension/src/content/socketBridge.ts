// The popup sends messages via chrome.tabs.sendMessage.
// The content script receives them via chrome.runtime.onMessage.

export interface ContentMessage {
  type: 'EXECUTE_PAYLOAD';
  payloadId: string;
}

export function initMessageBridge(onPayload: (payloadId: string) => void): void {
  chrome.runtime.onMessage.addListener((message: ContentMessage) => {
    if (message.type === 'EXECUTE_PAYLOAD') {
      onPayload(message.payloadId);
    }
  });
}
