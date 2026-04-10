import { MessagingService } from './messaging.service';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { TwilioWhatsAppProvider } from './providers/twilio-whatsapp.provider';
import { LogProvider } from './providers/log.provider';
import { LogEmailProvider } from './providers/log-email.provider';
import { env } from '../../config/env';

const messaging = new MessagingService();

const smsMode = env.SMS_MODE;

// twilio: producción — todo se envía via Twilio (SMS + WhatsApp reales)
// whatsapp: híbrido — WhatsApp real via Twilio, SMS solo log en consola
// log (default): desarrollo — todo se imprime en consola, nada se envía
if (smsMode === 'twilio') {
  messaging.register(new TwilioSmsProvider());
  messaging.register(new TwilioWhatsAppProvider());
} else if (smsMode === 'whatsapp') {
  messaging.register(new TwilioWhatsAppProvider());
  messaging.register(new LogProvider('sms'));
} else {
  messaging.register(new LogProvider('sms'));
  messaging.register(new LogProvider('whatsapp'));
}

// Email: stub hasta integrar SendGrid/Mailgun
messaging.register(new LogEmailProvider());

export { messaging };
