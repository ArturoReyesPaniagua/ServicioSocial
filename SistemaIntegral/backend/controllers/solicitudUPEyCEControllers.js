// SistemaIntegral/backend/controllers/solicitudUPEyCEControllers.js
// VERSIÓN DE DIAGNÓSTICO - Para identificar problemas

const { connectDB } = require('../db/db');
const sql = require('mssql');

// Función de diagnóstico para verificar estructura de tablas
const diagnosticarBaseDatos = async () => {
  try {
    const pool = await connectDB();
    
    // Verificar qué tablas existen
    const tablasResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME IN ('SolicitudUPEyCE', 'Notificaciones', 'HistorialSolicitudUPEyCE', 'Area', 'users')
    `);
    
    console.log('✅ Tablas existentes:', tablasResult.recordset.map(t => t.TABLE_NAME));
    
    // Verificar columnas de SolicitudUPEyCE
    const columnasResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'SolicitudUPEyCE'
    `);
    
    console.log('📋 Columnas SolicitudUPEyCE:', columnasResult.recordset);
    
    // Verificar si hay datos
    const countResult = await pool.request().query(`
      SELECT COUNT(*) as total FROM SolicitudUPEyCE
    `);
    
    console.log('📊 Total solicitudes:', countResult.recordset[0].total);
    
    return true;
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return false;
  }
};

