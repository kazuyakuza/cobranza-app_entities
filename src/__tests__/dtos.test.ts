/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, it, expect } from 'vitest';
import { Currency } from '../enums/currency.enum';
import { BankTransactionStatus } from '../enums/bank-transaction-status.enum';
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
  it('company + bank statement dtos omit audit (totalTransactions omitted too)', () => {
    type _c = Assert<ExcludesAudit<CreateCompanyDto>>;
    type _t = Assert<OmitsKey<CreateBankStatementDto, 'totalTransactions'>>;
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
