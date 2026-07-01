import { describe, it, expect } from 'vitest';
import type { BankStatement } from '../../entities/bank/bank-statement.entity';
import type { BankTransaction } from '../../entities/bank/bank-transaction.entity';
import type { Invoice } from '../../entities/invoice/invoice.entity';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';
import { Currency } from '../../enums/currency.enum';
import { InvoiceStatus } from '../../enums/invoice-status.enum';

describe('BankStatement entity', () => {
  it('accepts a valid bank statement object', () => {
    const statement = {
      id: 'stmt-uuid',
      companyId: 'comp-uuid',
      bank: Bank.GALICIA,
      format: BankStatementFormat.CSV,
      fileUrl: 'https://example.com/stmt.csv',
      fileName: 'stmt.csv',
      status: BankStatementStatus.UPLOADED,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies BankStatement;

    expect(statement.bank).toBe(Bank.GALICIA);
    expect(statement.status).toBe(BankStatementStatus.UPLOADED);
  });

  // Verifies that the encrypted `notes` field accepts a plain string
  // at compile time, confirming the type union
  // `EncryptedValue | string | null` is correctly exposed on the entity.
  it('accepts raw string in encrypted notes', () => {
    const statement = {
      id: 'stmt-uuid-2',
      companyId: 'comp-uuid',
      bank: Bank.GALICIA,
      format: BankStatementFormat.CSV,
      fileUrl: 'https://example.com/stmt2.csv',
      fileName: 'stmt2.csv',
      status: BankStatementStatus.UPLOADED,
      notes: 'partial parse warning',
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies BankStatement;

    expect(statement.notes).toBe('partial parse warning');
  });
});

describe('Invoice entity', () => {
  it('accepts a valid invoice object', () => {
    const invoice = {
      id: 'inv-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtId: 'debt-uuid',
      invoiceNumber: 'A-0001-00000001',
      issueDate: new Date(),
      dueDate: new Date(),
      totalAmount: '2000.00',
      currency: Currency.ARS,
      status: InvoiceStatus.PENDING,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Invoice;

    expect(invoice.invoiceNumber).toBe('A-0001-00000001');
    expect(invoice.status).toBe(InvoiceStatus.PENDING);
  });
});

describe('BankTransaction entity', () => {
  // Verifies that encrypted fields (description, reference) accept
  // plain strings at compile time, confirming the type union
  // `EncryptedValue | string | null` is correctly exposed on the entity.
  it('accepts raw strings in encrypted description and reference', () => {
    const transaction = {
      id: 'txn-uuid',
      bankStatementId: 'stmt-uuid',
      companyId: 'comp-uuid',
      transactionDate: new Date(),
      amount: '100.00',
      currency: Currency.ARS,
      description: 'TRANSFERENCIA RECIBIDA',
      reference: 'CBU 0001234567890123456789',
      status: BankTransactionStatus.UNMATCHED,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies BankTransaction;

    expect(transaction.description).toBe('TRANSFERENCIA RECIBIDA');
    expect(transaction.reference).toBe('CBU 0001234567890123456789');
  });
});
