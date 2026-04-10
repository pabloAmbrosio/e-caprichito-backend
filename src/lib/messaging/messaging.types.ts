export type MessageChannel = 'sms' | 'email' | 'whatsapp';

export interface SendMessageOptions {
  channel: MessageChannel;
  to: string;
  message: string;
  subject?: string;
  template?: {
    id: string;
    variables: Record<string, string>;
  };
}

export interface SendResult {
  success: boolean;
  channel: MessageChannel;
  provider: string;
}

export interface MessageProvider {
  readonly channel: MessageChannel;
  readonly name: string;
  send(to: string, message: string, options?: {
    subject?: string;
    template?: { id: string; variables: Record<string, string> };
  }): Promise<SendResult>;
}
