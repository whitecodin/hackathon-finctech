import { pgTable, serial, text, integer, timestamp, boolean, numeric, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (integrates with Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal unique identifier
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('merchant').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Merchants Profile table
export const merchants = pgTable('merchants', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  storeName: text('store_name').notNull(),
  ownerName: text('owner_name').notNull(),
  category: text('category').default('Grocery & Daily Essentials (Kirana)').notNull(),
  location: text('location').default('Jaipur, Rajasthan').notNull(),
  pinCode: text('pin_code').default('302001').notNull(),
  gstin: text('gstin').default('08AAACR4092K1Z9').notNull(),
  udyamId: text('udyam_id').default('UDYAM-RJ-14-002819').notNull(),
  bankAccount: text('bank_account').default('SBI Current A/c ••8912').notNull(),
  healthScore: integer('health_score').default(78).notNull(),
  riskGrade: text('risk_grade').default('Grade A-').notNull(),
  creditBandMin: integer('credit_band_min').default(50000).notNull(),
  creditBandMax: integer('credit_band_max').default(100000).notNull(),
  safeEmiMin: integer('safe_emi_min').default(6500).notNull(),
  safeEmiMax: integer('safe_emi_max').default(8200).notNull(),
  resilienceDays: integer('resilience_days').default(18).notNull(),
  monthlyInflow: integer('monthly_inflow').default(160000).notNull(),
  dailyBurn: integer('daily_burn').default(4800).notNull(),
  passportUid: text('passport_uid').default('VY-IND-2026-004821').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Transactions table (supporting ML anomaly detection and ledger management)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  txnRef: text('txn_ref').notNull(),
  date: text('date').notNull(),
  counterparty: text('counterparty').notNull(),
  subDescription: text('sub_description'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'inflow' | 'outflow'
  channel: text('channel').notNull(), // 'NEFT' | 'UPI' | 'QR Batch' | 'Soundbox' | 'BillPay'
  isFlagged: boolean('is_flagged').default(false).notNull(),
  flagReason: text('flag_reason'),
  anomalyScore: numeric('anomaly_score', { precision: 5, scale: 2 }), // ML isolation forest score
  status: text('status').default('normal').notNull(), // 'normal' | 'under_review' | 'verified_by_merchant' | 'reported_bank'
  merchantNote: text('merchant_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI Coach Chat History
export const coachMessages = pgTable('coach_messages', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id').references(() => merchants.id).notNull(),
  sender: text('sender').notNull(), // 'user' | 'ai'
  text: text('text').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [users.id],
    references: [merchants.userId],
  }),
}));

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, {
    fields: [merchants.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  coachMessages: many(coachMessages),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  merchant: one(merchants, {
    fields: [transactions.merchantId],
    references: [merchants.id],
  }),
}));
