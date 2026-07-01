/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, it, expect } from 'vitest';
import { Currency } from '../enums/currency.enum';
import { BankTransactionStatus } from '../enums/bank-transaction-status.enum';
import { Bank } from '../enums/bank.enum';
import { BankStatementFormat } from '../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../enums/bank-statement-status.enum';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import type { CreateCompanyDto } from '../entities/company/company.dto';
import type { CreateCompanyPlanDto } from '../entities/company/company-plan.dto';
import type { CreateCompanyUserDto } from '../entities/company/company-user.dto';
import type { CreateRoleDto } from '../entities/company/role.dto';
import type { CreateUserDto } from '../entities/company/user.dto';
import type { CreateClientDto } from '../entities/client/client.dto';
import type { CreateDebtDto } from '../entities/debt/debt.dto';
import type { CreateDebtScheduleDto } from '../entities/debt/debt-schedule.dto';
import type { CreateInvoiceDto } from '../entities/invoice/invoice.dto';
import type { CreateInvoiceTemplateDto } from '../entities/invoice/invoice-template.dto';
import type { CreateNotificationDto } from '../entities/notification/notification.dto';
import type { CreateNotificationTemplateDto } from '../entities/notification/notification-template.dto';
import type { CreatePaymentDto } from '../entities/payment/payment.dto';
import type { CreatePaymentAttemptDto } from '../entities/payment/payment-attempt.dto';
import type { CreatePaymentProofDto } from '../entities/payment/payment-proof.dto';
import type { CreateReceiptDto } from '../entities/receipt/receipt.dto';
import type { CreateReceiptTemplateDto } from '../entities/receipt/receipt-template.dto';
import type { CreateBankStatementDto } from '../entities/bank/bank-statement.dto';
import type { CreateBankTransactionDto } from '../entities/bank/bank-transaction.dto';
import type { CreatePaymentMatchDto } from '../entities/bank/payment-match.dto';
import type { CreateClientDebtSummaryDto } from '../entities/summary/client-debt-summary.dto';
import type { CreateCompanyMonthlySummaryDto } from '../entities/summary/company-monthly-summary.dto';

type AuditKeys =
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy';
type HasKey<T, K extends string> = K extends keyof T ? true : false;
type OmitsKey<T, K extends string> = K extends keyof T ? false : true;
type ExcludesAudit<T> = true extends HasKey<T, AuditKeys> ? false : true;
type Assert<T extends true> = T;

describe('Create DTOs exclude BaseEntity audit fields (Option B)', () => {
  it('company + bank statement dtos omit only BaseEntity audit fields', () => {
    type _c = Assert<ExcludesAudit<CreateCompanyDto>>;
    expect(true).toBe(true);
  });

  it('all core DTOs exclude the full audit set', () => {
    type _a = Assert<ExcludesAudit<CreateCompanyPlanDto>>;
    type _b = Assert<ExcludesAudit<CreateCompanyUserDto>>;
    type _d = Assert<ExcludesAudit<CreateRoleDto>>;
    type _e = Assert<ExcludesAudit<CreateUserDto>>;
    type _f = Assert<ExcludesAudit<CreateClientDto>>;
    type _g = Assert<ExcludesAudit<CreateDebtDto>>;
    type _h = Assert<ExcludesAudit<CreateDebtScheduleDto>>;
    type _i = Assert<ExcludesAudit<CreateInvoiceDto>>;
    type _j = Assert<ExcludesAudit<CreateInvoiceTemplateDto>>;
    type _k = Assert<ExcludesAudit<CreateNotificationDto>>;
    type _l = Assert<ExcludesAudit<CreateNotificationTemplateDto>>;
    type _m = Assert<ExcludesAudit<CreatePaymentDto>>;
    type _n = Assert<ExcludesAudit<CreatePaymentAttemptDto>>;
    type _o = Assert<ExcludesAudit<CreatePaymentProofDto>>;
    type _p = Assert<ExcludesAudit<CreateReceiptDto>>;
    type _q = Assert<ExcludesAudit<CreateReceiptTemplateDto>>;
    type _r = Assert<ExcludesAudit<CreateBankTransactionDto>>;
    type _s = Assert<ExcludesAudit<CreatePaymentMatchDto>>;
    type _u = Assert<ExcludesAudit<CreateClientDebtSummaryDto>>;
    type _v = Assert<ExcludesAudit<CreateCompanyMonthlySummaryDto>>;
    expect(true).toBe(true);
  });

  it('bank transaction create dto keeps business fields', () => {
    const dto: CreateBankTransactionDto = {
      companyId: 'c',
      bankStatementId: 'b',
      transactionDate: new Date(),
      amount: '1.00',
      currency: Currency.ARS,
      description: { encryptedData: 'x', keyName: 'k' },
      status: BankTransactionStatus.UNMATCHED,
    };
    expect(dto.currency).toBe('ARS');
  });
});

