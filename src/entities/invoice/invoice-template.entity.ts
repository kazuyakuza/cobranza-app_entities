import type { UUID } from '../../types/common';
import type { BaseEntity } from '../../interfaces/base-entity.interface';


/**
 * Template configurable by Company.
 */
export interface InvoiceTemplate extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Internal template name. */
  name: string;

  /** Subject (email or display). */
  subject: string;

  /** HTML with placeholders (`{{client_name}}`, `{{total_amount}}`, `{{due_date}}`, etc.). */
  bodyHtml: string;

  /** Whether this is the default template. Default: false. */
  isDefault: boolean;

  /** Whether the template is active. Default: true. */
  active: boolean;
}
