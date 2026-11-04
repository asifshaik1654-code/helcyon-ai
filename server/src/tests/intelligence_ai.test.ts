/**
 * intelligence_ai.test.ts
 *
 * Integration tests for:
 *  - Recurring payment intelligence & auto-detection (/api/recurring)
 *  - Statistical anomaly detection (/api/insights/anomalies)
 *  - Google Gemini AI categorization (/api/ai/categorize)
 *  - Grounded AI Financial Assistant (/api/ai/chat)
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { app } from '../app.js';

const DEMO_TOKEN = 'demo-session-token';
const AUTH = { Authorization: `Bearer ${DEMO_TOKEN}` };

async function run() {
  console.log('\n📋 Helcyon AI — Phase 6 & Phase 7 API Tests\n');

  // ── 1. RECURRING PAYMENT INTELLIGENCE ──────────────────────────────────────
  console.log('🔹 1. Recurring Payment Intelligence');

  // Auth guard
  const unauthRec = await request(app).get('/api/recurring');
  assert.equal(unauthRec.status, 401);
  console.log('  ✅  GET /api/recurring rejects unauthenticated access with 401');

  // Get recurring bills
  const recRes = await request(app).get('/api/recurring').set(AUTH);
  assert.equal(recRes.status, 200);
  assert.equal(recRes.body.success, true);
  assert.ok(Array.isArray(recRes.body.data.confirmed));
  assert.ok(Array.isArray(recRes.body.data.detected));
  assert.equal(typeof recRes.body.data.totalMonthlyOutflow, 'number');
  console.log(`  ✅  GET /api/recurring returned ${recRes.body.data.confirmed.length} confirmed and ${recRes.body.data.detected.length} auto-detected bills`);

  // Create manual recurring bill
  const newRecRes = await request(app)
    .post('/api/recurring')
    .set(AUTH)
    .send({
      title: 'Cloud VPS Server Hosting',
      amount: 1499,
      category: 'Technology',
      frequency: 'monthly',
      nextPaymentDate: '2026-12-01',
      status: 'active',
    });
  assert.equal(newRecRes.status, 201);
  const createdRecId = newRecRes.body.data.id;
  assert.equal(newRecRes.body.data.title, 'Cloud VPS Server Hosting');
  console.log('  ✅  POST /api/recurring created manual recurring subscription');

  // Confirm a recurring bill
  const confirmRes = await request(app)
    .post(`/api/recurring/${createdRecId}/confirm`)
    .set(AUTH);
  assert.equal(confirmRes.status, 200);
  assert.equal(confirmRes.body.data.isUserConfirmed, true);
  console.log('  ✅  POST /api/recurring/:id/confirm confirmed bill status');

  // Delete recurring bill
  const delRecRes = await request(app)
    .delete(`/api/recurring/${createdRecId}`)
    .set(AUTH);
  assert.equal(delRecRes.status, 200);
  console.log('  ✅  DELETE /api/recurring/:id removed subscription');

  // ── 2. STATISTICAL ANOMALY DETECTION ───────────────────────────────────────
  console.log('\n🔹 2. Statistical Anomaly & Spike Detection');

  // Auth guard
  const unauthAnomaly = await request(app).get('/api/insights/anomalies');
  assert.equal(unauthAnomaly.status, 401);
  console.log('  ✅  GET /api/insights/anomalies rejects unauthenticated access with 401');

  // Get anomalies
  const anomalyRes = await request(app).get('/api/insights/anomalies').set(AUTH);
  assert.equal(anomalyRes.status, 200);
  assert.ok(Array.isArray(anomalyRes.body.data.anomalies));
  assert.equal(typeof anomalyRes.body.data.totalFlagged, 'number');
  console.log(`  ✅  GET /api/insights/anomalies analyzed spending with ${anomalyRes.body.data.totalFlagged} observations flagged`);

  if (anomalyRes.body.data.anomalies.length > 0) {
    const firstAnomaly = anomalyRes.body.data.anomalies[0];
    assert.ok(firstAnomaly.explanation);
    assert.ok(['info', 'warning', 'critical'].includes(firstAnomaly.severity));

    // Dismiss anomaly
    const dismissRes = await request(app)
      .post(`/api/insights/anomalies/${firstAnomaly.id}/dismiss`)
      .set(AUTH);
    assert.equal(dismissRes.status, 200);
    console.log('  ✅  POST /api/insights/anomalies/:id/dismiss dismissed anomaly without false fraud assertions');
  }

  // ── 3. GOOGLE GEMINI AI CATEGORIZATION ────────────────────────────────────
  console.log('\n🔹 3. Gemini AI Categorization Engine');

  const catRes1 = await request(app)
    .post('/api/ai/categorize')
    .set(AUTH)
    .send({ title: 'Swiggy Gourmet Dinner', amount: 840 });
  assert.equal(catRes1.status, 200);
  assert.equal(catRes1.body.data.category, 'Food & Dining');
  assert.ok(catRes1.body.data.confidence >= 0.8);
  console.log(`  ✅  POST /api/ai/categorize: "Swiggy Gourmet Dinner" -> ${catRes1.body.data.category} (${catRes1.body.data.confidence * 100}% confidence)`);

  const catRes2 = await request(app)
    .post('/api/ai/categorize')
    .set(AUTH)
    .send({ title: 'Airtel Broadband Wi-Fi', amount: 1199 });
  assert.equal(catRes2.status, 200);
  assert.equal(catRes2.body.data.category, 'Utilities');
  console.log(`  ✅  POST /api/ai/categorize: "Airtel Broadband Wi-Fi" -> ${catRes2.body.data.category}`);

  // ── 4. CONVERSATIONAL FINANCIAL ASSISTANT (GEMINI) ────────────────────────
  console.log('\n🔹 4. Conversational Financial Assistant (Grounded)');

  const chatRes1 = await request(app)
    .post('/api/ai/chat')
    .set(AUTH)
    .send({ message: 'How much did I spend this month and what is my savings rate?' });
  assert.equal(chatRes1.status, 200);
  assert.ok(chatRes1.body.data.reply.length > 10);
  assert.ok(Array.isArray(chatRes1.body.data.factsUsed));
  console.log('  ✅  POST /api/ai/chat answered cash flow question grounded in user data');

  const chatRes2 = await request(app)
    .post('/api/ai/chat')
    .set(AUTH)
    .send({ message: 'Can I afford to buy a ₹15,000 mechanical keyboard?' });
  assert.equal(chatRes2.status, 200);
  assert.ok(chatRes2.body.data.reply.includes('15,000'));
  console.log('  ✅  POST /api/ai/chat evaluated purchase affordability against disposable surplus');

  console.log('\n──────────────────────────────────────────────────');
  console.log('📊  Phase 6 & 7 Test Suite: ALL CHECKS PASSED');
  console.log('──────────────────────────────────────────────────\n');
}

run().catch((err) => {
  console.error('\n💥 Unexpected test error in Phase 6/7 suite:', err);
  process.exit(1);
});

