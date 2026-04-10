import { UpdateUserInput } from "../../schemas";
import { UpdateNormalizedFields } from "../../types";
import { normalizeEmail, normalizePhone } from "../../utils/normalize";

// undefined = field not sent, null = clear field
export function normalizeContactFields(data: UpdateUserInput): UpdateNormalizedFields {
  return {
    email: data.email !== undefined
      ? (data.email !== null ? normalizeEmail(data.email) : null)
      : undefined,
    phone: data.phone !== undefined
      ? (data.phone !== null ? normalizePhone(data.phone) : null)
      : undefined,
  };
}
