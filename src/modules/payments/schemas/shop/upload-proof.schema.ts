import * as v from 'valibot';
import { ALLOWED_PROOF_DOMAINS, BANK_REFERENCE_REGEX } from '../../constants';

export const UploadProofParamsSchema = v.object({
  id: v.pipe(
    v.string('El ID del pago debe ser texto'),
    v.uuid('ID de pago inválido')
  ),
});

export type UploadProofParams = v.InferInput<typeof UploadProofParamsSchema>;

const validateAllowedDomain = v.check((url: string) => {
  try {
    const parsedUrl = new URL(url);
    return (ALLOWED_PROOF_DOMAINS as readonly string[]).includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}, `La URL del comprobante debe pertenecer a un dominio permitido: ${ALLOWED_PROOF_DOMAINS.join(', ')}`);

export const UploadProofBodySchema = v.object({
  screenshotUrl: v.pipe(
    v.string('La URL de la captura debe ser texto'),
    v.url('La URL de la captura no es válida'),
    validateAllowedDomain
  ),

  bankReference: v.optional(
    v.pipe(
      v.string('La referencia bancaria debe ser texto'),
      v.trim(),
      v.maxLength(100, 'La referencia bancaria no puede exceder 100 caracteres'),
      v.regex(BANK_REFERENCE_REGEX, 'La referencia bancaria contiene caracteres no permitidos. Solo se permiten letras, números, guiones y espacios.')
    )
  ),
});

export type UploadProofBody = v.InferInput<typeof UploadProofBodySchema>;
