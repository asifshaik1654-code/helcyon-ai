import { app } from './app.js';
import { ENV } from './config/env.js';

const server = app.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  HELCYON AI — Financial Intelligence Backend API`);
  console.log(`  Status: Running on http://localhost:${ENV.PORT}`);
  console.log(`  Environment: ${ENV.NODE_ENV}`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
