import request from 'supertest';
import { app } from '../app.js';

async function runAuthTests() {
  console.log('--- Starting Helcyon AI Auth & Health API Verification ---');
  let passed = 0;
  let failed = 0;

  // Test 1: Health Check Endpoint
  try {
    const res = await request(app).get('/api/health');
    if (res.status === 200 && res.body.data.status === 'healthy') {
      console.log('✓ PASS: GET /api/health returned 200 OK');
      passed++;
    } else {
      console.error('✗ FAIL: GET /api/health unexpected status/body', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('✗ FAIL: GET /api/health crashed:', err);
    failed++;
  }

  // Test 2: Unauthenticated access to protected route should be 401
  try {
    const res = await request(app).get('/api/profile');
    if (res.status === 401 && res.body.error.code === 'UNAUTHORIZED') {
      console.log('✓ PASS: GET /api/profile rejected unauthenticated access with 401');
      passed++;
    } else {
      console.error('✗ FAIL: GET /api/profile should reject with 401', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('✗ FAIL: GET /api/profile unauth check crashed:', err);
    failed++;
  }

  // Test 3: Sign in with Demo credentials
  let sessionToken = '';
  try {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'asif.shaik@helcyon.ai', password: 'demoPassword123' });

    if (res.status === 200 && res.body.data.session.accessToken) {
      sessionToken = res.body.data.session.accessToken;
      console.log('✓ PASS: POST /api/auth/login succeeded with session token');
      passed++;
    } else {
      console.error('✗ FAIL: POST /api/auth/login failed:', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('✗ FAIL: POST /api/auth/login crashed:', err);
    failed++;
  }

  // Test 4: Authenticated user session retrieval
  try {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${sessionToken}`);

    if (res.status === 200 && res.body.data.user.email === 'asif.shaik@helcyon.ai') {
      console.log('✓ PASS: GET /api/auth/me validated token and returned user info');
      passed++;
    } else {
      console.error('✗ FAIL: GET /api/auth/me failed:', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('✗ FAIL: GET /api/auth/me crashed:', err);
    failed++;
  }

  // Test 5: Authenticated profile retrieval
  try {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${sessionToken}`);

    if (res.status === 200 && res.body.data.preferredCurrency === 'INR') {
      console.log('✓ PASS: GET /api/profile returned user profile with INR currency');
      passed++;
    } else {
      console.error('✗ FAIL: GET /api/profile failed:', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('✗ FAIL: GET /api/profile crashed:', err);
    failed++;
  }

  // Test 6: Profile update
  try {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${sessionToken}`)
      .send({ monthlyIncome: 95000, preferredCurrency: 'INR' });

    if (res.status === 200 && res.body.data.monthlyIncome === 95000) {
      console.log('✓ PASS: PUT /api/profile updated monthly income successfully');
      passed++;
    } else {
      console.error('✗ FAIL: PUT /api/profile failed:', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('✗ FAIL: PUT /api/profile crashed:', err);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} total tests.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests();
