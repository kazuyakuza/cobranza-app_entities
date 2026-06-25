import type { NotificationTemplate } from './notification-template.entity';

/**
 * Fields required to create a NotificationTemplate.
 */
export type CreateNotificationTemplateDto = Omit<
  NotificationTemplate,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating a NotificationTemplate.
 */
export type UpdateNotificationTemplateDto = Partial<CreateNotificationTemplateDto>;

/**
 * Full NotificationTemplate shape returned by the API.
 */
export type NotificationTemplateResponse = NotificationTemplate;
