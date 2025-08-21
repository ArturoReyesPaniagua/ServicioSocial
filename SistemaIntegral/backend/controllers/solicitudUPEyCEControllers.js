// SistemaIntegral/backend/controllers/solicitudUPEyCEControllers.js
// Controlador actualizado con asignación manual de folios

const sql = require('mssql');
const solicitudUPEyCESchema = require('../schemas/SolicitudUPEyCE');
const UPEyCESchema = require('../schemas/UPEyCESchema');
const { connectDB } = require('../db/db');

// Función auxiliar para crear notificación
const createNotification = async (pool, userId, tipo, titulo, mensaje, solicitudId = null) => {
  try {
    await pool.request()
      .input('id_usuario', sql.Int, userId)
      .input('tipo', sql.NVarChar, tipo)
      .input('titulo', sql.NVarChar, titulo)
      .input('mensaje', sql.NVarChar, mensaje)
      .input('id_solicitud', sql.Int, solicitudId)
      .query(`
        INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, id_solicitud)
        VALUES (@id_usuario, @tipo, @titulo, @mensaje, @id_solicitud)
      `);
  } catch (error) {
    console.error('Error creando notificación:', error);
  }
};

// Función auxiliar para registrar en historial
const registrarHistorial = async (pool, solicitudId, estadoAnterior, estadoNuevo, usuarioCambio, comentarios = null, numeroFolio = null) => {
  try {
    await pool.request()
      .input('id_solicitud', sql.Int, solicitudId)
      .input('estado_anterior', sql.NVarChar, estadoAnterior)
      .input('estado_nuevo', sql.NVarChar, estadoNuevo)
      .input('id_usuario_cambio', sql.Int, usuarioCambio)
      .input('comentarios', sql.NVarChar, comentarios)
      .input('numero_folio_asignado', sql.NVarChar, numeroFolio)
      .query(`
        INSERT INTO HistorialSolicitudUPEyCE 
        (id_solicitud, estado_anterior, estado_nuevo, id_usuario_cambio, comentarios, numero_folio_asignado)
        VALUES (@id_solicitud, @estado_anterior, @estado_nuevo, @id_usuario_cambio, @comentarios, @numero_folio_asignado)
      `);
  } catch (error) {
    console.error('Error registrando historial:', error);
  }
};

// Función para obtener el siguiente número de folio sugerido
const getSuggestedNextFolioNumber = async (pool, idArea) => {
  try {
    // Buscar el número más alto en solicitudes aprobadas para esta área
    const result = await pool.request()
      .input('id_area', sql.Int, idArea)
      .query(`
        SELECT TOP 1 numero_folio_asignado
        FROM SolicitudUPEyCE 
        WHERE id_area = @id_area 
        AND estado = 'aprobado' 
        AND numero_folio_asignado IS NOT NULL
        ORDER BY CAST(numero_folio_asignado AS INT) DESC
      `);

    if (result.recordset.length > 0) {
      const lastNumber = parseInt(result.recordset[0].numero_folio_asignado);
      return (lastNumber + 1).toString();
    }

    // Si no hay folios previos, empezar desde 1
    return "1";
  } catch (error) {
    console.error('Error obteniendo siguiente número:', error);
    return "1";
  }
};

// Verificar si un número de folio ya existe
const verificarFolioExiste = async (pool, numeroFolio, idArea) => {
  try {
    const result = await pool.request()
      .input('numero_folio', sql.NVarChar, numeroFolio)
      .input('id_area', sql.Int, idArea)
      .query(`
        SELECT COUNT(*) as count
        FROM SolicitudUPEyCE 
        WHERE numero_folio_asignado = @numero_folio 
        AND id_area = @id_area 
        AND estado = 'aprobado'
      `);

    return result.recordset[0].count > 0;
  } catch (error) {
    console.error('Error verificando folio:', error);
    return false;
  }
};

