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