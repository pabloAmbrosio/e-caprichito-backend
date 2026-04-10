// Escapes LIKE special chars (%, _, \) — not needed for similarity()
export const sanitizeAutocomplete = (trimmed: string): string => {
  return trimmed
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
};