// Crear nueva solicitud de folio
const createSolicitudUPEyCE = async (req, res) => {
  try {
    console.log('🎫 === CREANDO NUEVA SOLICITUD DE FOLIO ===');
    const { id_area, justificacion, descripcion, prioridad = 'normal' } = req.body;
    const userId = req.user.userId;

    if (!id_area || !justificacion) {
      return res.status(400).json({ 
        error: 'id_area y justificacion son requeridos' 
      });
    }

    const pool = await connectDB();
    
    // Crear esquemas si no existen
    await pool.request().query(solicitudUPEyCESchema);

    // Insertar solicitud
    const result = await pool.request()
      .input('id_area', sql.Int, id_area)
      .input('id_usuario_solicita', sql.Int, userId)
      .input('justificacion', sql.NVarChar, justificacion)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('prioridad', sql.NVarChar, prioridad)
      .query(`
        INSERT INTO SolicitudUPEyCE 
        (id_area, id_usuario_solicita, justificacion, descripcion, prioridad)
        VALUES (@id_area, @id_usuario_solicita, @justificacion, @descripcion, @prioridad);
        SELECT SCOPE_IDENTITY() as id_solicitud;
      `);

    const solicitudId = result.recordset[0].id_solicitud;

    // Registrar en historial
    await registrarHistorial(pool, solicitudId, null, 'pendiente', userId, 'Solicitud creada');

    // Notificar a todos los administradores
    const adminsResult = await pool.request()
      .query("SELECT userId FROM users WHERE role = 'admin'");

    for (const admin of adminsResult.recordset) {
      await createNotification(
        pool,
        admin.userId,
        'nueva_solicitud',
        'Nueva solicitud de folio',
        `Se ha creado una nueva solicitud de folio que requiere aprobación`,
        solicitudId
      );
    }

    console.log(`✅ Solicitud ${solicitudId} creada exitosamente`);

    res.status(201).json({
      message: 'Solicitud de folio creada exitosamente',
      id_solicitud: solicitudId
    });

  } catch (error) {
    console.error('❌ Error creando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las solicitudes
const getAllSolicitudes = async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;
    const userRole = req.user.role;

    let whereClause = '';
    if (userRole !== 'admin') {
      whereClause = `WHERE s.id_usuario_solicita = ${userId}`;
    }

    const result = await pool.request()
      .query(`
        SELECT 
          s.*,
          a.nombre_area,
          u_solicita.username as usuario_solicita,
          u_responde.username as usuario_responde
        FROM SolicitudUPEyCE s
        LEFT JOIN Area a ON s.id_area = a.id_area
        LEFT JOIN users u_solicita ON s.id_usuario_solicita = u_solicita.userId
        LEFT JOIN users u_responde ON s.id_usuario_responde = u_responde.userId
        ${whereClause}
        ORDER BY s.fecha_solicitud DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener solicitud por ID
const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          s.*,
          a.nombre_area,
          u_solicita.username as usuario_solicita,
          u_responde.username as usuario_responde
        FROM SolicitudUPEyCE s
        LEFT JOIN Area a ON s.id_area = a.id_area
        LEFT JOIN users u_solicita ON s.id_usuario_solicita = u_solicita.userId
        LEFT JOIN users u_responde ON s.id_usuario_responde = u_responde.userId
        WHERE s.id_solicitud = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = result.recordset[0];

    // Obtener historial
    const historialResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          h.*,
          u.username as usuario_cambio
        FROM HistorialSolicitudUPEyCE h
        LEFT JOIN users u ON h.id_usuario_cambio = u.userId
        WHERE h.id_solicitud = @id
        ORDER BY h.fecha_cambio DESC
      `);

    res.status(200).json({
      solicitud,
      historial: historialResult.recordset
    });

  } catch (error) {
    console.error('Error obteniendo solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// NUEVA FUNCIÓN: Obtener número de folio sugerido
const getSuggestedFolioNumber = async (req, res) => {
  try {
    const { id_area } = req.params;
    const pool = await connectDB();

    const suggestedNumber = await getSuggestedNextFolioNumber(pool, id_area);

    res.status(200).json({
      suggested_number: suggestedNumber,
      id_area: id_area
    });

  } catch (error) {
    console.error('Error obteniendo número sugerido:', error);
    res.status(500).json({ error: error.message });
  }
};

// NUEVA FUNCIÓN: Aprobar solicitud con asignación manual de folio
const aprobarSolicitud = async (req, res) => {
  try {
    console.log('✅ === APROBANDO SOLICITUD CON FOLIO MANUAL ===');
    const { id } = req.params;
    const { numero_folio, comentarios_respuesta } = req.body;
    const pool = await connectDB();
    const userId = req.user.userId;

    // Validaciones
    if (!numero_folio) {
      return res.status(400).json({ error: 'El número de folio es requerido' });
    }

    // Verificar que el usuario es administrador
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, username FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0 || userResult.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden aprobar solicitudes' });
    }

    // Obtener la solicitud
    const solicitudResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM SolicitudUPEyCE WHERE id_solicitud = @id');

    if (solicitudResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudResult.recordset[0];

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ 
        error: `No se puede aprobar una solicitud en estado: ${solicitud.estado}` 
      });
    }

    // Verificar si el número de folio ya existe para esta área
    const folioExiste = await verificarFolioExiste(pool, numero_folio, solicitud.id_area);
    if (folioExiste) {
      return res.status(400).json({ 
        error: `El número de folio ${numero_folio} ya existe para esta área` 
      });
    }

    // Actualizar la solicitud
    await pool.request()
      .input('id', sql.Int, id)
      .input('numero_folio', sql.NVarChar, numero_folio)
      .input('comentarios', sql.NVarChar, comentarios_respuesta)
      .input('id_usuario_responde', sql.Int, userId)
      .query(`
        UPDATE SolicitudUPEyCE 
        SET estado = 'aprobado',
            numero_folio_asignado = @numero_folio,
            comentarios_respuesta = @comentarios,
            id_usuario_responde = @id_usuario_responde,
            fecha_respuesta = GETDATE()
        WHERE id_solicitud = @id
      `);

    // Crear el UPEyCE en la tabla correspondiente
    await pool.request().query(UPEyCESchema);

    await pool.request()
      .input('numero_UPEyCE', sql.NVarChar, numero_folio)
      .input('id_area', sql.Int, solicitud.id_area)
      .input('id_usuario', sql.Int, solicitud.id_usuario_solicita)
      .input('descripcion', sql.NVarChar, solicitud.descripcion)
      .query(`
        INSERT INTO UPEyCE (numero_UPEyCE, id_area, id_usuario_solicita, descripcion, fecha_creacion)
        VALUES (@numero_UPEyCE, @id_area, @id_usuario, @descripcion, GETDATE())
      `);

    // Registrar en historial
    await registrarHistorial(
      pool, 
      id, 
      'pendiente', 
      'aprobado', 
      userId, 
      comentarios_respuesta || `Folio ${numero_folio} asignado`,
      numero_folio
    );

    // Notificar al solicitante
    await createNotification(
      pool,
      solicitud.id_usuario_solicita,
      'solicitud_aprobada',
      'Solicitud de folio aprobada',
      `Su solicitud ha sido aprobada. Folio asignado: ${numero_folio}`,
      id
    );

    console.log(`✅ Solicitud ${id} aprobada con folio ${numero_folio}`);

    res.status(200).json({
      message: 'Solicitud aprobada exitosamente',
      numero_folio_asignado: numero_folio
    });

  } catch (error) {
    console.error('❌ Error aprobando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rechazar solicitud
const rechazarSolicitud = async (req, res) => {
  try {
    console.log('❌ === RECHAZANDO SOLICITUD ===');
    const { id } = req.params;
    const { comentarios_respuesta } = req.body;
    const pool = await connectDB();
    const userId = req.user.userId;

    // Verificar que el usuario es administrador
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0 || userResult.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden rechazar solicitudes' });
    }

    // Obtener la solicitud
    const solicitudResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM SolicitudUPEyCE WHERE id_solicitud = @id');

    if (solicitudResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudResult.recordset[0];

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ 
        error: `No se puede rechazar una solicitud en estado: ${solicitud.estado}` 
      });
    }

    // Actualizar la solicitud
    await pool.request()
      .input('id', sql.Int, id)
      .input('comentarios', sql.NVarChar, comentarios_respuesta)
      .input('id_usuario_responde', sql.Int, userId)
      .query(`
        UPDATE SolicitudUPEyCE 
        SET estado = 'rechazado',
            comentarios_respuesta = @comentarios,
            id_usuario_responde = @id_usuario_responde,
            fecha_respuesta = GETDATE()
        WHERE id_solicitud = @id
      `);

    // Registrar en historial
    await registrarHistorial(
      pool, 
      id, 
      'pendiente', 
      'rechazado', 
      userId, 
      comentarios_respuesta || 'Solicitud rechazada'
    );

    // Notificar al solicitante
    await createNotification(
      pool,
      solicitud.id_usuario_solicita,
      'solicitud_rechazada',
      'Solicitud de folio rechazada',
      `Su solicitud ha sido rechazada. Motivo: ${comentarios_respuesta || 'No especificado'}`,
      id
    );

    console.log(`❌ Solicitud ${id} rechazada`);

    res.status(200).json({
      message: 'Solicitud rechazada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error rechazando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cancelar solicitud (por el usuario)
const cancelarSolicitud = async (req, res) => {
  try {
    console.log('🚫 === CANCELANDO SOLICITUD ===');
    const { id } = req.params;
    const { comentarios } = req.body;
    const pool = await connectDB();
    const userId = req.user.userId;

    // Obtener la solicitud
    const solicitudResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM SolicitudUPEyCE WHERE id_solicitud = @id');

    if (solicitudResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudResult.recordset[0];

    // Verificar que es el usuario que la creó o un admin
    if (solicitud.id_usuario_solicita !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tiene permisos para cancelar esta solicitud' });
    }

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ 
        error: `No se puede cancelar una solicitud en estado: ${solicitud.estado}` 
      });
    }

    // Actualizar la solicitud
    await pool.request()
      .input('id', sql.Int, id)
      .input('comentarios', sql.NVarChar, comentarios)
      .query(`
        UPDATE SolicitudUPEyCE 
        SET estado = 'cancelado',
            comentarios_respuesta = @comentarios,
            fecha_respuesta = GETDATE()
        WHERE id_solicitud = @id
      `);

    // Registrar en historial
    await registrarHistorial(
      pool, 
      id, 
      'pendiente', 
      'cancelado', 
      userId, 
      comentarios || 'Solicitud cancelada por el usuario'
    );

    console.log(`🚫 Solicitud ${id} cancelada`);

    res.status(200).json({
      message: 'Solicitud cancelada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error cancelando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener solicitudes pendientes (solo para administradores)
const getSolicitudesPendientes = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .query(`
        SELECT 
          s.*,
          a.nombre_area,
          u.username as usuario_solicita
        FROM SolicitudUPEyCE s
        LEFT JOIN Area a ON s.id_area = a.id_area
        LEFT JOIN users u ON s.id_usuario_solicita = u.userId
        WHERE s.estado = 'pendiente'
        ORDER BY s.fecha_solicitud ASC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo solicitudes pendientes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener notificaciones del usuario
const getNotificaciones = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = await connectDB();

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT * FROM Notificaciones 
        WHERE id_usuario = @userId 
        ORDER BY fecha_creacion DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ error: error.message });
  }
};

// Marcar notificación como leída
const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const pool = await connectDB();

    await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE Notificaciones 
        SET leida = 1, fecha_lectura = GETDATE()
        WHERE id_notificacion = @id AND id_usuario = @userId
      `);

    res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error marcando notificación:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener estadísticas
const getEstadisticas = async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;
    const userRole = req.user.role;

    let whereClause = '';
    if (userRole !== 'admin') {
      whereClause = `WHERE id_usuario_solicita = ${userId}`;
    }

    const result = await pool.request()
      .query(`
        SELECT 
          estado,
          COUNT(*) as cantidad
        FROM SolicitudUPEyCE 
        ${whereClause}
        GROUP BY estado
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSolicitudUPEyCE,
  getAllSolicitudes,
  getSolicitudById,
  aprobarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  getSolicitudesPendientes,
  getSuggestedFolioNumber,  // NUEVA FUNCIÓN
  getNotificaciones,
  marcarNotificacionLeida,
  getEstadisticas
};