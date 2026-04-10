import type { MessageChannel, MessageProvider, SendResult } from '../messaging.types';

export class LogProvider implements MessageProvider {
  readonly channel: MessageChannel;
  readonly name = 'log';

  constructor(channel: MessageChannel) {
    this.channel = channel;
  }

  async send(to: string, message: string): Promise<SendResult> {
    const label = this.channel.toUpperCase();
    console.log(`\n[${label} SIMULADO] Para: ${to} | Mensaje: ${message}\n`);
    return { success: true, channel: this.channel, provider: this.name };
  }
}
