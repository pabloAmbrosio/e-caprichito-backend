export const formatError = (error: unknown): { message: string; stack?: string } => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return { message, stack };
};
