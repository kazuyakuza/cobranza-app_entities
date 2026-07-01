import { describe, it, expect } from 'vitest';
import type { Debt } from '../../entities/debt/debt.entity';
import type { Payment } from '../../entities/payment/payment.entity';
import type { PaymentProof } from '../../entities/payment/payment-proof.entity';
import { DebtStatus } from '../../enums/debt-status.enum';
import { Currency } from '../../enums/currency.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

describe('Debt entity', () => {
  it('accepts a valid debt object with required fields', () => {
    const debt = {
      id: 'debt-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtCode: 'DEUD-2026-0042',
      description: 'Test debt',
      totalAmount: '1000.00',
      currency: Currency.ARS,
      dueDate: new Date('2026-12-31'),
      issueDate: new Date('2026-01-01'),
      status: DebtStatus.PENDING,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Debt;

    expect(debt.currency).toBe(Currency.ARS);
    expect(debt.status).toBe(DebtStatus.PENDING);
  });

  it('allows omitting optional description field', () => {
    const debt: Debt = {
      id: 'debt-uuid-2',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtCode: 'DEUD-2026-0043',
      totalAmount: '500.00',
      currency: Currency.ARS,
      dueDate: new Date('2026-12-31'),
      issueDate: new Date('2026-01-01'),
      status: DebtStatus.PENDING,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    };

    expect(debt.description).toBeUndefined();
  });
});

describe('Payment entity', () => {
  it('accepts a valid payment object with required fields', () => {
    const payment = {
      id: 'pay-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtId: 'debt-uuid',
      amount: '500.00',
      currency: Currency.USD,
      paymentDate: new Date('2026-06-01'),
      status: PaymentStatus.CONFIRMED,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Payment;

    expect(payment.amount).toBe('500.00');
    expect(payment.status).toBe(PaymentStatus.CONFIRMED);
  });
});

describe('PaymentProof entity', () => {
  // Verifies that the encrypted `notes` field accepts a plain string
  // at compile time, confirming the type union
  // `EncryptedValue | string | null` is correctly exposed on the entity.
  it('accepts raw string in encrypted notes', () => {
    const proof = {
      id: 'proof-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      fileUrl: 'https://example.com/proof.jpg',
      fileName: 'proof.jpg',
      notes: 'pago parcial del mes',
      createdAt: new Date(),
      createdBy: 'client-uuid',
      updatedAt: new Date(),
    } satisfies PaymentProof;

    expect(proof.notes).toBe('pago parcial del mes');
  });
});
