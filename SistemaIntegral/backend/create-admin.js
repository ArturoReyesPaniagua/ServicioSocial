//node create-admin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
const config = require('./db/config');

async function createAdminUser() {
  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(config);
    
    // Verificar si el usuario admin ya existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );
    
    if (checkRows.length > 0) {
      console.log('El usuario admin ya existe. Si necesitas restablecer la contraseña, usa la opción de actualización.');
      return;
    }
    
    // Crear contraseña hasheada
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Cambia 'admin123' por la contraseña que quieras
    
    // Datos del nuevo usuario admin
    const admin = {
      userId: uuidv4(),
      username: 'administrador',
      password: hashedPassword,
      role: 'admin'
    };
    
    // Insertar el usuario admin
    await connection.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?, ?)',
      [admin.username, admin.password, admin.role]
    );
    
    console.log('¡Usuario admin creado con éxito!');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123'); // Muestra la contraseña que configuraste
    console.log('Rol: admin');
    
  } catch (error) {
    console.error('Error al crear el usuario admin:', error);
  } finally {
    if (connection) await connection.end();
  }
}

// Ejecutar la función
createAdminUser();