import Twilio from "twilio";
import { env } from '../../../config/env';

export const TWILIO_ACCOUNT_SID = env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN;
export const TWILIO_PHONE_NUMBER = env.TWILIO_PHONE_NUMBER;

let client: ReturnType<typeof Twilio> | null = null;

export function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error(
      "[TWILIO] Faltan credenciales. Configura TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN."
    );
  }

  if (!client) {
    client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }

  return client;
}
