import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const expedientesService = {
  getAllExpedientes: async () => {
    const response = await axios.get(`${API_URL}/expedientes`);
    return response.data;
  },

  getExpedienteById: async (id) => {
    const response = await axios.get(`${API_URL}/expedientes/${id}`);
    return response.data;
  },

  createExpediente: async (expedienteData) => {
    const response = await axios.post(`${API_URL}/expedientes`, expedienteData);
    return response.data;
  },

  updateExpediente: async (id, expedienteData) => {
    const response = await axios.put(`${API_URL}/expedientes/${id}`, expedienteData);
    return response.data;
  },

  deleteExpediente: async (id) => {
    const response = await axios.delete(`${API_URL}/expedientes/${id}`);
    return response.data;
  },

  searchExpedientes: async (term) => {
    const response = await axios.get(`${API_URL}/expedientes/search/${term}`);
    return response.data;
  },
};

export default expedientesService;