import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';
import type { EncryptedValue } from '../../types/encrypted';

/**
 * Parsed transactions from the statement.
 */
export interface BankTransaction {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the bank statement. */
  bankStatementId: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Client detected automatically or manually from the transfer data. */
  clientId?: UUID;

  /** Transaction date. */
  transactionDate: Date;

  /** Amount. */
  amount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Full bank description. */
  description: EncryptedValue;

  /** Reference / operation / CBU / alias number. */
  reference?: EncryptedValue | null;

  /** Hash of reference for indexed search/lookup. */
  referenceHash?: string | null;

  /** Balance after. */
  balanceAfter?: Decimal;

  /** Status of the transaction. */
  status: BankTransactionStatus;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
