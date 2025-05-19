// SistemaIntegral/backend/create-admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const config = require('./db/config');

async function createAdminUser() {
  let pool;
  try {
    // Conectar a la base de datos
    pool = await sql.connect(config);
    
    // Verificar si el usuario admin ya existe
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, 'administrador')
      .query('SELECT * FROM users WHERE username = @username');
    
    if (checkResult.recordset.length > 0) {
      console.log('El usuario admin ya existe. Si necesitas restablecer la contraseña, usa la opción de actualización.');
      return;
    }
    
    // Crear contraseña hasheada 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Insertar el usuario admin
    await pool.request()
      .input('username', sql.NVarChar, 'administrador')
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, 'admin')
      .query('INSERT INTO users (username, password, role) VALUES (@username, @password, @role)');
    
    console.log('¡Usuario admin creado con éxito!');
    console.log('Usuario: administrador');
    console.log('Contraseña: admin123'); // Muestra la contraseña que configuraste
    console.log('Rol: admin');
    
  } catch (error) {
    console.error('Error al crear el usuario admin:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Ejecutar la función
createAdminUser();