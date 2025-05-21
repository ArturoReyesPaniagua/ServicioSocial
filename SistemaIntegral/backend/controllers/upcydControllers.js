// SistemaIntegral/backend/controllers/upcydControllers.js
const sql = require('mssql');
const upcydSchema = require('../db/upcydSchema');
const { connectDB } = require('../db/db');

// Crear un nuevo registro UPCYD
const createUPCYD = async (req, res) => {
  try {
    // Asegurar que la tabla exista
    const pool = await connectDB();
    await pool.request().query(upcydSchema);

    const { numero_UPCYD, id_area } = req.body;
    
    if (!numero_UPCYD) {
      return res.status(400).json({ error: 'El número de UPCYD es requerido' });
    }

    // Obtener el usuario desde el token de autenticación
    const userId = req.user.userId;

    // Verificar que el área existe si se proporciona
    if (id_area) {
      const areaCheck = await pool.request()
        .input('id_area', sql.Int, id_area)
        .query('SELECT * FROM Area WHERE id_area = @id_area');
        
      if (areaCheck.recordset.length === 0) {
        return res.status(404).json({ error: "El área seleccionada no existe" });
      }
    }

    const result = await pool.request()
      .input('numero_UPCYD', sql.NVarChar, numero_UPCYD)
      .input('id_area', sql.Int, id_area || null)
      .input('id_usuario', sql.Int, userId)
      .query(`
        INSERT INTO UPCYD (numero_UPCYD, id_area, id_usuario) 
        VALUES (@numero_UPCYD, @id_area, @id_usuario);
        SELECT SCOPE_IDENTITY() AS id_UPCYD;
      `);

    res.status(201).json({
      message: 'Registro UPCYD creado exitosamente',
      id_UPCYD: result.recordset[0].id_UPCYD
    });
  } catch (error) {
    console.error('Error al crear registro UPCYD:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los registros UPCYD
const getAllUPCYD = async (req, res) => {
  try {
    const pool = await connectDB();
    
    // Obtener el usuario autenticado
    const userId = req.user.userId;
    
    // Obtener el rol y área del usuario
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, id_area FROM users WHERE userId = @userId');
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const userRole = userResult.recordset[0].role;
    const userArea = userResult.recordset[0].id_area;
    
    // Construir la consulta según el rol
    let query;
    
    if (userRole === 'admin') {
      // Los administradores pueden ver todos los registros
      query = `
        SELECT 
          u.*,
          a.nombre_area,
          usr.username as nombre_usuario
        FROM 
          UPCYD u
        LEFT JOIN 
          Area a ON u.id_area = a.id_area
        LEFT JOIN
          users usr ON u.id_usuario = usr.userId
        ORDER BY
          u.fecha_creacion DESC
      `;
      
      const result = await pool.request().query(query);
      res.status(200).json(result.recordset);
    } else {
      // Usuarios normales solo ven registros de su área
      query = `
        SELECT 
          u.*,
          a.nombre_area,
          usr.username as nombre_usuario
        FROM 
          UPCYD u
        LEFT JOIN 
          Area a ON u.id_area = a.id_area
        LEFT JOIN
          users usr ON u.id_usuario = usr.userId
        WHERE 
          u.id_area = @userArea
        ORDER BY
          u.fecha_creacion DESC
      `;
      
      const result = await pool.request()
        .input('userArea', sql.Int, userArea)
        .query(query);
        
      res.status(200).json(result.recordset);
    }
  } catch (error) {
    console.error('Error al obtener registros UPCYD:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un registro UPCYD por ID
const getUPCYDById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    // Obtener el usuario autenticado
    const userId = req.user.userId;
    
    // Obtener el rol y área del usuario
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, id_area FROM users WHERE userId = @userId');
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const userRole = userResult.recordset[0].role;
    const userArea = userResult.recordset[0].id_area;
    
    // Obtener el registro UPCYD
    const query = `
      SELECT 
        u.*,
        a.nombre_area,
        usr.username as nombre_usuario
      FROM 
        UPCYD u
      LEFT JOIN 
        Area a ON u.id_area = a.id_area
      LEFT JOIN
        users usr ON u.id_usuario = usr.userId
      WHERE 
        u.id_UPCYD = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Registro UPCYD no encontrado' });
    }
    
    const upcyd = result.recordset[0];
    
    // Validar permisos - solo admin o usuario del mismo área puede ver
    if (userRole !== 'admin' && upcyd.id_area !== userArea) {
      return res.status(403).json({ 
        error: 'No tiene permiso para acceder a este registro' 
      });
    }
    
    res.status(200).json(upcyd);
  } catch (error) {
    console.error('Error al obtener registro UPCYD por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un registro UPCYD
const updateUPCYD = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_UPCYD, id_area } = req.body;
    const pool = await connectDB();
    
    // Obtener el usuario autenticado
    const userId = req.user.userId;
    
    // Obtener el rol y área del usuario
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, id_area FROM users WHERE userId = @userId');
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const userRole = userResult.recordset[0].role;
    const userArea = userResult.recordset[0].id_area;
    
    // Verificar que el registro existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM UPCYD WHERE id_UPCYD = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Registro UPCYD no encontrado' });
    }
    
    const upcyd = checkResult.recordset[0];
    
    // Validar permisos - solo admin o usuario del mismo área puede editar
    if (userRole !== 'admin' && upcyd.id_area !== userArea) {
      return res.status(403).json({ 
        error: 'No tiene permiso para editar este registro' 
      });
    }
    
    // Verificar que el área existe si se proporciona
    if (id_area) {
      const areaCheck = await pool.request()
        .input('id_area', sql.Int, id_area)
        .query('SELECT * FROM Area WHERE id_area = @id_area');
        
      if (areaCheck.recordset.length === 0) {
        return res.status(404).json({ error: "El área seleccionada no existe" });
      }
    }

    // Construir la consulta dinámica para actualizar sólo los campos proporcionados
    let updateFields = [];
    const request = pool.request().input('id', sql.Int, id);

    if (numero_UPCYD !== undefined) {
      updateFields.push('numero_UPCYD = @numero_UPCYD');
      request.input('numero_UPCYD', sql.NVarChar, numero_UPCYD);
    }

    // Para el área, solo permitir cambiarla si es admin
    if (userRole === 'admin' && id_area !== undefined) {
      updateFields.push('id_area = @id_area');
      request.input('id_area', sql.Int, id_area);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    // Construir y ejecutar la consulta UPDATE
    const updateQuery = `UPDATE UPCYD SET ${updateFields.join(', ')} WHERE id_UPCYD = @id`;
    await request.query(updateQuery);

    res.status(200).json({ message: 'Registro UPCYD actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar registro UPCYD:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un registro UPCYD
const deleteUPCYD = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // Obtener el usuario autenticado
    const userId = req.user.userId;
    
    // Obtener el rol y área del usuario
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, id_area FROM users WHERE userId = @userId');
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const userRole = userResult.recordset[0].role;
    const userArea = userResult.recordset[0].id_area;
    
    // Verificar que el registro existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM UPCYD WHERE id_UPCYD = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Registro UPCYD no encontrado' });
    }
    
    const upcyd = checkResult.recordset[0];
    
    // Validar permisos - solo admin o usuario del mismo área puede eliminar
    if (userRole !== 'admin' && upcyd.id_area !== userArea) {
      return res.status(403).json({ 
        error: 'No tiene permiso para eliminar este registro' 
      });
    }

    // Verificar si hay oficios asociados
    const oficioResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Oficio WHERE id_UPCYD = @id');

    if (oficioResult.recordset.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el registro UPCYD porque está siendo utilizado en oficios' 
      });
    }

    // Eliminar el registro
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM UPCYD WHERE id_UPCYD = @id');

    res.status(200).json({ message: 'Registro UPCYD eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar registro UPCYD:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUPCYD,
  getAllUPCYD,
  getUPCYDById,
  updateUPCYD,
  deleteUPCYD
};