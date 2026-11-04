/**
 * transactions.test.ts
 *
 * Supertest integration tests for the /api/transactions REST endpoints.
 *
 * HOW THESE TESTS WORK (simple explanation)
 * -------------------------------------------
 * - We import the Express `app` directly (no real server is started on a port).
 * - Every request uses the well-known demo token so auth always passes.
 * - The backend stores demo transactions in an in-memory array, so tests are
 *   fast and do not need a database connection.
 * - We run tests in a logical order so a later test can use an ID returned by
 *   an earlier "create" test.
 *
 * HOW TO RUN
 * ----------
 *   cd server
 *   npx tsx src/tests/transactions.test.ts
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { app } from '../app.js';

// ── constants ──────────────────────────────────────────────────────────────────

const DEMO_TOKEN = 'demo-session-token';
const AUTH = { Authorization: `Bearer ${DEMO_TOKEN}` };

// ID of a transaction created during the test suite (shared across tests)
let createdId = '';

// ── simple test runner ─────────────────────────────────────────────────────────

type TestFn = () => Promise<void>;
const results: { name: string; pass: boolean; error?: string }[] = [];

async function test(name: string, fn: TestFn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`  ✅  ${name}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, pass: false, error: msg });
    console.log(`  ❌  ${name}`);
    console.log(`      ${msg}`);
  }
}

// ── helpers ────────────────────────────────────────────────────────────────────

function makeTransaction(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Test Grocery Run',
    amount: 1500,
    transactionType: 'expense',
    category: 'Groceries',
    transactionDate: '2026-11-01',
    paymentMethod: 'UPI',
    description: 'Weekly groceries from supermarket',
    ...overrides,
  };
}

// ── run all tests ──────────────────────────────────────────────────────────────

async function run() {
  console.log('\n📋  Helcyon AI — Transaction API Tests\n');

  // ── health ───────────────────────────────────────────────────────────────────
  console.log('🔹 Health');
  await test('GET /api/health → 200 healthy', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(res.status === 200 || res.status === 201);
    assert.equal(res.body.data.status, 'healthy');
  });

  // ── auth guard ────────────────────────────────────────────────────────────────
  console.log('\n🔹 Auth Guard');
  await test('GET /api/transactions without token → 401', async () => {
    const res = await request(app).get('/api/transactions');
    assert.equal(res.status, 401);
  });

  await test('POST /api/transactions without token → 401', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send(makeTransaction());
    assert.equal(res.status, 401);
  });

  // ── create ────────────────────────────────────────────────────────────────────
  console.log('\n🔹 POST /api/transactions — create');
  await test('creates a new transaction and returns it', async () => {
    const payload = makeTransaction();
    const res = await request(app)
      .post('/api/transactions')
      .set(AUTH)
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, payload.title);
    assert.equal(res.body.data.amount, payload.amount);
    assert.equal(typeof res.body.data.id, 'string');

    createdId = res.body.data.id;
  });

  await test('rejects transaction with missing title (Zod validation)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set(AUTH)
      .send({
        amount: 500,
        transactionType: 'expense',
        category: 'Other',
        transactionDate: '2026-11-01',
        paymentMethod: 'Cash',
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await test('rejects a negative amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set(AUTH)
      .send(makeTransaction({ amount: -100 }));
    assert.equal(res.status, 400);
  });

  // ── list ─────────────────────────────────────────────────────────────────────
  console.log('\n🔹 GET /api/transactions — list');
  await test('returns paginated list with correct structure', async () => {
    const res = await request(app)
      .get('/api/transactions?page=1&limit=5')
      .set(AUTH);
    assert.ok(res.status === 200 || res.status === 201);
    assert.ok(Array.isArray(res.body.data.items));
    assert.equal(res.body.data.pagination.page, 1);
    assert.equal(res.body.data.pagination.limit, 5);
    assert.ok('total' in res.body.data.pagination);
  });

  await test('filters by type=income returns only income records', async () => {
    const res = await request(app)
      .get('/api/transactions?type=income')
      .set(AUTH);
    assert.ok(res.status === 200 || res.status === 201);
    const items: Array<{ transactionType: string }> = res.body.data.items;
    assert.ok(
      items.every((t) => t.transactionType === 'income'),
      'Found non-income record in income-only filter result'
    );
  });

  await test('filters by category=Groceries', async () => {
    const res = await request(app)
      .get('/api/transactions?category=Groceries')
      .set(AUTH);
    assert.ok(res.status === 200 || res.status === 201);
    const items: Array<{ category: string }> = res.body.data.items;
    assert.ok(items.every((t) => t.category === 'Groceries'));
  });

  await test('search query returns matching records', async () => {
    const res = await request(app)
      .get('/api/transactions?search=Grocery')
      .set(AUTH);
    assert.ok(res.status === 200 || res.status === 201);
    assert.ok(res.body.data.items.length > 0, 'No results for search "Grocery"');
  });

  // ── summary ───────────────────────────────────────────────────────────────────
  console.log('\n🔹 GET /api/transactions/summary');
  await test('returns totals with correct structure', async () => {
    const res = await request(app)
      .get('/api/transactions/summary')
      .set(AUTH);
    assert.ok(res.status === 200 || res.status === 201);
    const d = res.body.data;
    assert.equal(typeof d.totalIncome, 'number');
    assert.equal(typeof d.totalExpenses, 'number');
    assert.equal(typeof d.availableBalance, 'number');
    assert.ok(Array.isArray(d.byCategory));
  });

  await test('income - expenses === availableBalance (within float tolerance)', async () => {
    const res = await request(app)
      .get('/api/transactions/summary')
      .set(AUTH);
    const { totalIncome, totalExpenses, availableBalance } = res.body.data;
    const diff = Math.abs(totalIncome - totalExpenses - availableBalance);
    assert.ok(
      diff < 0.01,
      `Balance mismatch: ${totalIncome} - ${totalExpenses} ≠ ${availableBalance}`
    );
  });

  // ── get by id ─────────────────────────────────────────────────────────────────
  console.log('\n🔹 GET /api/transactions/:id — single');
  await test('returns the transaction we just created', async () => {
    assert.ok(createdId, 'createdId is empty — create test must have failed');
    const res = await request(app)
      .get(`/api/transactions/${createdId}`)
      .set(AUTH);
    assert.ok(res.status === 200 || res.status === 201);
    assert.equal(res.body.data.id, createdId);
  });

  await test('returns 404 for a non-existent ID', async () => {
    const res = await request(app)
      .get('/api/transactions/00000000-0000-0000-0000-000000000000')
      .set(AUTH);
    assert.equal(res.status, 404);
  });

  // ── update ────────────────────────────────────────────────────────────────────
  console.log('\n🔹 PUT /api/transactions/:id — update');
  await test('updates title and amount', async () => {
    assert.ok(createdId);
    const res = await request(app)
      .put(`/api/transactions/${createdId}`)
      .set(AUTH)
      .send({ title: 'Updated Grocery Run', amount: 2000 });
    assert.ok(res.status === 200 || res.status === 201);
    assert.equal(res.body.data.title, 'Updated Grocery Run');
    assert.equal(res.body.data.amount, 2000);
  });

  await test('returns 404 when updating a non-existent transaction', async () => {
    const res = await request(app)
      .put('/api/transactions/non-existent-id')
      .set(AUTH)
      .send({ title: 'Ghost' });
    assert.equal(res.status, 404);
  });

  // ── import ────────────────────────────────────────────────────────────────────
  console.log('\n🔹 POST /api/transactions/import — batch CSV');
  await test('imports new rows, reports imported and skipped counts', async () => {
    const rows = [
      {
        title: 'Electricity Bill',
        amount: 2200,
        transactionType: 'expense',
        category: 'Utilities',
        transactionDate: '2026-11-05',
        paymentMethod: 'Net Banking',
      },
      {
        title: 'Part-Time Tuition',
        amount: 5000,
        transactionType: 'income',
        category: 'Freelance',
        transactionDate: '2026-11-06',
        paymentMethod: 'UPI',
      },
    ];
    const res = await request(app)
      .post('/api/transactions/import')
      .set(AUTH)
      .send({ transactions: rows });

    assert.ok(res.status === 200 || res.status === 201);
    assert.equal(typeof res.body.data.imported, 'number');
    assert.equal(typeof res.body.data.skipped, 'number');
    assert.equal(res.body.data.imported + res.body.data.skipped, rows.length);
  });

  await test('rejects import payload with no transactions array', async () => {
    const res = await request(app)
      .post('/api/transactions/import')
      .set(AUTH)
      .send({ notTransactions: [] });
    assert.equal(res.status, 400);
  });

  // ── delete ────────────────────────────────────────────────────────────────────
  console.log('\n🔹 DELETE /api/transactions/:id — delete');
  await test('deletes the created transaction', async () => {
    assert.ok(createdId);
    const res = await request(app)
      .delete(`/api/transactions/${createdId}`)
      .set(AUTH);
    assert.ok(res.status === 200 || res.status === 201);
  });

  await test('returns 404 when deleting an already-deleted transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdId}`)
      .set(AUTH);
    assert.equal(res.status, 404);
  });

  // ── final tally ───────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📊  Results: ${passed} passed  |  ${failed} failed  |  ${results.length} total`);
  console.log('─'.repeat(50));

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('\n💥 Unexpected test runner error:', err);
  process.exit(1);
});
