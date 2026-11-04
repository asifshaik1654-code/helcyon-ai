/**
 * run_all_tests.ts
 *
 * Master test runner that runs all Helcyon AI test suites sequentially.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
  'auth.test.ts',
  'transactions.test.ts',
  'dashboard.test.ts',
  'budgets_savings.test.ts',
  'intelligence_ai.test.ts',
  'notifications.test.ts',
];

async function runTest(file: string): Promise<boolean> {
  return new Promise((resolve) => {
    const fullPath = path.join(__dirname, file);
    console.log(`\n============================================================`);
    console.log(`🚀 RUNNING: ${file}`);
    console.log(`============================================================`);

    const child = spawn('npx', ['tsx', `"${fullPath}"`], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  console.log('🧪 Helcyon AI Full Test Suite Started');
  let allPassed = true;

  for (const file of testFiles) {
    const passed = await runTest(file);
    if (!passed) {
      allPassed = false;
      console.error(`\n❌ FAILED: ${file}`);
      break;
    }
  }

  if (allPassed) {
    console.log('\n============================================================');
    console.log('🎉 ALL SUITES PASSED (Auth, Transactions, Dashboard, Budgets & Savings)');
    console.log('============================================================\n');
    process.exit(0);
  } else {
    console.error('\n❌ One or more test suites failed.');
    process.exit(1);
  }
}

main();
