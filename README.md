# Tutorial Currently out of date -- Please see our most recent docs
This example is currently out of date.  We are in the process of updating it.  **In the meantime, please see the [most recent documentation for working with the Postgres adapter](https://docs.realm.io/platform/using-synced-realms/server-side-usage/data-integration/postgres-connector)**

# Overview
DVDRental is a sample inventory application which demonstrates Realm Mobile
Platform's enterprise data connector API. The underlying data is a Postgres
sample DVD movie database from the [Postgres Tutorial](http://www.postgresqltutorial.com/).
The data is synchronized in realtime with Realm via a bi-directional
fault-tolerant data adapter. This demo is designed to showcase how Realm can
"mobilize" existing legacy database systems, allowing Realm Object Server to be
a realtime sync gateway.

# Video Tutorial
<a href="https://realm.wistia.com/medias/wfucjymw8c?wtime=0"><img src="https://embed-ssl.wistia.com/deliveries/8c844d4828b343b3bf5d1e8af977bd43c0b925c4.jpg?image_crop_resized=900x524&image_play_button=true&image_play_button_size=2x&image_play_button_color=1d2340e0" alt="Realm Postgres Data Connector Tutorial" width="450" height="262" /></a>

# Installation
There are four components that make up this demo:
1. Postgres - The sample data is the same data set from the [Postgres Tutorial](http://www.postgresqltutorial.com/)
2. Realm Object Server - this coordinates the data sync between mobile clients
and the server.
3. `adapter.js` - Node application which configures the Realm Postgres data
adapter. This requires the `realm-js` SDK with the data connector API and
Realm Data Adapter NPM Package to function (see Enterprise Edition requirements below).
4. DVDRental - Swift iOS sample application that allows users to view the list
of movies and adjust their inventory amounts.

### _Enterprise Edition Requirements_
_**The Enterprise Edition of Realm Mobile Platform offers access to the Data
Connector API and the Postgres adapter built on top of it. This repo does not
make this code public.**_

_**As a result, you will need to contact [sales@realm.io](mailto:sales@realm.io) to
request access to:**_
- _**Enterprise trial license key**_
- _**Node SDK**_
- _**`Realm Data Adapter NPM Package`**_

## Run on Mac
**1. Install Postgres** - various [installation mechanisms](https://www.postgresql.org/download/macosx/)
exist, including a graphical `Postgres.app`. See [Postgres documentation](https://www.postgresql.org/download/macosx/)
for more details. If you have Homebrew, the installation is:
```
brew install postgresql
```
**2. Configure Postgres** - to support the Realm Postgres data adapter, Postgres
needs to be configured to enable [Logical Decoding](https://www.postgresql.org/docs/9.6/static/logicaldecoding-explanation.html):

>Logical decoding is the process of extracting all persistent changes to a
database's tables into a coherent, easy to understand format which can be
interpreted without detailed knowledge of the database's internal state.
>
>In PostgreSQL, logical decoding is implemented by decoding the contents of the
write-ahead log, which describe changes on a storage level, into an
application-specific form such as a stream of tuples or SQL statements.

To enable, edit your `postgresql.conf` file to enable logical replication by
changing the following settings:
```
wal_level = logical
max_wal_senders = 8
wal_keep_segments = 4
max_replication_slots = 4
```
For the Homebrew installation this file exists at:
```
/usr/local/var/postgres/postgresql.conf
```
**3. Start Postgres** - For the Homebrew installation you can start Postgres via
the command line to run in the foreground:
```
postgres -D /usr/local/var/postgres
```
On first run of Postgres you will need to create an initial database. For the
Homebrew installation run:
```
createdb `whoami`
```
This command will create an initial database matching your macOS username.

**4. Run Realm Object Server** - the demo is setup by default to assume the server
is running locally. You can install the macOS version of Realm Object Server by
downloading the [zip package](https://realm.io/docs/realm-object-server/) or
follow the directions to install on Linux.

_**Note: the Postgres adapter is a feature of the Enterprise Edition of Realm
Mobile Platform, but will work with any version of Realm Object Server. The
enterprise functionality required is contained in the Node SDK and unlocked via
a license key.**_

For macOS, start Realm Object Server by double-clicking the file
`start-object-server.command`. This file will open a terminal window and start
Realm Object Server for you.

You will be prompted to create an admin user for the server with an email and
password. Remember these credentials for later.

**5. Configure the Postgres adapter** - the `config.js` file includes a default
configuration for the demo app:
```
// Database name
database_name: "dvdrental",

// Realm Object Server URL
realm_object_server_url: "realm://127.0.0.1:9080",

// Admin token used to talk to ROS - get from ROS output
admin_user_token: "YOUR ADMIN TOKEN HERE",

// Posgres config used for all connections - replace with your data
postgres_config: {
    host:     '127.0.0.1',
    port:     5432,
    user:     'YOUR POSTGRES USER HERE',
    password: 'YOUR_POSTGRES_PASSWORD'
},
```
You will need to update the `admin_user_token` variable with the admin token created
via your installation of Realm Object Server:

The admin token is stored in a text file on the server. Under Linux, view the
token with:
```
cat /etc/realm/admin_token.base64
```
On macOS, the token file is in the `realm-object-server` folder, inside the
Realm Mobile Platform folder. Navigate to that folder and view the token:
```
cd path-to/realm-mobile-platform
cat realm-object-server/admin_token.base64
```
The other variables configure the connection to Postgres. If you are running
Postgres locally leave the host/port as is.

If you installed Postgres via Homebrew, then the username is your system's
username. By default you can leave the password as-is.

**6. Start the Postgres adapter** - first you must retrieve the dependencies via NPM:
```
npm install
```

_**Note: the code in this repo will not run as-is. You will need to contact [sales@realm.io](mailto:sales@realm.io) to request access to:**_
- _**Enterprise trial license key**_
- _**Node SDK**_
- _**`Realm Data Adapter NPM Package`**_

Now you need to setup Postgres (this is only needed on first run). 
The script will add a new database: `dvdrental` to it and load the sample data from `dvdrental.tar`.
```
node setup.js
```
`Open adapter.js and replace the placeholder text with your professional or enterprise access token. Finally, start the adapter:
```
node adapter.js
```
You will then observe the adapter retrieving the sample data from Postgres as it creates
a synchronized Realm.

The script will then continue listening for changes between Postgres and Realm.

**7. Run `DVDRental` demo app** - finally with everything setup you can run the
included iOS demo app. Move into the app directory:
```
cd DVDRental
```
Then install the dependencies via Cocoapods:
```
pod install
```
Finally, open `DVDRental.xcworkspace` and run the application!

**8. Using `DVDRental` demo app** - once you have finally run the demo app, it will
first require you to login. Use the same login credentials you created when
starting the Realm Object Server in step 3.

Once you have logged in, the app will display the entire list of films matching
the data in the `film` table in Postgres. If you click on a film, you can then
adjust the inventory levels. Adjusting the inventory will result in adding or
removing `inventory` objects, which the adapter will then sync to Postgres.

To observe these changes, you can utilize a visual browser. For Postgres, we
recommend [Postico](https://eggerapps.at/postico/). Similarly, you can use the
[Realm Browser](https://realm.io/docs/realm-object-server/#data-browser) to
observe data changes in the matching data in Realm.

Similarly, `adapter.js` will print out the SQL commands as it reacts to changes
coming in from the mobile app.

## Architecture
This demo utilizes an existing sample dataset [DVD Rental](http://www.postgresqltutorial.com/postgresql-sample-database/) which is
part of the [Postgres Tutorial](http://www.postgresqltutorial.com/postgresql-sample-database/).
>The DVD rental database was ported from the sakila sample database for PostgreSQL with some adjustments. The DVD rental database represents business processes of a DVD rental store. The DVD rental database has many objects including:
>
> * 15 tables
> * 1 trigger
> * 7 views
> * 8 functions
> * 1 domain
> * 13 sequences
<center> <img src="http://www.postgresqltutorial.com/wp-content/uploads/2013/05/PostgreSQL-Sample-Database.png"/></center>

The `adapter.js` file creates a `PostgresAdapter` with various configuration
parameters. Most notably with regards to the architecture is the definition of
the schema:
```
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
]
```
While the Postgres sample database includes several tables, for the purposes of
the demo the mobile app only needs the `film` and `inventory` tables. As a result,
the schema defined in the adapter only defines a Realm schema matching those tables.

This is an example of how the Postgres adapter allows the developer to define a
mapping between the Postgres data and Realm objects. By only listing a subset,
the adapter will ignore the other tables and only sync `film` and `inventory` data.

The other important point demonstrated in this mapping is the `film_id` property
which in Postgres is a foreign key to a row in the `film` table. However, instead
of defining this as an `int` in Realm, we use Realm's link support to define this
as a link to the corresponding `film` object. The adapter will automatically resolve
the foreign key relationship into a Realm link!

The data structure between `film` and `inventory` is that each `film` row/object
will link to 0 or more `inventory` row/object(s). The number of linked inventory
represents the number of copies of the film. Thus in the app as you add more to
inventory of a particular film, the app will create an `inventory` object which
the adapter will then convert into a new row in the `inventory` table.

Similarly, the reverse will happen, such that if you remove an `inventory` row
from Postgres, the adapter will convert this change and delete the corresponding
`inventory` object in Realm.

## Additional Details
The `adapter.js` configuration includes more capabilities, such as supporting
mapping Postgres data into user-specific Realms. However, for the purposes of
this demo, the adapter creates a single Realm file with the `inventory` and `film`
data in it

If you run into issues you can reset everything by first stopping Realm Object
Server and running:
```
realm-mobile-platform/reset-server-realms.command
```
You can then use a rest script to remove the sample database
from Postgres, in addition, to Realm files created by the adapter:
```
node reset.js
```
Finally, delete the demo app from your device.
![analytics](https://ga-beacon.appspot.com/UA-50247013-2/realm-dvdrental/README?pixel)
