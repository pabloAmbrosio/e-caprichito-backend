import { AdminRole, CustomerRole } from '../../../lib/roles';

export const resolveCustomerRole = (
    adminRole: AdminRole,
    customerRole?: CustomerRole | null
): CustomerRole | null | undefined => {
    if (adminRole === 'CUSTOMER' && !customerRole) {
        return 'MEMBER';
    }
    return customerRole;
};
