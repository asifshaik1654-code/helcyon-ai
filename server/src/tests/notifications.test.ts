/**
 * notifications.test.ts
 *
 * Automated tests for:
 *  - GET /api/notifications (Budget alerts, recurring bill due dates, goal milestones)
 *  - POST /api/notifications/:id/read (Mark single notification as read)
 *  - POST /api/notifications/read-all (Mark all notifications as read)
 *  - Auth protection verification
 */

import request from 'supertest';
import assert from 'node:assert/strict';
import { app } from '../app.js';

const DEMO_TOKEN = 'demo-session-token';
const AUTH = { Authorization: `Bearer ${DEMO_TOKEN}` };

async function run() {
  console.log('\n📋 Helcyon AI — Phase 8 Notification Center API Tests\n');

  // 1. Auth Guard
  console.log('🔹 1. Authentication Security');
  const unauth = await request(app).get('/api/notifications');
  assert.equal(unauth.status, 401);
  assert.equal(unauth.body.success, false);
  console.log('  ✅  GET /api/notifications rejects unauthenticated requests with 401');

  // 2. Fetch Notifications
  console.log('🔹 2. Notification Generation & Retrieval');
  const res = await request(app).get('/api/notifications').set(AUTH);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.notifications));
  assert.equal(typeof res.body.data.unreadCount, 'number');

  const notifs = res.body.data.notifications;
  console.log(`  ✅  GET /api/notifications returned ${notifs.length} items (${res.body.data.unreadCount} unread)`);

  if (notifs.length > 0) {
    const first = notifs[0];
    assert.ok(first.id, 'Notification must have an ID');
    assert.ok(first.title, 'Notification must have a title');
    assert.ok(first.message, 'Notification must have a message');
    assert.ok(['info', 'warning', 'critical'].includes(first.severity));
    assert.ok(typeof first.isRead === 'boolean');
    console.log(`  ✅  First notification validated: [${first.severity.toUpperCase()}] ${first.title}`);

    // 3. Mark Single Notification Read
    console.log('🔹 3. Mark Single Notification Read');
    const readRes = await request(app)
      .post(`/api/notifications/${first.id}/read`)
      .set(AUTH);
    assert.equal(readRes.status, 200);
    assert.equal(readRes.body.success, true);
    assert.equal(readRes.body.data.isRead, true);
    console.log(`  ✅  POST /api/notifications/${first.id}/read marked item as read`);
  }

  // 4. Mark All Read
  console.log('🔹 4. Mark All Notifications Read');
  const readAllRes = await request(app)
    .post('/api/notifications/read-all')
    .set(AUTH);
  assert.equal(readAllRes.status, 200);
  assert.equal(readAllRes.body.success, true);
  console.log('  ✅  POST /api/notifications/read-all marked all items as read');

  // 5. Verify unread count is now 0
  const afterReadAll = await request(app).get('/api/notifications').set(AUTH);
  assert.equal(afterReadAll.status, 200);
  assert.equal(afterReadAll.body.data.unreadCount, 0);
  console.log('  ✅  GET /api/notifications confirms unreadCount is now 0');

  console.log('\n🎉 ALL Phase 8 Notification Center API tests PASSED!\n');
}

run().catch((err) => {
  console.error('\n❌ Notification test failure:', err);
  process.exit(1);
});

