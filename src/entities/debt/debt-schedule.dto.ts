import type { DebtSchedule } from './debt-schedule.entity';

/**
 * Fields required to create a DebtSchedule.
 * Omits `BaseEntity`, `SoftDeletable`, and system-managed fields.
 */
export type CreateDebtScheduleDto = Omit<DebtSchedule,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt' | 'deletedBy' | 'lastGeneratedDate'
>;

/**
 * Fields allowed when updating a DebtSchedule.
 */
export type UpdateDebtScheduleDto = Partial<CreateDebtScheduleDto>;

/**
 * Full DebtSchedule shape returned by the API.
 */
export interface DebtScheduleResponse extends DebtSchedule {}