const Realm = require('realm');
const fs = require('fs');
const path = require('path');
const PostgresAdapter = require('realm-data-adapters').PostgresAdapter;
const Config = require('./config');

// Unlock Professional Edition APIs
Realm.Sync.setAccessToken(fs.readFileSync(path.join(__dirname, './access-token.enterprise'), 'utf-8'));

const admin_user = Realm.Sync.User.adminUser(Config.admin_user_token);

// Print out uncaught exceptions
process.on('uncaughtException', (err) => console.log(err));

var adapter = new PostgresAdapter({
    // Realm configuration parameters for connecting to ROS
    realmConfig: {
        server: Config.realm_object_server_url, // or specify your realm-object-server location
        user:   admin_user,
    },
    dbName: Config.database_name,
    // Postgres configuration and database name
    postgresConfig: Config.postgres_config,
    resetPostgresReplicationSlot: true,


    // Set to true to create the Postgres DB if not already created
    createPostgresDB: true,
    initializeRealmFromPostgres: true,
    // Map of custom types to Postgres types
    customPostgresTypes: {
      'USER-DEFINED': 'text',
      'ARRAY':        'text',
      'mpaa_rating':  'text',
      'year':         'integer',
    },
    // Set to true to indicate Postgres tables should be created and
    // properties added to these tables based on schema additions
    // made in Realm. If set to false any desired changes to the
    // Postgres schema will need to be made external to the adapter.
    applyRealmSchemaChangesToPostgres: true,

    // Only match a single Realm called 'testRealm'
    realmRegex: `/*`+Config.database_name,

    // Specify the Realm name all Postgres changes should be applied to
    mapPostgresChangeToRealmPath: `/`+Config.database_name,

    // Speicfy the Realm objects we want to replicate in Postres.
    // Any types or properties not specified here will not be replicated
    schema: [{
    name: 'Film',
    primaryKey: 'film_id',
    properties: {
        film_id:            { type: 'int'},
        title:              { type: 'string'},
        description:        { type: 'string', optional: true },
        release_year:       { type: 'int', optional: true },
        rental_duration:    { type: 'int'},
        rental_rate:        { type: 'double'},
        length:             { type: 'int', optional: true },
        replacement_cost:   { type: 'double'},
        rating:             { type: 'string', optional: true },
        last_update:        { type: 'date'},
        special_features:   { type: 'string', optional: true },
    },
  },
  {
    name: 'Inventory',
    primaryKey: 'external_id',
    postgresPrimaryKey: 'inventory_id',
    properties: {
        external_id:        { type: 'string'},
        inventory_id:       { type: 'int', optional: true},
        film_id:            { type: 'object', objectType: 'Film'},
        last_update:        { type: 'date'},
        store_id:           { type: 'int', default: 0}, // Store table not used, so just defaults
    },
  },
],
});