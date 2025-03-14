const expedienteSchema = require('../schemas/expedienteSchema');
const estadoSchema = require('../schemas/estadoSchema');
const { createTable } = require('../utils/funtiosauth');
const expedienteUtils = require('../utils/expedienteUtils');

// Crear un nuevo expediente
const createExpediente = async (req, res) => {
  try {
    // Asegurar que las tablas existan
    await createTable(estadoSchema);
    await createTable(expedienteSchema);

    // Crear expediente
    const expedienteData = {
      idEstado: req.body.idEstado,
      fechaDeRecepcion: req.body.fechaDeRecepcion,
      noFolioDeSeguimiento: req.body.noFolioDeSeguimiento,
      fechaLimite: req.body.fechaLimite,
      solicitante: req.body.solicitante,
      asunto: req.body.asunto,
      responsable: req.body.responsable,
      fechaDeRespuesta: req.body.fechaDeRespuesta,
      observaciones: req.body.observaciones,
      archivado: req.body.archivado || false,
      NoExpediente: req.body.NoExpediente
    };

    const result = await expedienteUtils.createExpediente(expedienteData);

    res.status(201).json({
      message: 'Expediente creado exitosamente',
      idExpediente: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los expedientes
const getAllExpedientes = async (req, res) => {
  try {
    const expedientes = await expedienteUtils.getAllExpedientes();
    res.status(200).json(expedientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un expediente por ID
const getExpedienteById = async (req, res) => {
  try {
    const expediente = await expedienteUtils.getExpedienteById(req.params.id);
    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    res.status(200).json(expediente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un expediente
const updateExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.idExpediente; // Prevenir actualización del ID

    await expedienteUtils.updateExpediente(id, updateData);
    res.status(200).json({ message: 'Expediente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un expediente
const deleteExpediente = async (req, res) => {
  try {
    await expedienteUtils.deleteExpediente(req.params.id);
    res.status(200).json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar expedientes
const searchExpedientes = async (req, res) => {
  try {
    const { term } = req.params;
    const expedientes = await expedienteUtils.searchExpedientes(term);
    res.status(200).json(expedientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filtrar expedientes por estado
const getExpedientesByEstado = async (req, res) => {
  try {
    const { idEstado } = req.params;
    const expedientes = await expedienteUtils.getExpedientesByEstado(idEstado);
    res.status(200).json(expedientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener expedientes archivados
const getExpedientesArchivados = async (req, res) => {
  try {
    const { archivado } = req.params;
    const archivedValue = archivado === 'true';
    const expedientes = await expedienteUtils.getExpedientesArchivados(archivedValue);
    res.status(200).json(expedientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExpediente,
  getAllExpedientes,
  getExpedienteById,
  updateExpediente,
  deleteExpediente,
  searchExpedientes,
  getExpedientesByEstado,
  getExpedientesArchivados
};