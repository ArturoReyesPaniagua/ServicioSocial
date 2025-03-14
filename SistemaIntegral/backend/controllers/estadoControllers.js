const estadoSchema = require('../schemas/estadoSchema');
const { createTable } = require('../utils/funtiosauth');
const estadoUtils = require('../utils/estadoUtils');

// Crear un nuevo estado
const createEstado = async (req, res) => {
  try {
    // Asegurar que la tabla exista
    await createTable(estadoSchema);

    // Crear el estado
    const estadoData = {
      nombreEstado: req.body.nombreEstado
    };

    const result = await estadoUtils.createEstado(estadoData);

    res.status(201).json({
      message: 'Estado creado exitosamente',
      idEstado: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los estados
const getAllEstados = async (req, res) => {
  try {
    const estados = await estadoUtils.getAllEstados();
    res.status(200).json(estados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un estado por ID
const getEstadoById = async (req, res) => {
  try {
    const estado = await estadoUtils.getEstadoById(req.params.id);
    if (!estado) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    res.status(200).json(estado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un estado
const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { nombreEstado: req.body.nombreEstado };

    await estadoUtils.updateEstado(id, updateData);
    res.status(200).json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un estado
const deleteEstado = async (req, res) => {
  try {
    await estadoUtils.deleteEstado(req.params.id);
    res.status(200).json({ message: 'Estado eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEstado,
  getAllEstados,
  getEstadoById,
  updateEstado,
  deleteEstado
};