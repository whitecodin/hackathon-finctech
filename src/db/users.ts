import { db } from './index.ts';
import { users, merchants, transactions, coachMessages } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || email.split('@')[0],
        },
      })
      .returning();

    const newUser = inserted[0];

    // Ensure merchant record exists for this user
    const existingMerchant = await db.select().from(merchants).where(eq(merchants.userId, newUser.id)).limit(1);
    if (existingMerchant.length === 0) {
      await db.insert(merchants).values({
        userId: newUser.id,
        storeName: displayName ? `${displayName}'s Store` : 'Ramesh General Store',
        ownerName: displayName || 'Ramesh Kumar',
        category: 'Grocery & Daily Essentials (Kirana)',
        location: 'Jaipur, Rajasthan',
        pinCode: '302001',
        gstin: '08AAACR4092K1Z9',
        udyamId: 'UDYAM-RJ-14-002819',
        bankAccount: 'SBI Current A/c ••8912',
        healthScore: 78,
        riskGrade: 'Grade A-',
        creditBandMin: 50000,
        creditBandMax: 100000,
        safeEmiMin: 6500,
        safeEmiMax: 8200,
        resilienceDays: 18,
        monthlyInflow: 160000,
        dailyBurn: 4800,
        passportUid: `VY-IND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    return newUser;
  } catch (error) {
    console.error('getOrCreateUser error:', error);
    throw new Error('Database user lookup failed.', { cause: error });
  }
}

export async function getMerchantByUserId(userId: number) {
  try {
    const res = await db.select().from(merchants).where(eq(merchants.userId, userId)).limit(1);
    return res[0] || null;
  } catch (error) {
    console.error('getMerchantByUserId error:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function getMerchantDetails(uid: string) {
  try {
    // Look up by uid, or fallback to first merchant
    const userRes = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    let merchant = null;
    if (userRes.length > 0) {
      merchant = await getMerchantByUserId(userRes[0].id);
    }
    if (!merchant) {
      const allMerchants = await db.select().from(merchants).limit(1);
      merchant = allMerchants[0] || null;
    }
    return merchant;
  } catch (error) {
    console.error('getMerchantDetails error:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function getTransactionsByMerchantId(merchantId: number) {
  try {
    return await db.select().from(transactions).where(eq(transactions.merchantId, merchantId)).orderBy(desc(transactions.id));
  } catch (error) {
    console.error('getTransactionsByMerchantId error:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function updateTransactionStatus(txnId: number, status: string, note?: string) {
  try {
    const updateData: { status: string; merchantNote?: string } = { status };
    if (note !== undefined) {
      updateData.merchantNote = note;
    }
    const res = await db.update(transactions)
      .set(updateData)
      .where(eq(transactions.id, txnId))
      .returning();
    return res[0];
  } catch (error) {
    console.error('updateTransactionStatus error:', error);
    throw new Error('Database update failed.', { cause: error });
  }
}

export async function getCoachChatHistory(merchantId: number) {
  try {
    return await db.select().from(coachMessages).where(eq(coachMessages.merchantId, merchantId)).orderBy(coachMessages.id);
  } catch (error) {
    console.error('getCoachChatHistory error:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function saveCoachMessage(merchantId: number, sender: 'user' | 'ai', text: string, metadata?: Record<string, unknown>) {
  try {
    const res = await db.insert(coachMessages).values({
      merchantId,
      sender,
      text,
      metadata,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('saveCoachMessage error:', error);
    throw new Error('Database insert failed.', { cause: error });
  }
}

export async function updateMerchantProfile(merchantId: number, data: Partial<{
  storeName: string;
  ownerName: string;
  category: string;
  location: string;
  pinCode: string;
}>) {
  try {
    const res = await db.update(merchants)
      .set(data)
      .where(eq(merchants.id, merchantId))
      .returning();
    return res[0];
  } catch (error) {
    console.error('updateMerchantProfile error:', error);
    throw new Error('Database update failed.', { cause: error });
  }
}
