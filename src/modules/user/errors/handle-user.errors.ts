import { FastifyReply, FastifyRequest } from 'fastify';
import { DefaultUserErrorHandler } from './default.error';
import { UserNotFoundErrorHandler } from './custom/user-not-found.error';
import { UserAlreadyDeletedErrorHandler } from './custom/user-already-deleted.error';
import { DuplicateUsernameErrorHandler } from './custom/duplicate-username.error';
import { DuplicateEmailErrorHandler } from './custom/duplicate-email.error';
import { DuplicatePhoneErrorHandler } from './custom/duplicate-phone.error';
import { DuplicateFieldErrorHandler } from './custom/duplicate-field.error';
import { CannotModifyOwnRoleErrorHandler } from './custom/cannot-modify-own-role.error';
import { CannotModifyOwnerErrorHandler } from './custom/cannot-modify-owner.error';
import { CannotDeleteOwnAccountErrorHandler } from './custom/cannot-delete-own-account.error';
import { OnlyOwnerCanAssignAdminErrorHandler } from './custom/only-owner-can-assign-admin.error';
import { UserNotDeletedErrorHandler } from './custom/user-not-deleted.error';

const errorHandlers = [
    new UserNotFoundErrorHandler(),
    new UserAlreadyDeletedErrorHandler(),
    new UserNotDeletedErrorHandler(),
    new DuplicateUsernameErrorHandler(),
    new DuplicateEmailErrorHandler(),
    new DuplicatePhoneErrorHandler(),
    new DuplicateFieldErrorHandler(),
    new CannotModifyOwnRoleErrorHandler(),
    new CannotModifyOwnerErrorHandler(),
    new CannotDeleteOwnAccountErrorHandler(),
    new OnlyOwnerCanAssignAdminErrorHandler(),
    new DefaultUserErrorHandler()
];

export const handleUserError = (
    error: unknown,
    reply: FastifyReply,
    request: FastifyRequest,
    context: string
) => {
    for (const handler of errorHandlers) {
        const result = handler.handle(error, reply, request, context);
        if (result) return result;
    }
};
