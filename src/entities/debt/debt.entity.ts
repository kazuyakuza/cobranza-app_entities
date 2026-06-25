import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import type { JsonData } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { DebtStatus } from '../../enums/debt-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Individual debt.
 */
export interface Debt extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Reference if the debt was automatically generated from a schedule. */
  debtScheduleId?: UUID;

  /** Human-readable code (e.g., `DEUD-2026-0042`). */
  debtCode: string;

  /** Debt concept / description. Optional. */
  description?: string;

  /** Original amount. */
  totalAmount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Due date. */
  dueDate: Date;

  /** Issue date. */
  issueDate: Date;

  /** Daily interest rate after due date (e.g., 0.0050 = 0.5% daily). Null = no interest. */
  dailyInterestRate?: Decimal;

  /** Status of the debt. */
  status: DebtStatus;

  /** Additional notes. */
  notes?: string;

  /** Extra data. */
  extraData?: JsonData;

  /** Invoice/receipt template to use. */
  invoiceTemplateId?: UUID;
}
