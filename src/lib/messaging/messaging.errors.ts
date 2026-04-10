import type { MessageChannel } from './messaging.types';

export class UnsupportedChannelError extends Error {
  constructor(channel: MessageChannel) {
    super(`Canal de mensajería no soportado: "${channel}". No hay provider registrado para este canal.`);
    this.name = 'UnsupportedChannelError';
  }
}
