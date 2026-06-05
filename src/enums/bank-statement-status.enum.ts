/**
 * Status of a bank statement upload and processing.
 */
export enum BankStatementStatus {
  UPLOADED = 'UPLOADED',
  PARSING = 'PARSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  MANUALLY_REVIEWED = 'MANUALLY_REVIEWED',
}