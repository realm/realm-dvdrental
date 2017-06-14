module.exports = {
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
}