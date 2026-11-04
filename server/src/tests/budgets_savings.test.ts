/**
 * budgets_savings.test.ts
 *
 * Integration tests for Budgeting logic, Utilization alerts, and Savings Goals
 * with contribution progress tracking.
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { app } from '../app.js';

const DEMO_TOKEN = 'demo-session-token';
const AUTH = { Authorization: `Bearer ${DEMO_TOKEN}` };

async function run() {
  console.log('\n📋 Helcyon AI — Budgets & Savings Goals API Tests\n');

  // ── 1. BUDGETS ─────────────────────────────────────────────────────────────
  console.log('🔹 1. Budget Endpoints');

  // Auth guard
  const unauthBudget = await request(app).get('/api/budgets');
  assert.equal(unauthBudget.status, 401);
  console.log('  ✅  GET /api/budgets rejects unauthenticated request with 401');

  // List budgets with live utilization
  const budgetListRes = await request(app)
    .get('/api/budgets?month=2026-11')
    .set(AUTH);

  assert.equal(budgetListRes.status, 200);
  assert.equal(budgetListRes.body.success, true);
  const budgetData = budgetListRes.body.data;
  assert.ok(Array.isArray(budgetData.budgets));
  assert.ok(budgetData.summary);
  assert.equal(typeof budgetData.summary.totalBudget, 'number');
  assert.equal(typeof budgetData.summary.totalSpent, 'number');

  // Verify each budget has status and utilization
  for (const b of budgetData.budgets) {
    assert.ok(['safe', 'warning', 'danger'].includes(b.status));
    assert.equal(typeof b.spent, 'number');
    assert.equal(typeof b.remaining, 'number');
    assert.equal(typeof b.utilizationPercentage, 'number');
  }
  console.log(`  ✅  GET /api/budgets returned ${budgetData.budgets.length} category budgets with calculated utilization`);

  // Budget alerts
  const alertsRes = await request(app)
    .get('/api/budgets/alerts?month=2026-11')
    .set(AUTH);
  assert.equal(alertsRes.status, 200);
  assert.ok(Array.isArray(alertsRes.body.data.alerts));
  console.log(`  ✅  GET /api/budgets/alerts returned ${alertsRes.body.data.alerts.length} threshold alerts`);

  // Create budget
  const createBudgetRes = await request(app)
    .post('/api/budgets')
    .set(AUTH)
    .send({
      category: 'Healthcare',
      budgetAmount: 6000,
      budgetMonth: '2026-11',
    });
  assert.ok(createBudgetRes.status === 200 || createBudgetRes.status === 201);
  assert.equal(createBudgetRes.body.success, true);
  const createdBudgetId = createBudgetRes.body.data.id;
  console.log('  ✅  POST /api/budgets created category budget limit');

  // Update budget
  const updateBudgetRes = await request(app)
    .put(`/api/budgets/${createdBudgetId}`)
    .set(AUTH)
    .send({ budgetAmount: 7500 });
  assert.equal(updateBudgetRes.status, 200);
  assert.equal(updateBudgetRes.body.data.budget_amount ?? updateBudgetRes.body.data.budgetAmount, 7500);
  console.log('  ✅  PUT /api/budgets/:id updated category budget amount');

  // Delete budget
  const delBudgetRes = await request(app)
    .delete(`/api/budgets/${createdBudgetId}`)
    .set(AUTH);
  assert.equal(delBudgetRes.status, 200);
  console.log('  ✅  DELETE /api/budgets/:id removed category budget');

  // ── 2. SAVINGS GOALS ───────────────────────────────────────────────────────
  console.log('\n🔹 2. Savings Goals & Contributions');

  // Auth guard
  const unauthSavings = await request(app).get('/api/savings-goals');
  assert.equal(unauthSavings.status, 401);
  console.log('  ✅  GET /api/savings-goals rejects unauthenticated request with 401');

  // List goals
  const goalsRes = await request(app)
    .get('/api/savings-goals')
    .set(AUTH);
  assert.equal(goalsRes.status, 200);
  assert.ok(Array.isArray(goalsRes.body.data.goals));
  assert.ok(goalsRes.body.data.summary);
  console.log(`  ✅  GET /api/savings-goals returned ${goalsRes.body.data.goals.length} goals with progress metrics`);

  // Create a new goal
  const newGoalRes = await request(app)
    .post('/api/savings-goals')
    .set(AUTH)
    .send({
      goalName: 'Investment Seed Capital',
      targetAmount: 100000,
      currentAmount: 25000,
      targetDate: '2027-12-31',
      priority: 'high',
    });
  assert.equal(newGoalRes.status, 201);
  const newGoalId = newGoalRes.body.data.id;
  assert.equal(newGoalRes.body.data.progressPercentage, 25);
  assert.equal(newGoalRes.body.data.remainingAmount, 75000);
  console.log('  ✅  POST /api/savings-goals created goal with calculated progress');

  // Add contribution to goal
  const contribRes = await request(app)
    .post(`/api/savings-goals/${newGoalId}/contribute`)
    .set(AUTH)
    .send({
      amount: 15000,
      note: 'Quarterly bonus deposit',
    });
  assert.equal(contribRes.status, 201);
  assert.equal(contribRes.body.data.currentAmount, 40000);
  assert.equal(contribRes.body.data.progressPercentage, 40);
  assert.equal(contribRes.body.data.remainingAmount, 60000);
  assert.ok(contribRes.body.data.contributions.length > 0);
  console.log('  ✅  POST /api/savings-goals/:id/contribute incremented balance to 40% with contribution entry');

  // Update goal
  const updateGoalRes = await request(app)
    .put(`/api/savings-goals/${newGoalId}`)
    .set(AUTH)
    .send({ targetAmount: 120000 });
  assert.equal(updateGoalRes.status, 200);
  assert.equal(updateGoalRes.body.data.targetAmount, 120000);
  console.log('  ✅  PUT /api/savings-goals/:id updated target amount');

  // Delete goal
  const delGoalRes = await request(app)
    .delete(`/api/savings-goals/${newGoalId}`)
    .set(AUTH);
  assert.equal(delGoalRes.status, 200);
  console.log('  ✅  DELETE /api/savings-goals/:id removed goal and associated contributions');

  console.log('\n──────────────────────────────────────────────────');
  console.log('📊  Budgets & Savings API Tests: ALL CHECKS PASSED');
  console.log('──────────────────────────────────────────────────\n');
}

run().catch((err) => {
  console.error('\n💥 Unexpected budgets/savings test error:', err);
  process.exit(1);
});

