const PostgresController = require('realm-data-adapters').PostgresController;
const spawnSync = require('child_process').spawnSync;

// Posgres config used for all connections - replace with your data
const postgresConfig = {
    host:     '127.0.0.1',
    port:     5432,
    user:     'YOUR_POSTGRES_USER',
    password: 'YOUR_POSTGRES_PASSWORD'
}

// Remove db and replication slot
PostgresController.removePostgresDB('dvdrental', postgresConfig);

// Remove old data
spawnSync( 'rm -rf ./realm-object-server' );