import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { DebtScheduleFrequency } from '../../enums/debt-schedule-frequency.enum';
import { CalculationType } from '../../enums/calculation-type.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';


/**
 * Recurring / scheduled debt.
 */
export interface DebtSchedule extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** UUID to group multiple DebtSchedules created in bulk (allows group editing). */
  groupId?: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Name of the recurrence. */
  name: string;

  /** Description. */
  description?: string;

  /** Base amount. */
  amount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** `'WEEKLY'`, `'MONTHLY'`, `'BIMONTHLY'`, `'QUARTERLY'`, `'YEARLY'`. */
  frequency: DebtScheduleFrequency;

  /** E.g., `15` -> day 15 of the month. `2L` -> 2nd Monday, `4V` -> 4th Friday, `1D` -> 1st Sunday, etc. */
  dayOfMonth: string;

  /** `'FIXED'` or `'FORMULA'`. */
  calculationType: CalculationType;

  /** For dynamic calculations. */
  calculationFormula?: string;

  /** Daily rate after due date (inheritable by generated debts). */
  dailyInterestRate?: Decimal;

  /** Whether the schedule is active. Default: true. */
  active: boolean;

  /** Start date. */
  startDate: Date;

  /** End date. Null = undefined (no end date). */
  endDate?: Date;

  /** Last date when debts were generated from this schedule. */
  lastGeneratedDate?: Date;

  /** Default template for generated debts. */
  invoiceTemplateId?: UUID;
}
