const PostgresController = require('realm-data-adapters').PostgresController;
const spawnSync = require('child_process').spawnSync;
const Config = require('./config');

// Remove db and replication slot
PostgresController.removePostgresDB('dvdrental', Config.postgres_config);

// Remove old data
spawnSync( 'rm -rf ./realm-object-server' );