import type { Receipt } from './receipt.entity';

/**
 * Fields required to create a Receipt.
 */
export type CreateReceiptDto = Omit<
  Receipt,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating a Receipt.
 */
export type UpdateReceiptDto = Partial<CreateReceiptDto>;

/**
 * Full Receipt shape returned by the API.
 */
export type ReceiptResponse = Receipt;
