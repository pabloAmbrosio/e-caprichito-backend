export const logJobSummary = (processedCount: number, failedCount: number, startTime: number): void => {
    const elapsed = Date.now() - startTime;
    if (processedCount > 0 || failedCount > 0) {
        console.info(
            `[OrderExpiration] Ejecucion completada:`,
            JSON.stringify({
                processedCount,
                failedCount,
                elapsedMs: elapsed,
                timestamp: new Date().toISOString(),
            })
        );
    }
};
