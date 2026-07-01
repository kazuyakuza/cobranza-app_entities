import { describe, it, expect } from 'vitest';
import type { Notification } from '../../entities/notification/notification.entity';
import type { ClientDebtSummary } from '../../entities/summary/client-debt-summary.entity';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import { ClientDebtSummaryStatus } from '../../enums/client-debt-summary-status.enum';
import { Currency } from '../../enums/currency.enum';

describe('Notification entity', () => {
  it('accepts a valid notification object', () => {
    const notification = {
      id: 'notif-uuid',
      companyId: 'comp-uuid',
      to: { encryptedData: 'encrypted-to', keyName: 'test-key' },
      type: NotificationType.PAYMENT_UPLOADED,
      subject: { encryptedData: 'encrypted-subject', keyName: 'test-key' },
      body: { encryptedData: 'encrypted-body', keyName: 'test-key' },
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SENT,
      createdAt: new Date(),
      createdBy: 'user-uuid',
    } satisfies Notification;

    expect(notification.channel).toBe(NotificationChannel.EMAIL);
    expect(notification.status).toBe(NotificationStatus.SENT);
  });

  // Verifies that encrypted fields (to, from, subject, body) accept
  // plain strings at compile time, confirming the type union
  // `EncryptedValue | string | null` is correctly exposed on the entity.
  it('accepts raw strings in encrypted to, from, subject, body', () => {
    const notification = {
      id: 'notif-uuid-2',
      companyId: 'comp-uuid',
      to: 'cliente@example.com',
      from: 'no-reply@cobranza.app',
      type: NotificationType.PAYMENT_UPLOADED,
      subject: 'Comprobante de pago recibido',
      body: 'Hemos recibido su comprobante de pago',
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SENT,
      createdAt: new Date(),
      createdBy: 'user-uuid',
    } satisfies Notification;

    expect(notification.to).toBe('cliente@example.com');
    expect(notification.from).toBe('no-reply@cobranza.app');
    expect(notification.subject).toBe('Comprobante de pago recibido');
    expect(notification.body).toBe('Hemos recibido su comprobante de pago');
  });
});

describe('ClientDebtSummary entity', () => {
  it('accepts a valid summary object', () => {
    const summary = {
      id: 'sum-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      totalDebt: '5000.00',
      totalPaid: '2000.00',
      balance: '3000.00',
      currency: Currency.ARS,
      status: ClientDebtSummaryStatus.NORMAL,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies ClientDebtSummary;

    expect(summary.status).toBe(ClientDebtSummaryStatus.NORMAL);
  });
});
