const PostgresController = require('realm-data-adapters').PostgresController;
const spawnSync = require('child_process').spawnSync;
const Config = require('./config');

// Remove db and replication slot
console.log(`Dropping replication slot '${Config.database_name}'`);
console.log(`Removing ${Config.database_name} database`);
PostgresController.removePostgresDB(Config.database_name, Config.postgres_config);

// Remove old data
spawnSync( 'rm -rf ./realm-object-server' );