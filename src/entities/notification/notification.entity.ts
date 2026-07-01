import type { UUID } from '../../types/common';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import type { EncryptedValue } from '../../types/encrypted';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Notification sent to a user or client.
 */
export interface Notification extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId?: UUID;

  /** Recipient user (Company or End User). */
  userId?: UUID;

  /** Template used (if applicable). */
  notificationTemplateId?: UUID;

  /**
   * Destination email / phone / WhatsApp.
   * Accepts `EncryptedValue | string`. Microservices may pass raw strings before encryption.
   */
  to: EncryptedValue | string;

  /**
   * Sender (e.g., no-reply@conciliador.app).
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  from?: EncryptedValue | string | null;

  /** Type of notification. */
  type: NotificationType;

  /**
   * Final subject.
   * Accepts `EncryptedValue | string`. Microservices may pass raw strings before encryption.
   */
  subject: EncryptedValue | string;

  /**
   * Final content (HTML or text).
   * Accepts `EncryptedValue | string`. Microservices may pass raw strings before encryption.
   */
  body: EncryptedValue | string;

  /** Delivery channel. */
  channel: NotificationChannel;

  /** Delivery status. */
  status: NotificationStatus;

  /** Timestamp when the notification was sent. */
  sentAt?: Date;
}
