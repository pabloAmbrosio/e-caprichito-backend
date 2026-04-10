// Escapa %, _ y \ para ILIKE — NO usar para similarity() (ahí va raw)
export const sanitizeSearch = (trimmed: string): string => {
  return trimmed
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
};
