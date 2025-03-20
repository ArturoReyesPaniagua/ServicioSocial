// middleware/authMiddleware.js
// (agregar a la exportación)
const isAdmin = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const connection = await getConnection();
      
      const [rows] = await connection.execute(
        'SELECT role FROM users WHERE userId = ?',
        [userId]
      );
  
      if (rows.length === 0 || rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado, se requiere rol de administrador' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) await connection.end();
    }
  };