import { CreateUserInput } from "../schemas";

export interface CreateUserServiceInput {
  data: CreateUserInput;
  requestingAdminId?: string;
}

export interface CreateNormalizedFields {
  email: string | undefined;
  phone: string | undefined;
}
