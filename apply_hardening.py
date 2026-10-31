from pathlib import Path
import re
root=Path(r"C:\Users\Tachyon-Speedster\Documents\Codex\vyapartrust-improved")
p=root/"src/db/users.ts"
s=p.read_text(encoding="utf-8")
s=s.replace("// Look up by uid, or fallback to first merchant","// Strict owner lookup: never return another merchant as a fallback")
s=s.replace("""    if (!merchant) {
      const allMerchants = await db.select().from(merchants).limit(1);
      merchant = allMerchants[0] || null;
    }
""","")
p.write_text(s,encoding="utf-8")
p=root/"src/middleware/auth.ts"
s=p.read_text(encoding="utf-8").replace("const JWT_SECRET = process.env.JWT_SECRET || 'vyapartrust-sovereign-secret-2026-key';","const JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET || JWT_SECRET.length < 32) {\n  throw new Error('JWT_SECRET must be configured with at least 32 characters');\n}")
p.write_text(s,encoding="utf-8")
p=root/"firestore.rules"
s=p.read_text(encoding="utf-8").replace("allow get: if isSignedIn();","allow get: if isSignedIn() && resource.data.userId == request.auth.uid;")
p.write_text(s,encoding="utf-8")
p=root/"server.ts"
s=p.read_text(encoding="utf-8")
s=s.replace("app.get('/api/merchant/profile', async","app.get('/api/merchant/profile', requireAuth, async")
s=s.replace("app.get('/api/overview/metrics', async","app.get('/api/overview/metrics', requireAuth, async")
s=s.replace("app.get('/api/transactions', async","app.get('/api/transactions', requireAuth, async")
s=s.replace("app.post('/api/transactions/:id/resolve', async","app.post('/api/transactions/:id/resolve', requireAuth, async")
s=s.replace("app.post('/api/merchant/update-location', async","app.post('/api/merchant/update-location', requireAuth, async")
s=s.replace("app.post('/api/merchant/update-profile', async","app.post('/api/merchant/update-profile', requireAuth, async")
s=s.replace("const uid = (req.query.uid as string) || 'demo-ramesh-user-uid';","const uid = (req as AuthRequest).user!.uid;")
s=s.replace("getMerchantDetails('demo-ramesh-user-uid');\n    if (!merchant)","getMerchantDetails((req as AuthRequest).user!.uid);\n    if (!merchant)")
s=s.replace("const updated = await updateTransactionStatus(txnId, status, note);","if (!Number.isSafeInteger(txnId) || txnId <= 0 || !['verified_by_merchant','reported_bank'].includes(status)) {\n      return res.status(400).json({error:'Invalid transaction or status'});\n    }\n    const merchant = await getMerchantDetails((req as AuthRequest).user!.uid);\n    if (!merchant) return res.status(404).json({error:'Merchant not found'});\n    const owned = await getTransactionsByMerchantId(merchant.id);\n    if (!owned.some(t => t.id === txnId)) return res.status(404).json({error:'Transaction not found'});\n    const updated = await updateTransactionStatus(txnId, status, note);")
p.write_text(s,encoding="utf-8")
(root/"HARDENING_NOTES.md").write_text("# VyaparTrust hardening worktree\n\nInitial changes: owner-isolated merchant lookup, secure JWT configuration, protected sensitive routes, ownership checks before transaction resolution, stricter Firestore merchant reads.\n\nINCOMPLETE: legacy PIN login remains insecure; demo mode and financial passport verification are not production-grade. Do not deploy against real financial data.\n",encoding="utf-8")
print("patched",root)
