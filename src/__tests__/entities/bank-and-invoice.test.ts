import { describe, it, expect } from 'vitest';
import type { BankStatement } from '../../entities/bank/bank-statement.entity';
import type { Invoice } from '../../entities/invoice/invoice.entity';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
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
      updatedAt: new Date(),
    } satisfies BankStatement;

    expect(statement.bank).toBe(Bank.GALICIA);
    expect(statement.status).toBe(BankStatementStatus.UPLOADED);
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
      updatedAt: new Date(),
    } satisfies Invoice;

    expect(invoice.invoiceNumber).toBe('A-0001-00000001');
    expect(invoice.status).toBe(InvoiceStatus.PENDING);
  });
});
