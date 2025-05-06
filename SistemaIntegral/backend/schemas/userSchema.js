// File: userSchema.js
// SistemaIntegral/backend/schemas/userSchema.js
// Este archivo define el esquema de la tabla "users" en la base de datos

const userSchema = `
  CREATE TABLE IF NOT EXISTS users (
    userId VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    id_area INT,
    FOREIGN KEY (id_area) REFERENCES Area(id_area) ON DELETE SET NULL
  )
`;

module.exports = userSchema;