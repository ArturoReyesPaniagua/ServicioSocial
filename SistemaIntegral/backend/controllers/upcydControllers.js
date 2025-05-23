// SistemaIntegral/backend/controllers/upcydControllers.js (corregido)
const sql = require('mssql');
const UPEyCESchema = require('../schemas/UPEyCESchema'); // Referencia corregida
const { connectDB } = require('../db/db');

// Crear un nuevo registro UPEyCE
const createUPEyCE = async (req, res) => {
  try {
    // Asegurar que la tabla exista
    const pool = await connectDB();
    await pool.request().query(UPEyCESchema);

    const { numero_UPEyCE, id_area, descripcion } = req.body;
    
    if (!numero_UPEyCE) {
      return res.status(400).json({ error: 'El número de UPEyCE es requerido' });
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
      .input('numero_UPEyCE', sql.NVarChar, numero_UPEyCE)
      .input('id_area', sql.Int, id_area || null)
      .input('id_usuario_solicita', sql.Int, userId)
      .input('descripcion', sql.NVarChar, descripcion || null)
      .query(`
        INSERT INTO UPEyCE (numero_UPEyCE, id_area, id_usuario_solicita, descripcion) 
        VALUES (@numero_UPEyCE, @id_area, @id_usuario_solicita, @descripcion);
        SELECT SCOPE_IDENTITY() AS id_UPEyCE;
      `);

    res.status(201).json({
      message: 'Registro UPEyCE creado exitosamente',
      id_UPEyCE: result.recordset[0].id_UPEyCE
    });
  } catch (error) {
    console.error('Error al crear registro UPEyCE:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los registros UPEyCE
const getAllUPEyCE = async (req, res) => {
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
          UPEyCE u
        LEFT JOIN 
          Area a ON u.id_area = a.id_area
        LEFT JOIN
          users usr ON u.id_usuario_solicita = usr.userId
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
          UPEyCE u
        LEFT JOIN 
          Area a ON u.id_area = a.id_area
        LEFT JOIN
          users usr ON u.id_usuario_solicita = usr.userId
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
    console.error('Error al obtener registros UPEyCE:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un registro UPEyCE por ID
const getUPEyCEById = async (req, res) => {
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
    
    // Obtener el registro UPEyCE
    const query = `
      SELECT 
        u.*,
        a.nombre_area,
        usr.username as nombre_usuario
      FROM 
        UPEyCE u
      LEFT JOIN 
        Area a ON u.id_area = a.id_area
      LEFT JOIN
        users usr ON u.id_usuario_solicita = usr.userId
      WHERE 
        u.id_UPEyCE = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Registro UPEyCE no encontrado' });
    }
    
    const UPEyCE = result.recordset[0];
    
    // Validar permisos - solo admin o usuario del mismo área puede ver
    if (userRole !== 'admin' && UPEyCE.id_area !== userArea) {
      return res.status(403).json({ 
        error: 'No tiene permiso para acceder a este registro' 
      });
    }
    
    res.status(200).json(UPEyCE);
  } catch (error) {
    console.error('Error al obtener registro UPEyCE por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un registro UPEyCE
const updateUPEyCE = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_UPEyCE, id_area, descripcion } = req.body;
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
      .query('SELECT * FROM UPEyCE WHERE id_UPEyCE = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Registro UPEyCE no encontrado' });
    }
    
    const UPEyCE = checkResult.recordset[0];
    
    // Validar permisos - solo admin o usuario del mismo área puede editar
    if (userRole !== 'admin' && UPEyCE.id_area !== userArea) {
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

    if (numero_UPEyCE !== undefined) {
      updateFields.push('numero_UPEyCE = @numero_UPEyCE');
      request.input('numero_UPEyCE', sql.NVarChar, numero_UPEyCE);
    }

    if (descripcion !== undefined) {
      updateFields.push('descripcion = @descripcion');
      request.input('descripcion', sql.NVarChar, descripcion);
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
    const updateQuery = `UPDATE UPEyCE SET ${updateFields.join(', ')} WHERE id_UPEyCE = @id`;
    await request.query(updateQuery);

    res.status(200).json({ message: 'Registro UPEyCE actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar registro UPEyCE:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un registro UPEyCE
const deleteUPEyCE = async (req, res) => {
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
      .query('SELECT * FROM UPEyCE WHERE id_UPEyCE = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Registro UPEyCE no encontrado' });
    }
    
    const UPEyCE = checkResult.recordset[0];
    
    // Validar permisos - solo admin o usuario del mismo área puede eliminar
    if (userRole !== 'admin' && UPEyCE.id_area !== userArea) {
      return res.status(403).json({ 
        error: 'No tiene permiso para eliminar este registro' 
      });
    }

    // Verificar si hay oficios asociados
    const oficioResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Oficio WHERE id_UPEyCE = @id');

    if (oficioResult.recordset.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el registro UPEyCE porque está siendo utilizado en oficios' 
      });
    }

    // Eliminar el registro
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM UPEyCE WHERE id_UPEyCE = @id');

    res.status(200).json({ message: 'Registro UPEyCE eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar registro UPEyCE:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUPEyCE,
  getAllUPEyCE,
  getUPEyCEById,
  updateUPEyCE,
  deleteUPEyCE
};