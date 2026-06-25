import type { ReceiptTemplate } from './receipt-template.entity';

/**
 * Fields required to create a ReceiptTemplate.
 * Omits `BaseEntity` audit fields.
 */
export type CreateReceiptTemplateDto = Omit<
  ReceiptTemplate,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating a ReceiptTemplate.
 */
export type UpdateReceiptTemplateDto = Partial<CreateReceiptTemplateDto>;

/**
 * Full ReceiptTemplate shape returned by the API.
 */
export type ReceiptTemplateResponse = ReceiptTemplate;
