export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const normalizePhone = (phone: string): string => {
    return phone.trim().replace(/\s+/g, '');
};
