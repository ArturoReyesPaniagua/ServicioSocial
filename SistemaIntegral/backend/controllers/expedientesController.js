const expedientesSchema = require('../schemas/expedientesSchema');
const { createTable } = require('../utils/funtiosauth');
const expedientesUtils = require('../utils/expedientesUtils');

// Crear un nuevo expediente
const createExpediente = async (req, res) => {
  try {
    // Asegurar que las tablas existan
    await createTable(expedientesSchema.expedientesMaestro);
    await createTable(expedientesSchema.expedienteDetalle);

    // Crear expediente maestro
    const maestroResult = await expedientesUtils.createExpedienteMaestro({
      noDeExpediente: req.body.noDeExpediente
    });

    // Crear detalle del expediente
    const detalleData = {
      idExpediente: maestroResult.insertId,
      status: req.body.status,
      estado: req.body.estado,
      fechaDeRecepcion: req.body.fechaDeRecepcion,
      folioDeSeguimiento: req.body.folioDeSeguimiento,
      fechaLimite: req.body.fechaLimite,
      solicitante: req.body.solicitante,
      asunto: req.body.asunto,
      responsableAsignado: req.body.responsableAsignado,
      fechaDeRespuesta: req.body.fechaDeRespuesta,
      noDeFolioDeRespuesta: req.body.noDeFolioDeRespuesta,
      observaciones: req.body.observaciones,
      rutaArchivoPDF: req.body.rutaArchivoPDF
    };

    await expedientesUtils.createExpedienteDetalle(detalleData);

    res.status(201).json({
      message: 'Expediente creado exitosamente',
      idExpediente: maestroResult.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los expedientes
const getAllExpedientes = async (req, res) => {
  try {
    const expedientes = await expedientesUtils.getAllExpedientes();
    res.status(200).json(expedientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un expediente por ID
const getExpedienteById = async (req, res) => {
  try {
    const expediente = await expedientesUtils.getExpedienteById(req.params.id);
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
    const { idDia } = req.params;
    const updateData = { ...req.body };
    delete updateData.idExpediente; // Prevenir actualización del ID

    await expedientesUtils.updateExpedienteDetalle(idDia, updateData);
    res.status(200).json({ message: 'Expediente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un expediente
const deleteExpediente = async (req, res) => {
  try {
    await expedientesUtils.deleteExpediente(req.params.id);
    res.status(200).json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar expedientes
const searchExpedientes = async (req, res) => {
  try {
    const { term } = req.params;
    const expedientes = await expedientesUtils.searchExpedientes(term);
    res.status(200).json(expedientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filtrar expedientes por status
const getExpedientesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const expedientes = await expedientesUtils.getExpedientesByStatus(status);
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
  getExpedientesByStatus
};