import type { Notification } from './notification.entity';

/**
 * Fields required to create a Notification.
 * Omits system-generated `sentAt`.
 */
export type CreateNotificationDto = Omit<Notification, 'id' | 'createdAt' | 'sentAt'>;

/**
 * Fields allowed when updating a Notification.
 */
export type UpdateNotificationDto = Partial<CreateNotificationDto>;

/**
 * Full Notification shape returned by the API.
 */
export interface NotificationResponse extends Notification {}
