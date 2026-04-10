export interface AuditLogEntry {
    timestamp: string;
    module: string;
    action: string;
    performedBy: string;
    targetUserId: string;
    previousData: Record<string, unknown> | null;
    newData: Record<string, unknown> | null;
}

export const logUserAudit = (
    action: string,
    performedBy: string,
    targetUserId: string,
    previousData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null
): void => {
    const logEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        module: 'user',
        action,
        performedBy,
        targetUserId,
        previousData,
        newData,
    };
    console.log('[AUDIT]', JSON.stringify(logEntry));
};
