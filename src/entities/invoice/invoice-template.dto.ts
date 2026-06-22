import type { InvoiceTemplate } from './invoice-template.entity';

/**
 * Fields required to create an InvoiceTemplate.
 * Omits `BaseEntity` and `SoftDeletable` audit fields.
 */
export type CreateInvoiceTemplateDto = Omit<
  InvoiceTemplate,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating an InvoiceTemplate.
 */
export type UpdateInvoiceTemplateDto = Partial<CreateInvoiceTemplateDto>;

/**
 * Full InvoiceTemplate shape returned by the API.
 */
export type InvoiceTemplateResponse = InvoiceTemplate;
