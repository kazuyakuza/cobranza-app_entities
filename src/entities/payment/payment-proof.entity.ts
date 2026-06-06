import type { UUID } from '../../types/common';
import type { EncryptedValue } from '../../types/encrypted';

/**
 * Proof of payment uploaded by the Client.
 */
export interface PaymentProof {
  /** Primary key identifier. */
  id: UUID;

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

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** ID of the Client or System who created this proof. */
  createdBy?: UUID;
}
