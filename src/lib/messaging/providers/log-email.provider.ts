import type { MessageChannel, MessageProvider, SendResult } from '../messaging.types';

export class LogEmailProvider implements MessageProvider {
  readonly channel: MessageChannel = 'email';
  readonly name = 'log-email';

  async send(to: string, message: string, options?: {
    subject?: string;
    template?: { id: string; variables: Record<string, string> };
  }): Promise<SendResult> {
    console.log('\n[EMAIL SIMULADO]');
    console.log(`  Para: ${to}`);
    if (options?.subject) console.log(`  Asunto: ${options.subject}`);
    if (options?.template) console.log(`  Template: ${options.template.id}`, options.template.variables);
    console.log(`  Mensaje: ${message}\n`);
    return { success: true, channel: this.channel, provider: this.name };
  }
}
