-- Initialize Despacho Database with properties matching the Frontend/Backend Entities
USE despacho_db;

DROP TABLE IF EXISTS despachos;
DROP TABLE IF EXISTS despacho;

CREATE TABLE IF NOT EXISTS despachos (
    id_despacho INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    direccion_compra VARCHAR(255) NOT NULL,
    fecha_despacho TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    patente_camion VARCHAR(50),
    entregado BOOLEAN DEFAULT FALSE,
    intento INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create an alias table just in case the backend is configured as singular 'despacho'
CREATE TABLE IF NOT EXISTS despacho LIKE despachos;

-- Grant privileges to despacho_user
GRANT ALL PRIVILEGES ON despacho_db.* TO 'despacho_user'@'%';
FLUSH PRIVILEGES;

-- Insert Data matching the real Frontend properties
INSERT INTO despachos (id_compra, direccion_compra, patente_camion, entregado, intento) VALUES
(1001, 'Av. Vitacura 1234, Santiago', 'AB-CD-12', FALSE, 0),
(1002, 'Calle Los Floristas 567, La Florida', 'XY-ZW-34', TRUE, 1),
(1003, 'Paseo Ahumada 89, Santiago Centro', 'EF-GH-56', FALSE, 2);

-- Duplicate seed data to singular alias table
INSERT INTO despacho SELECT * FROM despachos;