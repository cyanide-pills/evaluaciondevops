-- Initialize Despacho Database
USE despacho_db;

-- Create tables for the application (Updated to Plural)
CREATE TABLE IF NOT EXISTS despachos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    rol VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grant privileges to despacho_user
GRANT ALL PRIVILEGES ON despacho_db.* TO 'despacho_user'@'%';
FLUSH PRIVILEGES;

-- Insert Dummy Data for 'usuarios' table
INSERT INTO usuarios (nombre, email, rol) VALUES
('Juan Pérez', 'juan.perez@example.com', 'Administrador'),
('María Gómez', 'maria.gomez@example.com', 'Operador'),
('Carlos Plaza', 'carlos.plaza@example.com', 'Repartidor');

-- Insert Dummy Data for 'despachos' table
INSERT INTO despachos (nombre, descripcion, estado) VALUES
('Despacho Norte #101', 'Envío prioritario de equipos electrónicos a sucursal norte.', 'En Proceso'),
('Despacho Centro #204', 'Entrega de documentación legal de contratos anuales.', 'Pendiente'),
('Despacho Sur #55', 'Despacho rutinario de suministros de oficina.', 'Completado');