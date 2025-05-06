// File: oficioControllers.js
// SistemaIntegral/backend/controllers/oficioControllers.js
// Este archivo contiene las funciones para la gestión de oficios
// que interactúan con la base de datos y manejan las solicitudes HTTP relacionadas con los oficios

const oficioSchema = require('../schemas/oficiosSchema');
const { createTable } = require('../utils/funtiosauth');
const mysql = require('mysql2/promise');
const config = require('../db/config');
const oficioUtils = require('../utils/oficioUtils');

// Obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

// Crear un nuevo oficio
const createOficio = async (req, res) => {
  let connection;
  try {
    // Asegurar que la tabla exista
    await createTable(oficioSchema);

    const {
      estado = 'en proceso',
      numero_de_oficio,
      fecha_recepcion,
      fecha_limite,
      archivado = false,
      fecha_respuesta,
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

    // Crear oficio
    const oficioData = {
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
    };

    connection = await getConnection();
    
    // Verificar que el solicitante existe
    const [solicitanteRows] = await connection.execute(
      'SELECT * FROM Solicitante WHERE id_solicitante = ?',
      [id_solicitante]
    );

    if (solicitanteRows.length === 0) {
      return res.status(404).json({ error: 'Solicitante no encontrado' });
    }

    // Verificar que el responsable existe
    const [responsableRows] = await connection.execute(
      'SELECT * FROM Responsable WHERE id_responsable = ?',
      [id_responsable]
    );

    if (responsableRows.length === 0) {
      return res.status(404).json({ error: 'Responsable no encontrado' });
    }

    // Verificar que el área existe
    const [areaRows] = await connection.execute(
      'SELECT * FROM Area WHERE id_area = ?',
      [id_area]
    );

    if (areaRows.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }

    const [result] = await connection.execute(
      `INSERT INTO Oficio (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    res.status(201).json({
      message: 'Oficio creado exitosamente',
      id_oficio: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener todos los oficios con información de las relaciones
const getAllOficios = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const [rows] = await connection.execute(`
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
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener un oficio por ID con información de las relaciones
const getOficioById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const [rows] = await connection.execute(`
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
        o.id_oficio = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Oficio no encontrado' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Actualizar un oficio
const updateOficio = async (req, res) => {
  let connection;
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

    connection = await getConnection();
    
    // Verificar que el oficio existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Oficio WHERE id_oficio = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Oficio no encontrado' });
    }

    // Verificar relaciones si se proporcionan
    if (id_solicitante) {
      const [solicitanteRows] = await connection.execute(
        'SELECT * FROM Solicitante WHERE id_solicitante = ?',
        [id_solicitante]
      );

      if (solicitanteRows.length === 0) {
        return res.status(404).json({ error: 'Solicitante no encontrado' });
      }
    }

    if (id_responsable) {
      const [responsableRows] = await connection.execute(
        'SELECT * FROM Responsable WHERE id_responsable = ?',
        [id_responsable]
      );

      if (responsableRows.length === 0) {
        return res.status(404).json({ error: 'Responsable no encontrado' });
      }
    }

    if (id_area) {
      const [areaRows] = await connection.execute(
        'SELECT * FROM Area WHERE id_area = ?',
        [id_area]
      );

      if (areaRows.length === 0) {
        return res.status(404).json({ error: 'Área no encontrada' });
      }
    }

    // Construir la consulta dinámica para actualizar sólo los campos proporcionados
    let updateFields = [];
    let updateValues = [];

    if (estado !== undefined) {
      updateFields.push('estado = ?');
      updateValues.push(estado);
    }

    if (numero_de_oficio !== undefined) {
      updateFields.push('numero_de_oficio = ?');
      updateValues.push(numero_de_oficio);
    }

    if (fecha_recepcion !== undefined) {
      updateFields.push('fecha_recepcion = ?');
      updateValues.push(fecha_recepcion);
    }

    if (fecha_limite !== undefined) {
      updateFields.push('fecha_limite = ?');
      updateValues.push(fecha_limite);
    }

    if (archivado !== undefined) {
      updateFields.push('archivado = ?');
      updateValues.push(archivado);
    }

    if (fecha_respuesta !== undefined) {
      updateFields.push('fecha_respuesta = ?');
      updateValues.push(fecha_respuesta);
    }

    if (id_solicitante !== undefined) {
      updateFields.push('id_solicitante = ?');
      updateValues.push(id_solicitante);
    }

    if (asunto !== undefined) {
      updateFields.push('asunto = ?');
      updateValues.push(asunto);
    }

    if (observaciones !== undefined) {
      updateFields.push('observaciones = ?');
      updateValues.push(observaciones);
    }

    if (id_responsable !== undefined) {
      updateFields.push('id_responsable = ?');
      updateValues.push(id_responsable);
    }

    if (id_area !== undefined) {
      updateFields.push('id_area = ?');
      updateValues.push(id_area);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    // Agregar el ID al final del array de valores
    updateValues.push(id);

    // Construir y ejecutar la consulta UPDATE
    const updateQuery = `UPDATE Oficio SET ${updateFields.join(', ')} WHERE id_oficio = ?`;
    await connection.execute(updateQuery, updateValues);

    res.status(200).json({ message: 'Oficio actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Eliminar un oficio
const deleteOficio = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();

    // Verificar que el oficio existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM Oficio WHERE id_oficio = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Oficio no encontrado' });
    }

    // Verificar si hay PDFs asociados
    const [pdfRows] = await connection.execute(
      'SELECT * FROM PDF WHERE id_oficio = ?',
      [id]
    );

    if (pdfRows.length > 0) {
      // Opción 1: Denegar la eliminación si hay PDFs asociados
      // return res.status(400).json({ 
      //   error: 'No se puede eliminar el oficio porque tiene archivos PDF asociados' 
      // });

      // Opción 2: Eliminar los PDFs asociados (cascada)
      await connection.execute(
        'DELETE FROM PDF WHERE id_oficio = ?',
        [id]
      );
    }

    // Eliminar el oficio
    await connection.execute(
      'DELETE FROM Oficio WHERE id_oficio = ?',
      [id]
    );

    res.status(200).json({ message: 'Oficio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Buscar oficios por término de búsqueda
const searchOficios = async (req, res) => {
  let connection;
  try {
    const { term } = req.params;
    connection = await getConnection();
    
    // Buscar en múltiples campos con JOIN para obtener nombres relacionados
    const [rows] = await connection.execute(`
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
        o.numero_de_oficio LIKE ? OR
        o.asunto LIKE ? OR
        s.nombre_solicitante LIKE ? OR
        r.nombre_responsable LIKE ? OR
        a.nombre_area LIKE ?
    `, [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
    
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Filtrar oficios por estado
const getOficiosByEstado = async (req, res) => {
  let connection;
  try {
    const { estado } = req.params;
    connection = await getConnection();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const [rows] = await connection.execute(`
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
        o.estado = ?
    `, [estado]);
    
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener oficios archivados
const getOficiosArchivados = async (req, res) => {
  let connection;
  try {
    const { archivado } = req.params;
    const archivedValue = archivado === 'true';
    connection = await getConnection();
    
    // Consulta con JOIN para obtener información de solicitante, responsable y área
    const [rows] = await connection.execute(`
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
        o.archivado = ?
    `, [archivedValue]);
    
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
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