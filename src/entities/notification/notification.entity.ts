import type { UUID } from '../../types/common';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import type { EncryptedValue } from '../../types/encrypted';

/**
 * Notification sent to a user or client.
 */
export interface Notification {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId?: UUID;

  /** Recipient user (Company or End User). */
  userId?: UUID;

  /** Template used (if applicable). */
  notificationTemplateId?: UUID;

  /** Destination email / phone / WhatsApp. */
  to: EncryptedValue;

  /** Sender (e.g., no-reply@conciliador.app). */
  from?: EncryptedValue | null;

  /** Type of notification. */
  type: NotificationType;

  /** Final subject. */
  subject: EncryptedValue;

  /** Final content (HTML or text). */
  body: EncryptedValue;

  /** Delivery channel. */
  channel: NotificationChannel;

  /** Delivery status. */
  status: NotificationStatus;

  /** Timestamp when the notification was sent. */
  sentAt?: Date;

  /** Timestamp when the entity was created. */
  createdAt: Date;
}
