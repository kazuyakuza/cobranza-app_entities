import type { UUID } from '../../types/common';
import type { EncryptedValue } from '../../types/encrypted';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Proof of payment uploaded by the Client.
 */
export interface PaymentProof extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** URL of the uploaded proof. */
  fileUrl: string;

  /** Original file name. */
  fileName: string;

  /** MIME type (image/jpeg, application/pdf, etc.). */
  fileType?: string;

  /** Additional notes entered by the client when uploading. */
  notes?: EncryptedValue | null;
}
