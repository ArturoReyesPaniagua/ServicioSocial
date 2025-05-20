// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { connectDB } = require('../db/db');

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
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
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const { userId } = req.user;
    const pool = await connectDB();
    
    // Consultar el rol del usuario
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role FROM users WHERE userId = @userId');
  
    if (result.recordset.length === 0 || result.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado, se requiere rol de administrador' });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar rol de administrador:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};