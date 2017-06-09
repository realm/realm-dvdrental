const PostgresAdapter = require('realm-data-adapters').PostgresAdapter
const Realm = require('realm')
const fs = require('fs');
const path = require('path');

// Unlock Professional Edition APIs
Realm.Sync.setAccessToken(fs.readFileSync(path.join(__dirname, './access-token.enterprise'), 'utf-8'));

const admin_user_token = "ewoJImlkZW50aXR5IjogIl9fYXV0aCIsCgkiYWNjZXNzIjogWyJ1cGxvYWQiLCAiZG93bmxvYWQiLCAibWFuYWdlIl0KfQo=:gfDmgxHpKhi+6tRdLCOX+qXGg6Qd/RnzCcYHFCgEVgrPqL6nlAS14MEUcGsoCjkn0LrYx22RYS5NyFu1och+9nGV6Z7l88qqjMiwdIwAFXqjlO0Mn7xBpjrlu1zXojuZhrSb885Ow3cr+4xTZme+UC7RT7S5DtbcRAAO7U+qGMW2CwVDqmhF5f3o4iLoyTP2IqQjC5G4VEvjoF8Mw344nKQ0mjXhmjJOXAiCEiv57XIk+BjUAsFfbOqu8WS9GD0KDwi3FoMPpuN2b9L3yaDxCRStWsS9thGMTxJYbzGsNKvuBBHizYFxfV+Ik2HB1gz/WSYUIwf5DZfnYdqXTZR4TQ==";
const admin_user = Realm.Sync.User.adminUser(admin_user_token);

var adapter = new PostgresAdapter({
    // Realm configuration parameters for connecting to ROS
    realmConfig: {
        server: 'realm://127.0.0.1:9080', // or specify your realm-object-server location
        user:   admin_user,
    },
    dbName: 'dvdrental',
    // Postgres configuration and database name
    postgresConfig: {
        host:     '127.0.0.1',
        port:     5432,
        user:     'ianward', //
        password: 'password'
    },
    resetPostgresReplicationSlot: true,

    // Set to true to create the Postgres DB if not already created
    createPostgresDB: false,
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
    realmRegex: `/*dvdrental`,

    // Specify the Realm name all Postgres changes should be applied to
    mapPostgresChangeToRealmPath: `/dvdrental`,

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
