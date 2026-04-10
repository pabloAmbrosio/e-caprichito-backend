export const BANK_DETAILS = {
  bankName: process.env.BANK_NAME ?? "BBVA",
  accountHolder: process.env.BANK_ACCOUNT_HOLDER ?? "E-Caprichito",
  clabe: process.env.BANK_CLABE ?? "",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "",
} as const;
