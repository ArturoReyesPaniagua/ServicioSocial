// middleware/authMiddleware.js 
// Middleware para autenticación y autorización de usuarios
// Este archivo contiene los middlewares para autenticar y verificar el rol de los usuarios



const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const config = require('../db/config');

// Función para obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN La traducción de la cadena de autorización a un token.
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol de administrador
const isAdmin = async (req, res, next) => {
  let connection;
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const { userId } = req.user;
    connection = await getConnection();
    
    const [rows] = await connection.execute(
      'SELECT role FROM users WHERE userId = ?',  // Query para obtener el rol del usuario solicita el usuario del id
      [userId]
    );
  
    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado, se requiere rol de administrador' });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar rol de administrador:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};