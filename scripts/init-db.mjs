import { initializeProductDatabase } from '../src/utils/initializeServer.js';

console.log('Starting database initialization...');
initializeProductDatabase()
  .then(result => {
    console.log('Database initialization complete:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error initializing database:', error);
    process.exit(1);
  });
