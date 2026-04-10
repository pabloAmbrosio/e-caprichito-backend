# Lib — Messaging

## Patrón: Strategy + Registry

Desacopla el envío de mensajes del provider concreto. Los módulos llaman `messaging.send()` sin saber qué hay detrás.

## Componentes

- `messaging.types.ts` — Interface `MessageProvider` (contrato: `channel`, `name`, `send()`)
- `messaging.service.ts` — Registry central (`Map<canal, provider>`)
- `messaging.init.ts` — Bootstrap: registra providers según `SMS_MODE`
- `providers/` — Implementaciones concretas (Twilio SMS, Twilio WhatsApp, Log, LogEmail)

## Modos (SMS_MODE)

| Modo | SMS | WhatsApp | Email | Uso |
|------|-----|----------|-------|-----|
| `twilio` | Twilio real | Twilio real | Log (stub) | Producción |
| `whatsapp` | Log (consola) | Twilio real | Log (stub) | Híbrido — WhatsApp real, SMS solo log |
| `log` (default) | Log (consola) | Log (consola) | Log (stub) | Desarrollo |

## Extensibilidad

Para agregar un nuevo provider (ej: SendGrid para email): crear clase que implemente `MessageProvider`, registrarla en `messaging.init.ts`. Cero cambios en módulos consumidores.

## TODO

- Email sigue como stub (LogEmailProvider) — pendiente integrar provider real
