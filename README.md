# Multiplayer DOM Hijacker

Real-time synchronized browser chaos. When you and your friend trigger a payload,
both of your screens mutate simultaneously via WebSockets.

## Setup

### 1. Clone & Install
```bash
git clone <repo>
cd multiplayer-dom-hijacker

# Install all deps
cd shared && npm install
cd ../server && npm install
cd ../extension && npm install
```

### 2. Start the Server
```bash
cd server
cp .env.example .env
npm run dev
```

### 3. Load the Extension
1. Open Chrome → `chrome://extensions`
2. Enable Developer Mode (top right)
3. Click "Load Unpacked" → select the `extension/dist/` folder
4. Run `cd extension && npm run build` first

### 4. Use It
1. Both users open the extension
2. User A clicks "Generate Room" and shares the Room ID
3. User B enters the Room ID and clicks Join
4. Navigate to the same website
5. Hit a payload. Watch both screens explode.

## Payloads
- 🏎️ **SUPER MAX** — Floods every image with Max Verstappen photos
- 🌑 **0G DROP** — Injects physics engine, everything falls
- ⬛ **CIPHER** — Scrambles all text into matrix noise
- 👻 **GHOST MOUSE** — Your cursor appears on their screen live

## Keyboard Shortcuts
| Key | Payload |
|-----|---------|
| F1  | Super Max |
| F2  | 0G Drop |
| F3  | Cipher |
| F4  | Ghost Mouse |

## Architecture
```
extension/ → React popup + content scripts → chrome.tabs.sendMessage
server/    → Socket.io signaling server → room-based broadcast
shared/    → TypeScript event type contracts
```

## Deployment
- **Server:** Deploy to Render, Railway, or any Node.js host
- **Extension:** Build with `npm run build`, load `dist/` as unpacked extension
