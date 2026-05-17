-- Just create the empty database if it doesn't exist
CREATE DATABASE IF NOT EXISTS despacho_db;
USE despacho_db;

-- Grant privileges to the user so Hibernate can build tables inside it
GRANT ALL PRIVILEGES ON despacho_db.* TO 'despacho_user'@'%';
FLUSH PRIVILEGES;