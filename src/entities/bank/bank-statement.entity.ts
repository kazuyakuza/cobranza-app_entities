import type { UUID } from '../../types/common';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';
import type { EncryptedValue } from '../../types/encrypted';

/**
 * Uploaded bank statement (process-only).
 */
export interface BankStatement extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** E.g., `'GALICIA'`, `'BBVA'`, `'SANTANDER'`, `'BRUBANK'`, `'MERCADOPAGO'`, etc. */
  bank: Bank;

  /** E.g., `'PDF_TEXT'`, `'PDF_TABLA'`, `'EXCEL'`, `'CSV'`, `'API'` — Defines which parser to use. */
  format: BankStatementFormat;

  /** URL of the uploaded statement. */
  fileUrl: string;

  /** Original file name. */
  fileName: string;

  /** Start of the statement period. */
  periodFrom?: Date;

  /** End of the statement period. */
  periodTo?: Date;

  /** Status of the statement. */
  status: BankStatementStatus;

  /** Number of detected transactions. */
  totalTransactions?: number;

  /**
   * Notes (useful for parsing errors).
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  notes?: EncryptedValue | string | null;
}
