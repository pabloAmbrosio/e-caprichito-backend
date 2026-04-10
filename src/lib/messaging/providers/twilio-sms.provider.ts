import type { MessageChannel, MessageProvider, SendResult } from '../messaging.types';
import { getTwilioClient, TWILIO_PHONE_NUMBER } from './twilio.config';

export class TwilioSmsProvider implements MessageProvider {
  readonly channel: MessageChannel = 'sms';
  readonly name = 'twilio';

  async send(to: string, message: string): Promise<SendResult> {
    const client = getTwilioClient();
    await client.messages.create({
      body: message,
      to,
      from: TWILIO_PHONE_NUMBER,
    });
    return { success: true, channel: this.channel, provider: this.name };
  }
}
