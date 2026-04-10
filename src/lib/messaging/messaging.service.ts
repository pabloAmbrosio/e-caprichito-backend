import type { MessageChannel, MessageProvider, SendMessageOptions, SendResult } from './messaging.types';
import { UnsupportedChannelError } from './messaging.errors';

export class MessagingService {
  private providers = new Map<MessageChannel, MessageProvider>();

  register(provider: MessageProvider): void {
    this.providers.set(provider.channel, provider);
  }

  async send(options: SendMessageOptions): Promise<SendResult> {
    
    const provider = this.providers.get(options.channel);

    if (!provider) {
      throw new UnsupportedChannelError(options.channel);
    }

    return provider.send(options.to, options.message, {
      subject: options.subject,
      template: options.template,
    });
  }

  hasProvider(channel: MessageChannel): boolean {
    return this.providers.has(channel);
  }
}