// Función auxiliar para crear notificaciones (CORREGIDA)
const createNotification = async (pool, userId, tipo, titulo, mensaje, solicitudId = null) => {
  try {
    // Verificar qué columna usar para la referencia de solicitud
    const columnasNotif = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Notificaciones' 
      AND COLUMN_NAME IN ('id_solicitud_referencia', 'id_solicitud')
    `);
    
    const columnaReferencia = columnasNotif.recordset.length > 0 ? columnasNotif.recordset[0].COLUMN_NAME : 'id_solicitud';
    
    await pool.request()
      .input('id_usuario', sql.Int, userId)
      .input('tipo', sql.NVarChar, tipo)
      .input('titulo', sql.NVarChar, titulo)
      .input('mensaje', sql.NVarChar, mensaje)
      .input('id_solicitud_ref', sql.Int, solicitudId)
      .query(`
        INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, ${columnaReferencia})
        VALUES (@id_usuario, @tipo, @titulo, @mensaje, @id_solicitud_ref)
      `);
      
    console.log('✅ Notificación creada exitosamente');
  } catch (error) {
    console.error('❌ Error creando notificación:', error);
  }
};

// Función auxiliar para registrar historial
const registrarHistorial = async (pool, solicitudId, estadoAnterior, estadoNuevo, usuarioId, comentarios = null) => {
  try {
    await pool.request()
      .input('id_solicitud', sql.Int, solicitudId)
      .input('estado_anterior', sql.NVarChar, estadoAnterior)
      .input('estado_nuevo', sql.NVarChar, estadoNuevo)
      .input('id_usuario_cambio', sql.Int, usuarioId)
      .input('comentarios', sql.NVarChar, comentarios)
      .query(`
        INSERT INTO HistorialSolicitudUPEyCE 
        (id_solicitud, estado_anterior, estado_nuevo, id_usuario_cambio, comentarios)
        VALUES (@id_solicitud, @estado_anterior, @estado_nuevo, @id_usuario_cambio, @comentarios)
      `);
      
    console.log('✅ Historial registrado exitosamente');
  } catch (error) {
    console.error('❌ Error registrando historial:', error);
  }
};

// Crear nueva solicitud
const createSolicitudUPEyCE = async (req, res) => {
  try {
    console.log('🔍 Iniciando creación de solicitud...');
    
    const pool = await connectDB();
    const { justificacion, descripcion, prioridad = 'normal' } = req.body;
    const userId = req.user.userId;

    console.log('📝 Datos recibidos:', { justificacion, descripcion, prioridad, userId });

    // Validaciones
    if (!justificacion || justificacion.trim().length < 10) {
      return res.status(400).json({ error: 'La justificación debe tener al menos 10 caracteres' });
    }

    // Obtener información del usuario
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT id_area, username FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { id_area, username } = userResult.recordset[0];
    console.log('👤 Usuario encontrado:', { id_area, username });

    // Crear la solicitud
    const result = await pool.request()
      .input('id_area', sql.Int, id_area)
      .input('id_usuario_solicita', sql.Int, userId)
      .input('justificacion', sql.NVarChar, justificacion)
      .input('descripcion', sql.NVarChar, descripcion || null)
      .input('prioridad', sql.NVarChar, prioridad)
      .query(`
        INSERT INTO SolicitudUPEyCE 
        (id_area, id_usuario_solicita, justificacion, descripcion, prioridad)
        VALUES (@id_area, @id_usuario_solicita, @justificacion, @descripcion, @prioridad);
        SELECT SCOPE_IDENTITY() AS id_solicitud;
      `);

    const solicitudId = result.recordset[0].id_solicitud;
    console.log('✅ Solicitud creada con ID:', solicitudId);

    // Registrar en historial
    await registrarHistorial(pool, solicitudId, null, 'pendiente', userId, 'Solicitud creada');

    // Notificar a administradores
    const adminResult = await pool.request()
      .query("SELECT userId FROM users WHERE role = 'admin'");

    console.log('👥 Administradores encontrados:', adminResult.recordset.length);

    for (const admin of adminResult.recordset) {
      await createNotification(
        pool,
        admin.userId,
        'nueva_solicitud',
        'Nueva solicitud de UPEyCE',
        `${username} ha solicitado un nuevo folio UPEyCE`,
        solicitudId
      );
    }

    res.status(201).json({
      message: 'Solicitud de UPEyCE creada exitosamente',
      id_solicitud: solicitudId
    });

  } catch (error) {
    console.error('❌ Error creando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las solicitudes (CON DIAGNÓSTICO)
const getAllSolicitudes = async (req, res) => {
  try {
    console.log('🔍 Iniciando obtención de solicitudes...');
    
    const pool = await connectDB();
    const userId = req.user.userId;

    // Realizar diagnóstico
    await diagnosticarBaseDatos();

    // Obtener rol del usuario
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, id_area FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { role, id_area } = userResult.recordset[0];
    console.log('👤 Usuario:', { role, id_area });

    let query;
    if (role === 'admin') {
      // Consulta simplificada para diagnóstico
      query = `
        SELECT 
          s.id_solicitud,
          s.justificacion,
          s.descripcion,
          s.prioridad,
          s.estado,
          s.fecha_solicitud,
          s.fecha_respuesta,
          s.comentarios_respuesta,
          s.numero_UPEyCE_asignado,
          s.id_area,
          s.id_usuario_solicita,
          s.id_usuario_responde
        FROM SolicitudUPEyCE s
        ORDER BY s.fecha_solicitud DESC
      `;

      const result = await pool.request().query(query);
      console.log('📊 Solicitudes encontradas:', result.recordset.length);
      
      // Enriquecer con información adicional
      const enrichedData = [];
      for (const solicitud of result.recordset) {
        try {
          // Obtener área
          const areaResult = await pool.request()
            .input('id_area', sql.Int, solicitud.id_area)
            .query('SELECT nombre_area FROM Area WHERE id_area = @id_area');
          
          // Obtener usuario solicitante
          const userResult = await pool.request()
            .input('userId', sql.Int, solicitud.id_usuario_solicita)
            .query('SELECT username FROM users WHERE userId = @userId');
          
          enrichedData.push({
            ...solicitud,
            nombre_area: areaResult.recordset[0]?.nombre_area || 'Sin área',
            usuario_solicitante: userResult.recordset[0]?.username || 'Sin usuario',
            dias_pendiente: Math.floor((new Date() - new Date(solicitud.fecha_solicitud)) / (1000 * 60 * 60 * 24)),
            numero_ticket: `TICKET-${solicitud.id_solicitud.toString().padStart(4, '0')}`
          });
        } catch (enrichError) {
          console.error('Error enriqueciendo solicitud:', enrichError);
          enrichedData.push(solicitud);
        }
      }
      
      res.status(200).json(enrichedData);
    } else {
      // Usuario normal - solo sus solicitudes
      query = `
        SELECT 
          s.*,
          a.nombre_area,
          us.username as usuario_solicitante
        FROM SolicitudUPEyCE s
        INNER JOIN Area a ON s.id_area = a.id_area
        INNER JOIN users us ON s.id_usuario_solicita = us.userId
        WHERE s.id_usuario_solicita = @userId
        ORDER BY s.fecha_solicitud DESC
      `;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(query);
      
      console.log('📊 Solicitudes del usuario:', result.recordset.length);
      res.status(200).json(result.recordset);
    }

  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Revisa la consola del servidor para más detalles'
    });
  }
};

// Obtener solicitudes pendientes (SIMPLIFICADO)
const getSolicitudesPendientes = async (req, res) => {
  try {
    console.log('🔍 Obteniendo solicitudes pendientes...');
    
    const pool = await connectDB();
    
    const query = `
      SELECT 
        s.id_solicitud,
        s.justificacion,
        s.descripcion,
        s.prioridad,
        s.fecha_solicitud,
        s.id_area,
        s.id_usuario_solicita
      FROM SolicitudUPEyCE s
      WHERE s.estado = 'pendiente'
      ORDER BY s.fecha_solicitud ASC
    `;

    const result = await pool.request().query(query);
    console.log('📊 Solicitudes pendientes:', result.recordset.length);
    
    // Enriquecer datos básicos
    const enrichedData = [];
    for (const solicitud of result.recordset) {
      try {
        // Obtener área
        const areaResult = await pool.request()
          .input('id_area', sql.Int, solicitud.id_area)
          .query('SELECT nombre_area FROM Area WHERE id_area = @id_area');
        
        // Obtener usuario
        const userResult = await pool.request()
          .input('userId', sql.Int, solicitud.id_usuario_solicita)
          .query('SELECT username FROM users WHERE userId = @userId');
        
        enrichedData.push({
          ...solicitud,
          nombre_area: areaResult.recordset[0]?.nombre_area || 'Sin área',
          usuario_solicitante: userResult.recordset[0]?.username || 'Sin usuario',
          dias_pendiente: Math.floor((new Date() - new Date(solicitud.fecha_solicitud)) / (1000 * 60 * 60 * 24)),
          numero_ticket: `TICKET-${solicitud.id_solicitud.toString().padStart(4, '0')}`
        });
      } catch (enrichError) {
        console.error('Error enriqueciendo solicitud pendiente:', enrichError);
        enrichedData.push(solicitud);
      }
    }
    
    res.status(200).json(enrichedData);

  } catch (error) {
    console.error('❌ Error obteniendo solicitudes pendientes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Resto de funciones básicas (sin cambios por ahora)
const getSolicitudById = async (req, res) => {
  try {
    const pool = await connectDB();
    const { id } = req.params;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM SolicitudUPEyCE WHERE id_solicitud = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error obteniendo solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

const aprobarSolicitud = async (req, res) => {
  res.status(501).json({ error: 'Función en desarrollo' });
};

const rechazarSolicitud = async (req, res) => {
  res.status(501).json({ error: 'Función en desarrollo' });
};

const cancelarSolicitud = async (req, res) => {
  res.status(501).json({ error: 'Función en desarrollo' });
};

const getNotificaciones = async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Notificaciones WHERE id_usuario = @userId ORDER BY fecha_creacion DESC');
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ error: error.message });
  }
};

const marcarNotificacionLeida = async (req, res) => {
  res.status(501).json({ error: 'Función en desarrollo' });
};

const getEstadisticas = async (req, res) => {
  try {
    const pool = await connectDB();
    
    const result = await pool.request().query(`
      SELECT 
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as total_pendientes,
        COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) as total_aprobadas,
        COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as total_rechazadas,
        COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as total_canceladas,
        AVG(CASE 
          WHEN estado IN ('aprobado', 'rechazado') AND fecha_respuesta IS NOT NULL
          THEN DATEDIFF(hour, fecha_solicitud, fecha_respuesta)
        END) as tiempo_promedio_respuesta
      FROM SolicitudUPEyCE
    `);
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

const getNextUPEyCENumberEndpoint = async (req, res) => {
  res.status(501).json({ error: 'Función en desarrollo' });
};

module.exports = {
  createSolicitudUPEyCE,
  getAllSolicitudes,
  getSolicitudById,
  aprobarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  getSolicitudesPendientes,
  getNextUPEyCENumberEndpoint,
  getNotificaciones,
  marcarNotificacionLeida,
  getEstadisticas
};