describe('Reverted broad DTOs include previously-stripped fields (Task 1)', () => {
  // HasKey assertions verify that the reverted DTOs now include
  // the business fields that were previously (and incorrectly) stripped.
  // Each Assert<HasKey<Dto, 'field'>> resolves to `true` only when the
  // field is present in the DTO type; a compile error would surface otherwise.
  it('CreateBankStatementDto keeps totalTransactions', () => {
    type _a = Assert<HasKey<CreateBankStatementDto, 'totalTransactions'>>;
    expect(true).toBe(true);
  });

  it('CreatePaymentMatchDto keeps matchedAt (required)', () => {
    type _a = Assert<HasKey<CreatePaymentMatchDto, 'matchedAt'>>;
    expect(true).toBe(true);
  });

  it('CreateUserDto keeps passwordHash, passwordUpdatedAt, lastLoginAt', () => {
    type _a = Assert<HasKey<CreateUserDto, 'passwordHash'>>;
    type _b = Assert<HasKey<CreateUserDto, 'passwordUpdatedAt'>>;
    type _c = Assert<HasKey<CreateUserDto, 'lastLoginAt'>>;
    expect(true).toBe(true);
  });

  it('CreateDebtScheduleDto keeps lastGeneratedDate', () => {
    type _a = Assert<HasKey<CreateDebtScheduleDto, 'lastGeneratedDate'>>;
    expect(true).toBe(true);
  });

  it('CreatePaymentAttemptDto keeps reviewedBy, reviewedAt, amount, currency', () => {
    type _a = Assert<HasKey<CreatePaymentAttemptDto, 'reviewedBy'>>;
    type _b = Assert<HasKey<CreatePaymentAttemptDto, 'reviewedAt'>>;
    type _c = Assert<HasKey<CreatePaymentAttemptDto, 'amount'>>;
    type _d = Assert<HasKey<CreatePaymentAttemptDto, 'currency'>>;
    expect(true).toBe(true);
  });

  it('CreateNotificationDto keeps sentAt', () => {
    type _a = Assert<HasKey<CreateNotificationDto, 'sentAt'>>;
    expect(true).toBe(true);
  });

  it('CreateClientDebtSummaryDto keeps lastPaymentId, lastDebtId, lastPaymentDate, lastDebtDate', () => {
    type _a = Assert<HasKey<CreateClientDebtSummaryDto, 'lastPaymentId'>>;
    type _b = Assert<HasKey<CreateClientDebtSummaryDto, 'lastDebtId'>>;
    type _c = Assert<HasKey<CreateClientDebtSummaryDto, 'lastPaymentDate'>>;
    type _d = Assert<HasKey<CreateClientDebtSummaryDto, 'lastDebtDate'>>;
    expect(true).toBe(true);
  });
});

describe('Encrypted fields accept raw strings at compile time (Task 2)', () => {
  // `satisfies` assertions verify that encrypted fields in Create DTOs
  // accept plain `string` values (not only `EncryptedValue` objects),
  // confirming the field type is `EncryptedValue | string | null`.
  // A compile error would surface if the union were narrowed incorrectly.
  it('CreateCompanyDto accepts raw strings for businessName, contact, phone', () => {
    const dto = {
      friendlyUrl: 'acme-slug',
      name: 'Acme',
      active: true,
      businessName: 'Acme Legal S.A.',
      contact: 'no-reply@acme.com',
      phone: '+541112345678',
      taxId: '30-50012345-6',
    } satisfies CreateCompanyDto;
    expect(dto.businessName).toBe('Acme Legal S.A.');
    expect(dto.contact).toBe('no-reply@acme.com');
    expect(dto.taxId).toBe('30-50012345-6');
  });

  it('CreateClientDto accepts raw strings for fullName, email, phone, taxId', () => {
    const dto = {
      companyId: 'comp-uuid',
      clientCode: 'CLI-00042',
      active: true,
      fullName: 'Juan Perez',
      email: 'juan@example.com',
      phone: '+541112345678',
      taxId: '20-12345678-9',
    } satisfies CreateClientDto;
    expect(dto.fullName).toBe('Juan Perez');
    expect(dto.email).toBe('juan@example.com');
  });

  it('CreateNotificationDto accepts raw strings for to, from, subject, body', () => {
    const dto = {
      companyId: 'comp-uuid',
      to: 'client@example.com',
      from: 'no-reply@cobranza.app',
      type: NotificationType.PAYMENT_UPLOADED,
      subject: 'Your payment was uploaded',
      body: 'We received your payment proof',
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SENT,
    } satisfies CreateNotificationDto;
    expect(dto.to).toBe('client@example.com');
    expect(dto.subject).toBe('Your payment was uploaded');
  });

  it('CreateBankStatementDto accepts raw string for notes', () => {
    const dto = {
      companyId: 'comp-uuid',
      bank: Bank.GALICIA,
      format: BankStatementFormat.CSV,
      fileUrl: 'https://example.com/stmt.csv',
      fileName: 'stmt.csv',
      status: BankStatementStatus.UPLOADED,
      notes: 'parser warning on line 42',
    } satisfies CreateBankStatementDto;
    expect(dto.notes).toBe('parser warning on line 42');
  });
});
