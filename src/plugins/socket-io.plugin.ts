import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Server } from 'socket.io';
import { getAllowedOrigins } from '../config/cors.config';
import { SOCKET_ROOMS } from '../config/socket.config';
import { STAFF_ROLES } from '../lib/roles';

const socketIO = async (fastify: FastifyInstance) => {
  const io = new Server(fastify.server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      fastify.log.warn({ socketId: socket.id }, '[SOCKET.IO] Conexion rechazada: token no proporcionado');
      return next(new Error('Token de autenticacion requerido'));
    }

    try {
      const payload = fastify.jwt.verify<{ userId: string; adminRole?: string }>(token);
      socket.data.userId = payload.userId;
      socket.data.adminRole = payload.adminRole;
      next();
    } catch {
      fastify.log.warn({ socketId: socket.id }, '[SOCKET.IO] Conexion rechazada: token invalido o expirado');
      next(new Error('Token invalido o expirado'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const adminRole = socket.data.adminRole;
    
    socket.join(SOCKET_ROOMS.user(userId));

    if (adminRole && STAFF_ROLES.includes(adminRole)) {
      socket.join(SOCKET_ROOMS.staff);
    }
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', (reason) => {
      fastify.log.info({ socketId: socket.id, userId: socket.data.userId, reason }, '[SOCKET.IO] Desconectado');
    });
  });

  fastify.decorate('io', io);
};

export const socketIOPlugin = fp(socketIO);

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}
