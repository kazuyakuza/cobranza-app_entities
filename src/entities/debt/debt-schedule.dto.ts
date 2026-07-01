import type { DebtSchedule } from './debt-schedule.entity';

/**
 * Broad DTO: omits only the BaseEntity audit fields.
 */
export type CreateDebtScheduleDto = Omit<
  DebtSchedule,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
>;

/**
 * Fields allowed when updating a DebtSchedule.
 */
export type UpdateDebtScheduleDto = Partial<CreateDebtScheduleDto>;

/**
 * Full DebtSchedule shape returned by the API.
 */
export type DebtScheduleResponse = DebtSchedule;
