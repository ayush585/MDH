import 'dotenv/config';
import { createApp } from './server';

const PORT = process.env.PORT || 3001;
const { httpServer } = createApp();

httpServer.listen(PORT, () => {
  console.log(`🚀 DOM Hijacker signaling server running on port ${PORT}`);
});

// Keep-alive for Render free tier — ping own health endpoint every 14 minutes
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    fetch(`${process.env.RENDER_EXTERNAL_URL}/health`).catch(console.error);
  }, 14 * 60 * 1000);
}
