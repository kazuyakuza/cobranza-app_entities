import { describe, it, expect } from 'vitest';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';
import { Currency } from '../../enums/currency.enum';
import { DebtStatus } from '../../enums/debt-status.enum';
import { InvoiceStatus } from '../../enums/invoice-status.enum';
import { MatchMethod } from '../../enums/match-method.enum';
import { PaymentAttemptStatus } from '../../enums/payment-attempt-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

describe('Enum group A values', () => {
  it('Bank', () => {
    expect(Bank.GALICIA).toBe('GALICIA');
    expect(Bank.BBVA).toBe('BBVA');
    expect(Bank.SANTANDER).toBe('SANTANDER');
    expect(Bank.BRUBANK).toBe('BRUBANK');
    expect(Bank.MERCADOPAGO).toBe('MERCADOPAGO');
  });

  it('BankStatementFormat', () => {
    expect(BankStatementFormat.PDF_TEXT).toBe('PDF_TEXT');
    expect(BankStatementFormat.PDF_TABLA).toBe('PDF_TABLA');
    expect(BankStatementFormat.EXCEL).toBe('EXCEL');
    expect(BankStatementFormat.CSV).toBe('CSV');
    expect(BankStatementFormat.API).toBe('API');
  });

  it('BankStatementStatus', () => {
    expect(BankStatementStatus.UPLOADED).toBe('UPLOADED');
    expect(BankStatementStatus.PARSING).toBe('PARSING');
    expect(BankStatementStatus.PROCESSED).toBe('PROCESSED');
    expect(BankStatementStatus.FAILED).toBe('FAILED');
    expect(BankStatementStatus.MANUALLY_REVIEWED).toBe('MANUALLY_REVIEWED');
  });

  it('BankTransactionStatus', () => {
    expect(BankTransactionStatus.UNMATCHED).toBe('UNMATCHED');
    expect(BankTransactionStatus.MATCHED).toBe('MATCHED');
    expect(BankTransactionStatus.IGNORED).toBe('IGNORED');
  });

  it('Currency', () => {
    expect(Currency.ARS).toBe('ARS');
    expect(Currency.USD).toBe('USD');
  });

  it('DebtStatus', () => {
    expect(DebtStatus.PENDING).toBe('PENDING');
    expect(DebtStatus.OVERDUE).toBe('OVERDUE');
    expect(DebtStatus.PARTIALLY_PAID).toBe('PARTIALLY_PAID');
    expect(DebtStatus.PAID).toBe('PAID');
    expect(DebtStatus.CANCELLED).toBe('CANCELLED');
  });

  it('InvoiceStatus', () => {
    expect(InvoiceStatus.PENDING).toBe('PENDING');
    expect(InvoiceStatus.PAID).toBe('PAID');
    expect(InvoiceStatus.PARTIALLY_PAID).toBe('PARTIALLY_PAID');
    expect(InvoiceStatus.OVERDUE).toBe('OVERDUE');
    expect(InvoiceStatus.CANCELLED).toBe('CANCELLED');
  });

  it('MatchMethod', () => {
    expect(MatchMethod.AUTOMATIC).toBe('AUTOMATIC');
    expect(MatchMethod.MANUAL).toBe('MANUAL');
  });

  it('PaymentAttemptStatus', () => {
    expect(PaymentAttemptStatus.UPLOADED).toBe('UPLOADED');
    expect(PaymentAttemptStatus.PARSE_FAILED).toBe('PARSE_FAILED');
    expect(PaymentAttemptStatus.PENDING_VALIDATION).toBe('PENDING_VALIDATION');
    expect(PaymentAttemptStatus.MATCHED).toBe('MATCHED');
    expect(PaymentAttemptStatus.APPROVED).toBe('APPROVED');
    expect(PaymentAttemptStatus.REJECTED).toBe('REJECTED');
  });

  it('PaymentStatus', () => {
    expect(PaymentStatus.CONFIRMED).toBe('CONFIRMED');
    expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
  });
});
