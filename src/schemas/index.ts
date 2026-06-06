import companySchema from './company.schema.json';
import companyPlanSchema from './company-plan.schema.json';
import userSchema from './user.schema.json';
import roleSchema from './role.schema.json';
import companyUserSchema from './company-user.schema.json';
import clientSchema from './client.schema.json';
import debtSchema from './debt.schema.json';
import debtScheduleSchema from './debt-schedule.schema.json';
import invoiceSchema from './invoice.schema.json';
import invoiceTemplateSchema from './invoice-template.schema.json';
import receiptSchema from './receipt.schema.json';
import receiptTemplateSchema from './receipt-template.schema.json';
import paymentProofSchema from './payment-proof.schema.json';
import paymentAttemptSchema from './payment-attempt.schema.json';
import paymentSchema from './payment.schema.json';
import bankStatementSchema from './bank-statement.schema.json';
import bankTransactionSchema from './bank-transaction.schema.json';
import paymentMatchSchema from './payment-match.schema.json';
import notificationSchema from './notification.schema.json';
import notificationTemplateSchema from './notification-template.schema.json';
import clientDebtSummarySchema from './client-debt-summary.schema.json';
import companyMonthlySummarySchema from './company-monthly-summary.schema.json';

export const schemas = {
  company: {
    company: companySchema,
    companyPlan: companyPlanSchema,
    user: userSchema,
    role: roleSchema,
    companyUser: companyUserSchema,
  },
  client: {
    client: clientSchema,
  },
  debt: {
    debt: debtSchema,
    debtSchedule: debtScheduleSchema,
  },
  invoice: {
    invoice: invoiceSchema,
    invoiceTemplate: invoiceTemplateSchema,
  },
  receipt: {
    receipt: receiptSchema,
    receiptTemplate: receiptTemplateSchema,
  },
  payment: {
    paymentProof: paymentProofSchema,
    paymentAttempt: paymentAttemptSchema,
    payment: paymentSchema,
  },
  bank: {
    bankStatement: bankStatementSchema,
    bankTransaction: bankTransactionSchema,
    paymentMatch: paymentMatchSchema,
  },
  notification: {
    notification: notificationSchema,
    notificationTemplate: notificationTemplateSchema,
  },
  summary: {
    clientDebtSummary: clientDebtSummarySchema,
    companyMonthlySummary: companyMonthlySummarySchema,
  },
};

export {
  companySchema,
  companyPlanSchema,
  userSchema,
  roleSchema,
  companyUserSchema,
  clientSchema,
  debtSchema,
  debtScheduleSchema,
  invoiceSchema,
  invoiceTemplateSchema,
  receiptSchema,
  receiptTemplateSchema,
  paymentProofSchema,
  paymentAttemptSchema,
  paymentSchema,
  bankStatementSchema,
  bankTransactionSchema,
  paymentMatchSchema,
  notificationSchema,
  notificationTemplateSchema,
  clientDebtSummarySchema,
  companyMonthlySummarySchema,
};