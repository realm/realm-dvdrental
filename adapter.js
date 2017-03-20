////////////////////////////////////////////////////////////////////////////
//
// Copyright 2016 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

'use strict';

const fs = require('fs');
const path = require('path');
const Realm = require('realm');
const PostgresAdapter = require('./postgres_adapter.js');
const PostgresClient = require('libpq');

// CONFIGURABLE
var access_token = 'ewoJImlkZW50aXR5IjogIl9fYXV0aCIsCgkiYWNjZXNzIjogWyJ1cGxvYWQiLCAiZG93bmxvYWQiLCAibWFuYWdlIl0KfQo=:UH4womynqiP+9/b4kXvGc7E9XrPB3bbdCKJNXhjbWwXN7jbRLlldsG5jCu5CF9vEIYl8nSrORmGpIC/6tztlPzKs3RkIphJWb19uvD3shL6zKy7W+iZrGzPrFDNpEXM4hp4Hq1L/zgxMf1vlElL5JzW2Yq5AybpZZAeP6IVM/xC5bRfCzf7iER8om28WxnVK3CC2buOJbV+dKKWNSVbVl7Ol3N9+Vu2owkByGGGaY0DjzWkTzf+Y+q8r1aoC5MBgOqXhde+bWSiKc2hzFK5FZH1m0KG5+odD40r2mahxdAw304S6ipJcIwGA5pFlBsSNQ/c9K8DYvR0sUZXu9M5xlQ==';

var pg_host = 'localhost';
var pg_port = 5432;
var pg_user = 'afish';
var pg_password = 'password';

// DO NOT CHANGE UNLESS INSTRUCTED
var pg_dbName = 'dvdrental';

// Create a Postgres client to setup DVD database
var client = new PostgresClient();
var connectionString = 'dbname='+pg_user+' host='+pg_host+' port='+pg_port+' user='+pg_user+' password='+pg_password;
client.connectSync(connectionString);

// HACK - delete admin realm
try {
  require( 'child_process' ).execSync('rm -r realm-object-server/adapter/__admin.realm*');
}
catch(e) {}

var args = process.argv;
args.splice(0,2);
if (args.length > 0) {
  for (let index in args) {
    let val = args[index];
    if (val == '-reset' ||
        val == '-r') {
          console.log(`Dropping replication slot '${pg_dbName}'`);
          client.exec(`SELECT pg_drop_replication_slot('${pg_dbName}');`);
          console.log(`Removing ${pg_dbName} database`);
          client.exec(`DROP DATABASE IF EXISTS ${pg_dbName}`);
          
          var deleteFolderRecursive = function(path) {
            if( fs.existsSync(path) ) {
              console.log(`Removing ${path}`);
              fs.readdirSync(path).forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                  deleteFolderRecursive(curPath);
                } else { // delete file
                  fs.unlinkSync(curPath);
                }
              });
              fs.rmdirSync(path);
            }
          };
          
          deleteFolderRecursive('./realm-object-server');
          process.exit()
    }
  } 
}   

process.on('uncaughtException', function(err) {
  console.log(err);
});

// Check for dvdrental 
client.exec(`SELECT EXISTS (SELECT 1 from pg_database WHERE datname='${pg_dbName}')`);
var existValue = client.getvalue(0, 0);
if (existValue == 'f') {
  console.log('Sample Database Not Found!');
  console.log('--> Creating %s database', pg_dbName);
  client.exec(`CREATE DATABASE ${pg_dbName};`);
  
  // Load the sample data
  console.log('--> Loading sample data');
  const
    spawn = require( 'child_process' ).spawnSync,
    ls = spawn( 'pg_restore', [ '-U', pg_user, '-d', pg_dbName, './dvdrental.tar' ] );
  console.log('--> Finished loading sample data\n');
}

// Drop the rental_id foreign key constraint on inventory table
client.finish();

// Reconnect to actual database
connectionString = 'dbname='+pg_dbName+' host='+pg_host+' port='+pg_port+' user='+pg_user+' password='+pg_password;
client.connectSync(connectionString);
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

// Add column for realm primary key
client.exec('ALTER TABLE inventory ADD COLUMN external_id text;');
client.finish();

// Set the access token to unlock enterprise features
Realm.Sync.setAccessToken(fs.readFileSync(path.join(__dirname, './access-token.enterprise'), 'utf-8'));

// if we don't already have a realm directory, reset replication slots
var reset_replication_slots = fs.existsSync('./realm-object-server/adapter') == false;

var adapter = new PostgresAdapter({
    // configuration for connecting to the Realm Object Server
    realmServer: 'realm://127.0.0.1:9080',
    realmAdminUser: Realm.Sync.User.adminUser(access_token),

    // Postgres configuration and database name
    postgresConfig: { host: pg_host, port: pg_port, user: pg_user, password: pg_password},
    dbName: pg_dbName,

    // Set to true to indicate Realms should be created based on Postgres data
    createRealms: true,

    // Map of custom types to Postgres types
    typeMapping: {
      'USER-DEFINED': 'text',
      'ARRAY':        'text',
      'mpaa_rating':  'text',
      'year':         'integer',
    },

    // Set to true to delete the old repolication slot (if it exists) and create a new replication slot
    // You would set this to true if you are resetting the database or starting up for the first time.
    // `reset_replication_slots` for now is set to `true` if the `realm-object-server` directory exists
    // indicating that the app has already been run and should resume with the latest Postgres chnages
    resetReplicationSlot: reset_replication_slots,

    // Method used to determine the Realm in which data should be replicated - is given the database
    // name and all of the column names and values for the Postgres change
    getRealmPath: (db, props) => `/${pg_dbName}`,

    // Method used to parse the Realm path to extract the database and user names. Should
    // return an array of the form `[userName, dbName]`
    //parseRealmPath: (path) => path.match(/^\/([^\/]+)\/([^\/]+)$/).splice(1),

    // Columm used to indicate the Postgres column used to split data across multiple realms
    // This is also used in the `getRealmPath` method above.
    //userColumn: 'accountid__c',

    // The schema used when creating Realm objects. Any Postgres columns not specified
    // here will be ignored. This nees to be an array of valid RealmJS Schema object as described
    // here https://realm.io/docs/javascript/1.0.0/api/Realm.html#~ObjectSchema
    // For now column names need to match (but are case insensitive) - in the future we will add
    // the ability to have a custom mapping between Postgres columns and Realm properties
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

    // The regex used to determine which Realms should be monitored and replicated. For a
    // Postgres to Realm adapter this should match the Realm names returned from `getRealmPath`
    realmRegex: `.*${pg_dbName}.*`,
});
