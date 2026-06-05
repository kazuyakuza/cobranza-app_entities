import { describe, it, expect } from 'vitest';
import { CalculationType } from '../../enums/calculation-type.enum';
import { ClientDebtSummaryStatus } from '../../enums/client-debt-summary-status.enum';
import { DebtScheduleFrequency } from '../../enums/debt-schedule-frequency.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import { NotificationType } from '../../enums/notification-type.enum';

describe('Enum group B values', () => {
  it('CalculationType', () => {
    expect(CalculationType.FIXED).toBe('FIXED');
    expect(CalculationType.FORMULA).toBe('FORMULA');
  });

  it('ClientDebtSummaryStatus', () => {
    expect(ClientDebtSummaryStatus.NORMAL).toBe('NORMAL');
    expect(ClientDebtSummaryStatus.OVERDUE).toBe('OVERDUE');
    expect(ClientDebtSummaryStatus.INACTIVE).toBe('INACTIVE');
  });

  it('DebtScheduleFrequency', () => {
    expect(DebtScheduleFrequency.WEEKLY).toBe('WEEKLY');
    expect(DebtScheduleFrequency.MONTHLY).toBe('MONTHLY');
    expect(DebtScheduleFrequency.BIMONTHLY).toBe('BIMONTHLY');
    expect(DebtScheduleFrequency.QUARTERLY).toBe('QUARTERLY');
    expect(DebtScheduleFrequency.YEARLY).toBe('YEARLY');
  });

  it('NotificationChannel', () => {
    expect(NotificationChannel.EMAIL).toBe('EMAIL');
    expect(NotificationChannel.WHATSAPP).toBe('WHATSAPP');
    expect(NotificationChannel.SMS).toBe('SMS');
  });

  it('NotificationStatus', () => {
    expect(NotificationStatus.PENDING).toBe('PENDING');
    expect(NotificationStatus.SENT).toBe('SENT');
    expect(NotificationStatus.FAILED).toBe('FAILED');
    expect(NotificationStatus.CANCELLED).toBe('CANCELLED');
  });

  it('NotificationType', () => {
    expect(NotificationType.PAYMENT_UPLOADED).toBe('PAYMENT_UPLOADED');
    expect(NotificationType.PAYMENT_APPROVED).toBe('PAYMENT_APPROVED');
    expect(NotificationType.PAYMENT_REJECTED).toBe('PAYMENT_REJECTED');
    expect(NotificationType.DEBT_OVERDUE).toBe('DEBT_OVERDUE');
  });
});
