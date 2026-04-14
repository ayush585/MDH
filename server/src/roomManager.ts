interface Room {
  roomId: string;
  members: Set<string>;      // socket IDs
  userIds: Map<string, string>; // socketId -> userId
  createdAt: number;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createOrJoin(roomId: string, socketId: string, userId: string): Room {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        members: new Set(),
        userIds: new Map(),
        createdAt: Date.now(),
      });
    }
    const room = this.rooms.get(roomId)!;
    room.members.add(socketId);
    room.userIds.set(socketId, userId);
    return room;
  }

  leave(socketId: string): Room | null {
    for (const room of this.rooms.values()) {
      if (room.members.has(socketId)) {
        room.members.delete(socketId);
        room.userIds.delete(socketId);
        if (room.members.size === 0) {
          this.rooms.delete(room.roomId);
        }
        return room;
      }
    }
    return null;
  }

  getRoomBySocket(socketId: string): Room | null {
    for (const room of this.rooms.values()) {
      if (room.members.has(socketId)) return room;
    }
    return null;
  }

  serializeRoom(room: Room) {
    return {
      roomId: room.roomId,
      members: Array.from(room.userIds.values()),
      createdAt: room.createdAt,
    };
  }
}
