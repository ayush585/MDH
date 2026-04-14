// Room lifecycle
export type ClientToServerEvents = {
  'room:join': (payload: { roomId: string; userId: string }) => void;
  'room:leave': (payload: { roomId: string; userId: string }) => void;
  'payload:trigger': (payload: PayloadTriggerEvent) => void;
  'cursor:move': (payload: CursorMoveEvent) => void;
};

export type ServerToClientEvents = {
  'room:joined': (payload: RoomState) => void;
  'room:updated': (payload: RoomState) => void;
  'room:error': (payload: { message: string }) => void;
  'payload:execute': (payload: PayloadTriggerEvent) => void;
  'cursor:update': (payload: CursorMoveEvent) => void;
};

export type PayloadId = 'super-max' | 'gravity-drop' | 'cipher-text' | 'ghost-mouse';

export interface PayloadTriggerEvent {
  payloadId: PayloadId;
  roomId: string;
  triggeredBy: string;
  timestamp: number;
}

export interface CursorMoveEvent {
  roomId: string;
  userId: string;
  x: number; // percentage of viewport width (0–100)
  y: number; // percentage of viewport height (0–100)
}

export interface RoomState {
  roomId: string;
  members: string[];
  createdAt: number;
}
