// SistemaIntegral/backend/controllers/solicitudUPEyCEControllers.js
// Controladores para el manejo de solicitudes de UPEyCE

const sql = require('mssql');
const solicitudUPEyCESchema = require('../schemas/SolicitudUPEyCE');
const UPEyCESchema = require('../schemas/UPEyCESchema');
const notificacionesHistorialSchema = require('../schemas/notificacionesHistorialSchema');
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
const registrarHistorial = async (pool, solicitudId, estadoAnterior, estadoNuevo, usuarioCambio, comentarios = null) => {
  try {
    await pool.request()
      .input('id_solicitud', sql.Int, solicitudId)
      .input('estado_anterior', sql.NVarChar, estadoAnterior)
      .input('estado_nuevo', sql.NVarChar, estadoNuevo)
      .input('id_usuario_cambio', sql.Int, usuarioCambio)
      .input('comentarios', sql.NVarChar, comentarios)
      .query(`
        INSERT INTO HistorialSolicitudUPEyCE 
        (id_solicitud, estado_anterior, estado_nuevo, id_usuario_cambio, comentarios)
        VALUES (@id_solicitud, @estado_anterior, @estado_nuevo, @id_usuario_cambio, @comentarios)
      `);
  } catch (error) {
    console.error('Error registrando historial:', error);
  }
};

