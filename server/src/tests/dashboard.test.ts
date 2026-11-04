/**
 * dashboard.test.ts
 *
 * Integration tests for GET /api/dashboard/summary endpoint.
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { app } from '../app.js';

const DEMO_TOKEN = 'demo-session-token';
const AUTH = { Authorization: `Bearer ${DEMO_TOKEN}` };

async function run() {
  console.log('\n📋 Helcyon AI — Dashboard Analytics Tests\n');

  console.log('🔹 Auth Guard');
  const unauthRes = await request(app).get('/api/dashboard/summary');
  assert.equal(unauthRes.status, 401);
  console.log('  ✅  GET /api/dashboard/summary rejects unauthenticated request with 401');

  console.log('\n🔹 GET /api/dashboard/summary');
  const res = await request(app)
    .get('/api/dashboard/summary?month=2026-11')
    .set(AUTH);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  const data = res.body.data;

  // Check structure
  assert.equal(typeof data.totalIncome, 'number');
  assert.equal(typeof data.totalExpenses, 'number');
  assert.equal(typeof data.availableBalance, 'number');
  assert.equal(typeof data.totalSaved, 'number');
  assert.equal(typeof data.savingsRate, 'number');
  assert.ok(data.monthlyBudget);
  assert.equal(typeof data.monthlyBudget.totalBudget, 'number');
  assert.equal(typeof data.monthlyBudget.totalSpent, 'number');
  assert.equal(typeof data.monthlyBudget.utilizationRate, 'number');
  assert.ok(Array.isArray(data.recentTransactions));
  assert.ok(Array.isArray(data.topExpenseCategories));
  assert.ok(Array.isArray(data.monthlyTrends));
  assert.equal(typeof data.observation, 'string');

  console.log('  ✅  Returns full DashboardSummary schema with calculated metrics');
  console.log(`      • Total Inflow: ₹${data.totalIncome}`);
  console.log(`      • Total Outflow: ₹${data.totalExpenses}`);
  console.log(`      • Available Balance: ₹${data.availableBalance}`);
  console.log(`      • Budget Utilization: ${data.monthlyBudget.utilizationRate}%`);
  console.log(`      • Trailing Months Tracked: ${data.monthlyTrends.length}`);

  console.log('\n──────────────────────────────────────────────────');
  console.log('📊  Dashboard API Test Suite: ALL CHECKS PASSED');
  console.log('──────────────────────────────────────────────────\n');
}

run().catch((err) => {
  console.error('\n💥 Unexpected dashboard test error:', err);
  process.exit(1);
});
