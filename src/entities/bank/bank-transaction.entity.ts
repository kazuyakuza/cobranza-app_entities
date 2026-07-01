import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';
import type { EncryptedValue } from '../../types/encrypted';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Parsed transactions from the statement.
 */
export interface BankTransaction extends BaseEntity {
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

  /**
   * Full bank description.
   * Accepts `EncryptedValue | string`. Microservices may pass raw strings before encryption.
   */
  description: EncryptedValue | string;

  /**
   * Reference / operation / CBU / alias number.
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  reference?: EncryptedValue | string | null;

  /** Hash of reference for indexed search/lookup. */
  referenceHash?: string | null;

  /** Balance after. */
  balanceAfter?: Decimal;

  /** Status of the transaction. */
  status: BankTransactionStatus;
}
