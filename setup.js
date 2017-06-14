const PostgresAdapter = require('realm-data-adapters').PostgresAdapter;
const PostgresController = require('realm-data-adapters').PostgresController;
const PostgresClient = require('realm-data-adapters').PostgresClient;
const spawnSync = require('child_process').spawnSync;

// Posgres config used for all connections - replace with your data
const postgresConfig = {
    host:     '127.0.0.1',
    port:     5432,
    user:     'YOUR_POSTGRES_USER',
    password: 'YOUR_POSTGRES_PASSWORD'
}

// Make sure the sample DB exists
PostgresController.ensurePostgresDB('dvdrental', postgresConfig);

// Load the sample data
spawnSync( 'pg_restore', [ '-U', postgresConfig.user, '-d', 'dvdrental', './dvdrental.tar' ] );

// Create the external_id column to store Realm's pk since PG auto-increments
const client = new PostgresClient('dvdrental', postgresConfig);
client.exec('ALTER TABLE inventory ADD COLUMN external_id text;');
client.finish();
