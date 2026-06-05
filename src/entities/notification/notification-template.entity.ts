import type { UUID } from '../../types/common';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Template for notifications.
 */
export interface NotificationTemplate extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Internal name. */
  name: string;

  /** Same as `Notification.type`. */
  type: NotificationType;

  /** Subject with placeholders. */
  subject: string;

  /** Plain text version (for WhatsApp/SMS). */
  bodyPlain?: string;

  /** HTML version (for email). */
  bodyHtml: string;

  /** Delivery channel. */
  channel: NotificationChannel;

  /** Whether this is the default template. Default: false. */
  isDefault: boolean;

  /** Whether the template is active. Default: true. */
  active: boolean;
}
