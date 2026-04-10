import { CreateUserInput } from "../../schemas";
import { CreateNormalizedFields } from "../../types";
import { normalizeEmail, normalizePhone } from "../../utils/normalize";

export function normalizeCreateInput(data: CreateUserInput): CreateNormalizedFields {
  return {
    email: data.email ? normalizeEmail(data.email) : undefined,
    phone: data.phone ? normalizePhone(data.phone) : undefined,
  };
}
