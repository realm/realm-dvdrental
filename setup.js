const PostgresAdapter = require('realm-data-adapters').PostgresAdapter;
const PostgresController = require('realm-data-adapters').PostgresController;
const PostgresClient = require('realm-data-adapters').PostgresClient;
const spawnSync = require('child_process').spawnSync;
const Config = require('./config');

// Make sure the sample DB exists
PostgresController.ensurePostgresDB('dvdrental', Config.postgres_config);

// Load the sample data
spawnSync( 'pg_restore', [ '-U', Config.postgres_config.user, '-d', 'dvdrental', './dvdrental.tar' ] );

// Create the external_id column to store Realm's pk since PG auto-increments
const client = new PostgresClient('dvdrental', Config.postgres_config);
client.exec('ALTER TABLE inventory ADD COLUMN external_id text;');
client.finish();
