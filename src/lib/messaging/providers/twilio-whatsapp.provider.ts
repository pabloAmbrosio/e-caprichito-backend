import type { MessageChannel, MessageProvider, SendResult } from '../messaging.types';
import { getTwilioClient, TWILIO_PHONE_NUMBER } from './twilio.config';

export class TwilioWhatsAppProvider implements MessageProvider {
  readonly channel: MessageChannel = 'whatsapp';
  readonly name = 'twilio-whatsapp';

  async send(to: string, message: string): Promise<SendResult> {
    const client = getTwilioClient();
    await client.messages.create({
      body: message,
      to: `whatsapp:${to}`,
      from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
    });
    return { success: true, channel: this.channel, provider: this.name };
  }
}
