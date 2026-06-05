import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { InvoiceStatus } from '../../enums/invoice-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Receipt / Promissory note (formal representation visible to the client).
 */
export interface Receipt extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Reference to the debt. */
  debtId: UUID;

  /** Template used to generate this receipt. */
  receiptTemplateId?: UUID;

  /** Human-readable number. */
  receiptNumber: string;

  /** Issue date. */
  issueDate: Date;

  /** Due date. */
  dueDate: Date;

  /** Total amount. */
  totalAmount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Status of the receipt. */
  status: InvoiceStatus;

  /** Additional notes. */
  notes?: string;
}
