import type { Invoice } from './invoice.entity';

/**
 * Fields required to create an Invoice.
 */
export type CreateInvoiceDto = Omit<
  Invoice,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Fields allowed when updating an Invoice.
 */
export type UpdateInvoiceDto = Partial<CreateInvoiceDto>;

/**
 * Full Invoice shape returned by the API.
 */
export type InvoiceResponse = Invoice;
