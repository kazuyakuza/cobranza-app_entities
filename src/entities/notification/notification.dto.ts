import type { Notification } from './notification.entity';

/**
 * Fields required to create a Notification.
 * Omits system-generated `sentAt`.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateNotificationDto = Omit<Notification, 'id' | 'createdAt' | 'sentAt'>;

/**
 * Fields allowed when updating a Notification.
 * All fields inherit the encryption conventions from CreateNotificationDto.
 */
export type UpdateNotificationDto = Partial<CreateNotificationDto>;

/**
 * Full Notification shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface NotificationResponse extends Notification {}
