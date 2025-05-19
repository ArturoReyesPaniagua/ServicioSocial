// SistemaIntegral/backend/controllers/oficioControllers.js
const sql = require('mssql');
const oficioSchema = require('../schemas/oficiosSchema');
const { connectDB } = require('../db/db');

// Crear un nuevo oficio
const createOficio = async (req, res) => {
  try {
    console.log(req.body);
    console.log('Creando oficio...');
    
    // Asegurar que la tabla exista
    const pool = await connectDB();
    await pool.request().query(oficioSchema);
    
    console.log('Tabla de oficio creada o ya existe');
    
    const {
      estado = 'en proceso',
      numero_de_oficio,
      fecha_recepcion,
      fecha_limite = null,
      archivado = false,
      fecha_respuesta = null,
      id_solicitante,
      asunto,
      observaciones,
      id_responsable,
      id_area
    } = req.body;

    // Validar campos requeridos
    if (!numero_de_oficio) {
      return res.status(400).json({ error: 'El número de oficio es requerido' });
    }

    if (!id_solicitante) {
      return res.status(400).json({ error: 'El solicitante es requerido' });
    }

    if (!asunto) {
      return res.status(400).json({ error: 'El asunto es requerido' });
    }

    if (!id_responsable) {
      return res.status(400).json({ error: 'El responsable es requerido' });
    }

    if (!id_area) {
      return res.status(400).json({ error: 'El área es requerida' });
    }

    // Verificar que el solicitante existe
    const solicitanteCheck = await pool.request()
      .input('id_solicitante', sql.Int, id_solicitante)
      .query('SELECT * FROM Solicitante WHERE id_solicitante = @id_solicitante');

    if (solicitanteCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    // Verificar que el responsable existe
    const responsableCheck = await pool.request()
      .input('id_responsable', sql.Int, id_responsable)
      .query('SELECT * FROM Responsable WHERE id_responsable = @id_responsable');

    if (responsableCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    // Verificar que el área existe
    const areaCheck = await pool.request()
      .input('id_area', sql.Int, id_area)
      .query('SELECT * FROM Area WHERE id_area = @id_area');

    if (areaCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    // Crear oficio
    const query = `
      INSERT INTO Oficio (
        estado, 
        numero_de_oficio, 
        fecha_recepcion, 
        fecha_limite, 
        archivado, 
        fecha_respuesta, 
        id_solicitante, 
        asunto, 
        observaciones, 
        id_responsable, 
        id_area
      ) VALUES (
        @estado,
        @numero_de_oficio,
        @fecha_recepcion,
        @fecha_limite,
        @archivado,
        @fecha_respuesta,
        @id_solicitante,
        @asunto,
        @observaciones,
        @id_responsable,
        @id_area
      );
      SELECT SCOPE_IDENTITY() AS id_oficio;
    `;
    
    const result = await pool.request()
      .input('estado', sql.NVarChar, estado)
      .input('numero_de_oficio', sql.Int, numero_de_oficio)
      .input('fecha_recepcion', sql.Date, fecha_recepcion ? new Date(fecha_recepcion) : null)
      .input('fecha_limite', sql.Date, fecha_limite ? new Date(fecha_limite) : null)
      .input('archivado', sql.Bit, archivado ? 1 : 0)
      .input('fecha_respuesta', sql.Date, fecha_respuesta ? new Date(fecha_respuesta) : null)
      .input('id_solicitante', sql.Int, id_solicitante)
      .input('asunto', sql.NVarChar, asunto)
      .input('observaciones', sql.NVarChar, observaciones || null)
      .input('id_responsable', sql.Int, id_responsable)
      .input('id_area', sql.Int, id_area)
      .query(query);

    res.status(201).json({
      message: 'Oficio creado exitosamente',
      id_oficio: result.recordset[0].id_oficio
    });
  } catch (error) {
    console.error('Error al crear oficio:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los oficios con información de las relaciones
const getAllOficios = async (req, res) => {
  try {
    const pool = await connectDB();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
    `;
    
    const result = await pool.request().query(query);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener oficios:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un oficio por ID con información de las relaciones
const getOficioById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        o.id_oficio = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Oficio no encontrado' });
    }
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener oficio por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un oficio
const updateOficio = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado,
      numero_de_oficio,
      fecha_recepcion,
      fecha_limite,
      archivado,
      fecha_respuesta,
      id_solicitante,
      asunto,
      observaciones,
      id_responsable,
      id_area
    } = req.body;

    const pool = await connectDB();
    
    // Verificar que el oficio existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Oficio WHERE id_oficio = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Oficio no encontrado' });
    }

    // Verificar relaciones si se proporcionan
    if (id_solicitante) {
      const solicitanteCheck = await pool.request()
        .input('id_solicitante', sql.Int, id_solicitante)
        .query('SELECT * FROM Solicitante WHERE id_solicitante = @id_solicitante');

      if (solicitanteCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Solicitante no encontrado' });
      }
    }

    if (id_responsable) {
      const responsableCheck = await pool.request()
        .input('id_responsable', sql.Int, id_responsable)
        .query('SELECT * FROM Responsable WHERE id_responsable = @id_responsable');

      if (responsableCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Responsable no encontrado' });
      }
    }

    if (id_area) {
      const areaCheck = await pool.request()
        .input('id_area', sql.Int, id_area)
        .query('SELECT * FROM Area WHERE id_area = @id_area');

      if (areaCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Área no encontrada' });
      }
    }

    // Construir la consulta dinámica para actualizar sólo los campos proporcionados
    let updateFields = [];
    const request = pool.request().input('id', sql.Int, id);

    if (estado !== undefined) {
      updateFields.push('estado = @estado');
      request.input('estado', sql.NVarChar, estado);
    }

    if (numero_de_oficio !== undefined) {
      updateFields.push('numero_de_oficio = @numero_de_oficio');
      request.input('numero_de_oficio', sql.Int, numero_de_oficio);
    }

    if (fecha_recepcion !== undefined) {
      updateFields.push('fecha_recepcion = @fecha_recepcion');
      request.input('fecha_recepcion', sql.Date, fecha_recepcion ? new Date(fecha_recepcion) : null);
    }

    if (fecha_limite !== undefined) {
      updateFields.push('fecha_limite = @fecha_limite');
      request.input('fecha_limite', sql.Date, fecha_limite ? new Date(fecha_limite) : null);
    }

    if (archivado !== undefined) {
      updateFields.push('archivado = @archivado');
      request.input('archivado', sql.Bit, archivado ? 1 : 0);
    }

    if (fecha_respuesta !== undefined) {
      updateFields.push('fecha_respuesta = @fecha_respuesta');
      request.input('fecha_respuesta', sql.Date, fecha_respuesta ? new Date(fecha_respuesta) : null);
    }

    if (id_solicitante !== undefined) {
      updateFields.push('id_solicitante = @id_solicitante');
      request.input('id_solicitante', sql.Int, id_solicitante);
    }

    if (asunto !== undefined) {
      updateFields.push('asunto = @asunto');
      request.input('asunto', sql.NVarChar, asunto);
    }

    if (observaciones !== undefined) {
      updateFields.push('observaciones = @observaciones');
      request.input('observaciones', sql.NVarChar, observaciones);
    }

    if (id_responsable !== undefined) {
      updateFields.push('id_responsable = @id_responsable');
      request.input('id_responsable', sql.Int, id_responsable);
    }

    if (id_area !== undefined) {
      updateFields.push('id_area = @id_area');
      request.input('id_area', sql.Int, id_area);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    // Construir y ejecutar la consulta UPDATE
    const updateQuery = `UPDATE Oficio SET ${updateFields.join(', ')} WHERE id_oficio = @id`;
    await request.query(updateQuery);

    res.status(200).json({ message: 'Oficio actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar oficio:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un oficio
const deleteOficio = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // Verificar que el oficio existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Oficio WHERE id_oficio = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Oficio no encontrado' });
    }

    // Verificar si hay PDFs asociados
    const pdfResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM PDF WHERE id_oficio = @id');

    if (pdfResult.recordset.length > 0) {
      // Opción 2: Eliminar los PDFs asociados (cascada)
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM PDF WHERE id_oficio = @id');
    }

    // Eliminar el oficio
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Oficio WHERE id_oficio = @id');

    res.status(200).json({ message: 'Oficio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar oficio:', error);
    res.status(500).json({ error: error.message });
  }
};

// Buscar oficios por término de búsqueda
const searchOficios = async (req, res) => {
  try {
    const { term } = req.params;
    const pool = await connectDB();
    
    // Buscar en múltiples campos con JOIN para obtener nombres relacionados
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        CONVERT(VARCHAR, o.numero_de_oficio) LIKE @term OR
        o.asunto LIKE @term OR
        s.nombre_solicitante LIKE @term OR
        r.nombre_responsable LIKE @term OR
        a.nombre_area LIKE @term
    `;
    
    const result = await pool.request()
      .input('term', sql.NVarChar, `%${term}%`)
      .query(query);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al buscar oficios:', error);
    res.status(500).json({ error: error.message });
  }
};

// Filtrar oficios por estado
const getOficiosByEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    const pool = await connectDB();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        o.estado = @estado
    `;
    
    const result = await pool.request()
      .input('estado', sql.NVarChar, estado)
      .query(query);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al filtrar oficios por estado:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener oficios archivados
const getOficiosArchivados = async (req, res) => {
  try {
    const { archivado } = req.params;
    const archivedValue = archivado === 'true' ? 1 : 0; // Convertir a 1/0 para SQL Server BIT
    const pool = await connectDB();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const query = `
      SELECT 
        o.*,
        s.nombre_solicitante,
        r.nombre_responsable,
        a.nombre_area
      FROM 
        Oficio o
      LEFT JOIN 
        Solicitante s ON o.id_solicitante = s.id_solicitante
      LEFT JOIN 
        Responsable r ON o.id_responsable = r.id_responsable
      LEFT JOIN 
        Area a ON o.id_area = a.id_area
      WHERE 
        o.archivado = @archivado
    `;
    
    const result = await pool.request()
      .input('archivado', sql.Bit, archivedValue)
      .query(query);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener oficios archivados:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOficio,
  getAllOficios,
  getOficioById,
  updateOficio,
  deleteOficio,
  searchOficios,
  getOficiosByEstado,
  getOficiosArchivados
};