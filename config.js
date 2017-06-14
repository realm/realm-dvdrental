module.exports = {
  // Database name
  database_name: "dvdrental",
  
  // Realm Object Server URL
  realm_object_server_url: "realm://127.0.0.1:9080",
  
  // Admin token used to talk to ROS - get from ROS output
  admin_user_token: "ewoJImlkZW50aXR5IjogIl9fYXV0aCIsCgkiYWNjZXNzIjogWyJ1cGxvYWQiLCAiZG93bmxvYWQiLCAibWFuYWdlIl0KfQo=:NMEX6AKF503gquAWf+9e5sqhpBSRT+jdrEqqg8u6rfyar93418TJ3gayjlULed9353mNrRWiHBIn74s3s/ds7DT5HDmwSJigsJjjbIX+obROqUw9a5lT5peKH+BNkDV5I+AlzMBGD1mTbciyey624zOYw+/jy7GVEb1t4b+7KS6oVxAgzsFUatQ/3SrIs9oiFeCs1cb03nOJZqOsFPLY6PXzhEaQraBijIJeF1AeCPl4w6ZHv/Bo4G9qpJvMNEWPc1zZhUt/7xrc+TMj2JTho1b0/Czmiz3/7/fwhQ/rYl/CHUip5xmYZuoZTHWL5MP5ZAL6FRLX9j12xEjg0Kq5gg==",
  
  // Posgres config used for all connections - replace with your data
  postgres_config: {
      host:     '127.0.0.1',
      port:     5432,
      user:     'afish',
      password: 'YOUR_POSTGRES_PASSWORD'
  },
}