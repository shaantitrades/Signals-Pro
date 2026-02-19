import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

export function initializeWebSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: string;
      };
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`🔌 User connected: ${user.email} (${socket.id})`);

    // Join user-specific room
    socket.join(`user:${user.userId}`);

    // Join role-based rooms
    if (['VALIDATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      socket.join('validators');
      socket.join('admin');
    }

    // ====================================================================
    // Signal subscriptions
    // ====================================================================

    socket.on('signals:subscribe', (options?: { category?: string; asset?: string }) => {
      socket.join('signals');
      if (options?.category) {
        socket.join(`signals:${options.category}`);
      }
      if (options?.asset) {
        socket.join(`signals:asset:${options.asset}`);
      }
      socket.emit('signals:subscribed', { status: 'ok', rooms: Array.from(socket.rooms) });
    });

    socket.on('signals:unsubscribe', () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('signals')) {
          socket.leave(room);
        }
      });
    });

    // ====================================================================
    // Bot status
    // ====================================================================

    socket.on('bot:subscribe', () => {
      socket.join(`bot:${user.userId}`);
    });

    // ====================================================================
    // Ping/Pong for latency measurement
    // ====================================================================

    socket.on('ping:measure', () => {
      socket.emit('pong:measure', { timestamp: Date.now() });
    });

    // ====================================================================
    // Disconnect
    // ====================================================================

    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${user.email} (${reason})`);
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

// ============================================================================
// Signal broadcast helpers
// ============================================================================

export function broadcastNewSignal(signal: any) {
  if (!io) return;

  io.to('signals').emit('signal:new', signal);
  io.to(`signals:${signal.category}`).emit('signal:new', signal);
  io.to(`signals:asset:${signal.asset}`).emit('signal:new', signal);
}

export function broadcastSignalUpdate(signal: any) {
  if (!io) return;

  io.to('signals').emit('signal:updated', signal);
}

export function broadcastSignalClosed(signal: any) {
  if (!io) return;

  io.to('signals').emit('signal:closed', {
    id: signal.id,
    asset: signal.asset,
    result: signal.result,
    pnlPips: signal.pnlPips,
    status: signal.status,
  });
}

export function notifyUser(userId: string, event: string, data: any) {
  if (!io) return;

  io.to(`user:${userId}`).emit(event, data);
}
