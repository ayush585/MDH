import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './roomManager';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/src/types';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  const roomManager = new RoomManager();

  // Health check endpoint for uptime monitors (Render/Railway keep-alive)
  app.get('/health', (_, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  io.on('connection', (socket) => {
    console.log(`[+] Socket connected: ${socket.id}`);

    socket.on('room:join', ({ roomId, userId }) => {
      const room = roomManager.createOrJoin(roomId, socket.id, userId);
      socket.join(roomId);
      socket.emit('room:joined', roomManager.serializeRoom(room));
      socket.to(roomId).emit('room:updated', roomManager.serializeRoom(room));
      console.log(`[room:join] User ${userId} joined room ${roomId}`);
    });

    socket.on('payload:trigger', (event) => {
      // Broadcast to ALL members in the room including the sender
      io.to(event.roomId).emit('payload:execute', event);
      console.log(`[payload:trigger] ${event.payloadId} in room ${event.roomId}`);
    });

    socket.on('cursor:move', (event) => {
      // Only broadcast to others in the room, not the sender
      socket.to(event.roomId).emit('cursor:update', event);
    });

    socket.on('disconnect', () => {
      const room = roomManager.leave(socket.id);
      if (room) {
        io.to(room.roomId).emit('room:updated', roomManager.serializeRoom(room));
      }
      console.log(`[-] Socket disconnected: ${socket.id}`);
    });
  });

  return { app, httpServer };
}
