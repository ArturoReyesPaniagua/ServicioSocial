// SistemaIntegral/backend/schemas/viewsSolicitudUPEyCE.js
const viewsSolicitudUPEyCE = `
  IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_SolicitudesPendientes')
    DROP VIEW VW_SolicitudesPendientes;

  CREATE VIEW VW_SolicitudesPendientes AS
  SELECT 
    s.id_solicitud,
    s.justificacion,
    s.descripcion,
    s.prioridad,
    s.fecha_solicitud,
    s.id_area,
    a.nombre_area,
    s.id_usuario_solicita,
    u.username as usuario_solicitante,
    DATEDIFF(day, s.fecha_solicitud, GETDATE()) as dias_pendiente,
    CONCAT('TICKET-', RIGHT('0000' + CAST(s.id_solicitud AS VARCHAR), 4)) as numero_ticket
  FROM SolicitudUPEyCE s
  INNER JOIN Area a ON s.id_area = a.id_area
  INNER JOIN users u ON s.id_usuario_solicita = u.userId
  WHERE s.estado = 'pendiente';

  IF EXISTS (SELECT * FROM sys.views WHERE name = 'VW_HistorialSolicitudes')
    DROP VIEW VW_HistorialSolicitudes;

  CREATE VIEW VW_HistorialSolicitudes AS
  SELECT 
    s.id_solicitud,
    CONCAT('TICKET-', RIGHT('0000' + CAST(s.id_solicitud AS VARCHAR), 4)) as numero_ticket,
    s.justificacion,
    s.descripcion,
    s.prioridad,
    s.fecha_solicitud,
    s.estado,
    s.fecha_respuesta,
    s.comentarios_respuesta,
    s.numero_UPEyCE_asignado,
    s.id_area,
    a.nombre_area,
    s.id_usuario_solicita,
    u.username as usuario_solicitante,
    ur.username as usuario_responde,
    CASE 
      WHEN s.estado = 'pendiente' THEN DATEDIFF(day, s.fecha_solicitud, GETDATE())
      ELSE DATEDIFF(day, s.fecha_solicitud, s.fecha_respuesta)
    END as dias_procesamiento
  FROM SolicitudUPEyCE s
  INNER JOIN Area a ON s.id_area = a.id_area
  INNER JOIN users u ON s.id_usuario_solicita = u.userId
  LEFT JOIN users ur ON s.id_usuario_responde = ur.userId;
`;

module.exports = viewsSolicitudUPEyCE;