// Crear nueva solicitud de UPEyCE
const createSolicitudUPEyCE = async (req, res) => {
  try {
    const pool = await connectDB();
    // Asegurar que todas las tablas existan
    await pool.request().query(solicitudUPEyCESchema);
    await pool.request().query(notificacionesHistorialSchema);

    const { numero_UPEyCE_solicitado, justificacion, descripcion, prioridad = 'normal' } = req.body;
    const userId = req.user.userId;

    // Validaciones
    if (!numero_UPEyCE_solicitado) {
      return res.status(400).json({ error: 'El número de UPEyCE solicitado es requerido' });
    }

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

    // Verificar que no exista una solicitud pendiente con el mismo número
    const existingResult = await pool.request()
      .input('numero_UPEyCE', sql.NVarChar, numero_UPEyCE_solicitado)
      .input('id_area', sql.Int, id_area)
      .query(`
        SELECT id_solicitud FROM SolicitudUPEyCE 
        WHERE numero_UPEyCE_solicitado = @numero_UPEyCE 
        AND id_area = @id_area 
        AND estado IN ('pendiente', 'aprobado')
      `);

    if (existingResult.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'Ya existe una solicitud pendiente o aprobada con este número de UPEyCE en su área' 
      });
    }

    // Crear la solicitud
    const result = await pool.request()
      .input('numero_UPEyCE_solicitado', sql.NVarChar, numero_UPEyCE_solicitado)
      .input('id_area', sql.Int, id_area)
      .input('id_usuario_solicita', sql.Int, userId)
      .input('justificacion', sql.NVarChar, justificacion)
      .input('descripcion', sql.NVarChar, descripcion || null)
      .input('prioridad', sql.NVarChar, prioridad)
      .query(`
        INSERT INTO SolicitudUPEyCE 
        (numero_UPEyCE_solicitado, id_area, id_usuario_solicita, justificacion, descripcion, prioridad)
        VALUES (@numero_UPEyCE_solicitado, @id_area, @id_usuario_solicita, @justificacion, @descripcion, @prioridad);
        SELECT SCOPE_IDENTITY() AS id_solicitud;
      `);

    const solicitudId = result.recordset[0].id_solicitud;

    // Registrar en historial
    await registrarHistorial(pool, solicitudId, null, 'pendiente', userId, 'Solicitud creada');

    // Notificar a administradores
    const adminResult = await pool.request()
      .query("SELECT userId FROM users WHERE role = 'admin'");

    for (const admin of adminResult.recordset) {
      await createNotification(
        pool,
        admin.userId,
        'solicitud_creada',
        'Nueva solicitud de UPEyCE',
        `${username} ha solicitado el UPEyCE: ${numero_UPEyCE_solicitado}`,
        solicitudId
      );
    }

    res.status(201).json({
      message: 'Solicitud de UPEyCE creada exitosamente',
      id_solicitud: solicitudId
    });

  } catch (error) {
    console.error('Error creando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las solicitudes (con filtros según rol)
const getAllSolicitudes = async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;

    // Obtener rol y área del usuario
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, id_area FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { role, id_area } = userResult.recordset[0];

    let query;
    if (role === 'admin') {
      // Administradores ven todas las solicitudes
      query = `
        SELECT 
          s.*,
          a.nombre_area,
          us.username as usuario_solicitante,
          ur.username as usuario_responde
        FROM SolicitudUPEyCE s
        INNER JOIN Area a ON s.id_area = a.id_area
        INNER JOIN users us ON s.id_usuario_solicita = us.userId
        LEFT JOIN users ur ON s.id_usuario_responde = ur.userId
        ORDER BY 
          CASE s.estado 
            WHEN 'pendiente' THEN 1 
            WHEN 'aprobado' THEN 2 
            WHEN 'rechazado' THEN 3 
            WHEN 'cancelado' THEN 4 
          END,
          CASE s.prioridad 
            WHEN 'urgente' THEN 1 
            WHEN 'alta' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'baja' THEN 4 
          END,
          s.fecha_solicitud DESC
      `;

      const result = await pool.request().query(query);
      res.status(200).json(result.recordset);
    } else {
      // Usuarios normales solo ven sus propias solicitudes
      query = `
        SELECT 
          s.*,
          a.nombre_area,
          us.username as usuario_solicitante,
          ur.username as usuario_responde
        FROM SolicitudUPEyCE s
        INNER JOIN Area a ON s.id_area = a.id_area
        INNER JOIN users us ON s.id_usuario_solicita = us.userId
        LEFT JOIN users ur ON s.id_usuario_responde = ur.userId
        WHERE s.id_usuario_solicita = @userId
        ORDER BY s.fecha_solicitud DESC
      `;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(query);

      res.status(200).json(result.recordset);
    }

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
    const userId = req.user.userId;

    // Obtener solicitud con información completa
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          s.*,
          a.nombre_area,
          us.username as usuario_solicitante,
          ur.username as usuario_responde
        FROM SolicitudUPEyCE s
        INNER JOIN Area a ON s.id_area = a.id_area
        INNER JOIN users us ON s.id_usuario_solicita = us.userId
        LEFT JOIN users ur ON s.id_usuario_responde = ur.userId
        WHERE s.id_solicitud = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = result.recordset[0];

    // Verificar permisos
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role FROM users WHERE userId = @userId');

    const userRole = userResult.recordset[0]?.role;

    if (userRole !== 'admin' && solicitud.id_usuario_solicita !== userId) {
      return res.status(403).json({ error: 'No tiene permisos para ver esta solicitud' });
    }

    // Obtener historial de la solicitud
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

// Aprobar solicitud de UPEyCE
const aprobarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios_respuesta } = req.body;
    const pool = await connectDB();
    const userId = req.user.userId;

    // Verificar que el usuario es administrador
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, username FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0 || userResult.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden aprobar solicitudes' });
    }

    const adminUsername = userResult.recordset[0].username;

    // Obtener la solicitud
    const solicitudResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM SolicitudUPEyCE WHERE id_solicitud = @id');

    if (solicitudResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudResult.recordset[0];

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ error: `No se puede aprobar una solicitud en estado: ${solicitud.estado}` });
    }

    // Crear el UPEyCE automáticamente
    await pool.request().query(UPEyCESchema);

    const UPEyCEResult = await pool.request()
      .input('numero_UPEyCE', sql.NVarChar, solicitud.numero_UPEyCE_solicitado)
      .input('id_area', sql.Int, solicitud.id_area)
      .input('id_usuario', sql.Int, solicitud.id_usuario_solicita)
      .input('descripcion', sql.NVarChar, solicitud.descripcion)
      .query(`
        INSERT INTO UPEyCE (numero_UPEyCE, id_area, id_usuario_solicita, descripcion, fecha_creacion)
        VALUES (@numero_UPEyCE, @id_area, @id_usuario, @descripcion, GETDATE());
        SELECT SCOPE_IDENTITY() AS id_UPEyCE;
      `);

    const UPEyCEId = UPEyCEResult.recordset[0].id_UPEyCE;

    // Actualizar la solicitud
    await pool.request()
      .input('id', sql.Int, id)
      .input('id_usuario_responde', sql.Int, userId)
      .input('comentarios_respuesta', sql.NVarChar, comentarios_respuesta || 'Solicitud aprobada')
      .input('id_UPEyCE_generado', sql.Int, UPEyCEId)
      .query(`
        UPDATE SolicitudUPEyCE 
        SET estado = 'aprobado',
            id_usuario_responde = @id_usuario_responde,
            fecha_respuesta = GETDATE(),
            comentarios_respuesta = @comentarios_respuesta,
            id_UPEyCE_generado = @id_UPEyCE_generado
        WHERE id_solicitud = @id
      `);

    // Registrar en historial
    await registrarHistorial(pool, id, 'pendiente', 'aprobado', userId, comentarios_respuesta);

    // Notificar al usuario solicitante
    await createNotification(
      pool,
      solicitud.id_usuario_solicita,
      'solicitud_aprobada',
      'Solicitud de UPEyCE Aprobada',
      `Su solicitud para el UPEyCE ${solicitud.numero_UPEyCE_solicitado} ha sido aprobada por ${adminUsername}`,
      id
    );

    res.status(200).json({
      message: 'Solicitud aprobada exitosamente',
      id_UPEyCE_generado: UPEyCEId
    });

  } catch (error) {
    console.error('Error aprobando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rechazar solicitud de UPEyCE
const rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios_respuesta } = req.body;
    const pool = await connectDB();
    const userId = req.user.userId;

    if (!comentarios_respuesta || comentarios_respuesta.trim().length < 5) {
      return res.status(400).json({ error: 'Debe proporcionar un motivo para el rechazo (mínimo 5 caracteres)' });
    }

    // Verificar que el usuario es administrador
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role, username FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0 || userResult.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden rechazar solicitudes' });
    }

    const adminUsername = userResult.recordset[0].username;

    // Obtener la solicitud
    const solicitudResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM SolicitudUPEyCE WHERE id_solicitud = @id');

    if (solicitudResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudResult.recordset[0];

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ error: `No se puede rechazar una solicitud en estado: ${solicitud.estado}` });
    }

    // Actualizar la solicitud
    await pool.request()
      .input('id', sql.Int, id)
      .input('id_usuario_responde', sql.Int, userId)
      .input('comentarios_respuesta', sql.NVarChar, comentarios_respuesta)
      .query(`
        UPDATE SolicitudUPEyCE 
        SET estado = 'rechazado',
            id_usuario_responde = @id_usuario_responde,
            fecha_respuesta = GETDATE(),
            comentarios_respuesta = @comentarios_respuesta
        WHERE id_solicitud = @id
      `);

    // Registrar en historial
    await registrarHistorial(pool, id, 'pendiente', 'rechazado', userId, comentarios_respuesta);

    // Notificar al usuario solicitante
    await createNotification(
      pool,
      solicitud.id_usuario_solicita,
      'solicitud_rechazada',
      'Solicitud de UPEyCE Rechazada',
      `Su solicitud para el UPEyCE ${solicitud.numero_UPEyCE_solicitado} ha sido rechazada por ${adminUsername}`,
      id
    );

    res.status(200).json({
      message: 'Solicitud rechazada exitosamente'
    });

  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cancelar solicitud (solo el usuario que la creó)
const cancelarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
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

    // Verificar permisos (solo el solicitante o admin puede cancelar)
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role FROM users WHERE userId = @userId');

    const userRole = userResult.recordset[0]?.role;

    if (userRole !== 'admin' && solicitud.id_usuario_solicita !== userId) {
      return res.status(403).json({ error: 'Solo puede cancelar sus propias solicitudes' });
    }

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ error: `No se puede cancelar una solicitud en estado: ${solicitud.estado}` });
    }

    // Actualizar la solicitud
    await pool.request()
      .input('id', sql.Int, id)
      .input('comentarios', sql.NVarChar, motivo || 'Cancelado por el usuario')
      .query(`
        UPDATE SolicitudUPEyCE 
        SET estado = 'cancelado',
            fecha_respuesta = GETDATE(),
            comentarios_respuesta = @comentarios
        WHERE id_solicitud = @id
      `);

    // Registrar en historial
    await registrarHistorial(pool, id, 'pendiente', 'cancelado', userId, motivo);

    res.status(200).json({
      message: 'Solicitud cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error cancelando solicitud:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener solicitudes pendientes (para admins)
const getSolicitudesPendientes = async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;

    // Verificar que es administrador
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0 || userResult.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden acceder a esta información' });
    }

    // Usar la vista creada en el schema
    const result = await pool.request()
      .query(`
        SELECT * FROM VW_SolicitudesPendientes
        ORDER BY 
          CASE prioridad 
            WHEN 'urgente' THEN 1 
            WHEN 'alta' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'baja' THEN 4 
          END,
          dias_pendiente DESC
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
    const pool = await connectDB();
    const userId = req.user.userId;
    const { solo_no_leidas = false } = req.query;

    let query = `
      SELECT 
        n.*,
        s.numero_UPEyCE_solicitado
      FROM Notificaciones n
      LEFT JOIN SolicitudUPEyCE s ON n.id_solicitud = s.id_solicitud
      WHERE n.id_usuario = @userId
    `;

    if (solo_no_leidas === 'true') {
      query += ' AND n.leida = 0';
    }

    query += ' ORDER BY n.fecha_creacion DESC';

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(query);

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
    const pool = await connectDB();
    const userId = req.user.userId;

    // Verificar que la notificación pertenece al usuario
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT id_notificacion FROM Notificaciones WHERE id_notificacion = @id AND id_usuario = @userId');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    // Marcar como leída
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Notificaciones SET leida = 1 WHERE id_notificacion = @id');

    res.status(200).json({ message: 'Notificación marcada como leída' });

  } catch (error) {
    console.error('Error marcando notificación:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener estadísticas (para dashboard de admin)
const getEstadisticas = async (req, res) => {
  try {
    const pool = await connectDB();
    const userId = req.user.userId;

    // Verificar que es administrador
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT role FROM users WHERE userId = @userId');

    if (userResult.recordset.length === 0 || userResult.recordset[0].role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden acceder a esta información' });
    }

    // Obtener estadísticas generales
    const estadisticas = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as total_solicitudes,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobadas,
          SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as rechazadas,
          SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as canceladas,
          AVG(CASE 
            WHEN estado != 'pendiente' 
            THEN DATEDIFF(hour, fecha_solicitud, fecha_respuesta) 
            ELSE NULL 
          END) as tiempo_promedio_respuesta_horas
        FROM SolicitudUPEyCE
        WHERE fecha_solicitud >= DATEADD(month, -6, GETDATE())
      `);

    // Estadísticas por mes (últimos 6 meses)
    const estadisticasMensuales = await pool.request()
      .query(`
        SELECT 
          FORMAT(fecha_solicitud, 'yyyy-MM') as mes,
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobadas
        FROM SolicitudUPEyCE
        WHERE fecha_solicitud >= DATEADD(month, -6, GETDATE())
        GROUP BY FORMAT(fecha_solicitud, 'yyyy-MM')
        ORDER BY mes DESC
      `);

    // Top áreas que más solicitan
    const topAreas = await pool.request()
      .query(`
        SELECT TOP 5
          a.nombre_area,
          COUNT(*) as total_solicitudes,
          SUM(CASE WHEN s.estado = 'aprobado' THEN 1 ELSE 0 END) as aprobadas
        FROM SolicitudUPEyCE s
        INNER JOIN Area a ON s.id_area = a.id_area
        WHERE s.fecha_solicitud >= DATEADD(month, -3, GETDATE())
        GROUP BY a.id_area, a.nombre_area
        ORDER BY total_solicitudes DESC
      `);

    res.status(200).json({
      general: estadisticas.recordset[0],
      mensuales: estadisticasMensuales.recordset,
      topAreas: topAreas.recordset
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
};
const getNextUPEyCENumber = async (req, res) => {
  try {
    const pool = await connectDB();
    const { id_area } = req.params;
    
    // Obtener el área del usuario si no se especifica
    const userArea = id_area || req.user.id_area;
    
    // Buscar el último número UPEyCE usado en esa área
    const result = await pool.request()
      .input('id_area', sql.Int, userArea)
      .query(`
        SELECT TOP 1 numero_UPEyCE_solicitado
        FROM SolicitudUPEyCE
        WHERE id_area = @id_area
        AND numero_UPEyCE_solicitado LIKE '000%'
        ORDER BY 
          CAST(SUBSTRING(numero_UPEyCE_solicitado, 4, LEN(numero_UPEyCE_solicitado)) AS INT) DESC
      `);
    
    let nextNumber = 1;
    
    if (result.recordset.length > 0) {
      const lastNumber = result.recordset[0].numero_UPEyCE_solicitado;
      // Extraer el número después de "000"
      const numericPart = parseInt(lastNumber.substring(3));
      nextNumber = numericPart + 1;
    }
    
    // También verificar en la tabla UPEyCE
    const UPEyCEResult = await pool.request()
      .input('id_area', sql.Int, userArea)
      .query(`
        SELECT TOP 1 numero_UPEyCE
        FROM UPEyCE
        WHERE id_area = @id_area
        AND numero_UPEyCE LIKE '000%'
        ORDER BY 
          CAST(SUBSTRING(numero_UPEyCE, 4, LEN(numero_UPEyCE)) AS INT) DESC
      `);
    
    if (UPEyCEResult.recordset.length > 0) {
      const lastUPEyCE = UPEyCEResult.recordset[0].numero_UPEyCE;
      const numericPart = parseInt(lastUPEyCE.substring(3));
      if (numericPart >= nextNumber) {
        nextNumber = numericPart + 1;
      }
    }
    
    // Formatear el número con el prefijo "000"
    const formattedNumber = `000${nextNumber}`;
    
    res.status(200).json({
      nextNumber: formattedNumber,
      area: userArea
    });
    
  } catch (error) {
    console.error('Error al obtener siguiente número UPEyCE:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSolicitudUPEyCE,
  getAllSolicitudes,
  getSolicitudById,
  aprobarSolicitud,
  getNextUPEyCENumber,
  rechazarSolicitud,
  cancelarSolicitud,
  getSolicitudesPendientes,
  getNotificaciones,
  marcarNotificacionLeida,
  getEstadisticas
};