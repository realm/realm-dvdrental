const PostgresAdapter = require('realm-data-adapters').PostgresAdapter;
const PostgresController = require('realm-data-adapters').PostgresController;
const PostgresClient = require('realm-data-adapters').PostgresClient;
const spawnSync = require('child_process').spawnSync;
const Config = require('./config');

// Make sure the sample DB exists
PostgresController.ensurePostgresDB('dvdrental', Config.postgres_config);

// Load the sample data
console.log('--> Loading sample data');
spawnSync( 'pg_restore', [ '-U', Config.postgres_config.user, '-d', Config.database_name, './dvdrental.tar' ] );

// Create the external_id column to store Realm's pk since PG auto-increments
const client = new PostgresClient(Config.database_name, Config.postgres_config);
client.exec('ALTER TABLE inventory ADD COLUMN external_id text;');
// Perform check and removal of rental --> inventory constraint
// Demo is not using rental table so this allows removal of inventory rows
var foreignKeyCheck = 
`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rental_inventory_id_fkey') THEN
        ALTER TABLE rental
			     DROP CONSTRAINT rental_inventory_id_fkey;
    END IF;
END;
$$;`
client.exec(foreignKeyCheck);
client.finish();
console.log('--> Finished loading sample data');
