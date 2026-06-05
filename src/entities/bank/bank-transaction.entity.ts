import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';

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
  description: string;

  /** Reference / operation / CBU / alias number. */
  reference?: string;

  /** Balance after. */
  balanceAfter?: Decimal;

  /** Status of the transaction. */
  status: BankTransactionStatus;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
