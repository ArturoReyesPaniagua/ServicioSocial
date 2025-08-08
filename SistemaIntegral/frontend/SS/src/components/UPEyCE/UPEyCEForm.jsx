
// SistemaIntegral/frontend/SS/src/components/UPEyCE/UPEyCEForm.jsx

// Este componente maneja la creación y edición de registros UPEyCE


import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UPEyCEForm = ({ UPEyCE, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ID_numero_UPEyCE: '',  // ID de la solicitud asociada al UPEyCE
    id_area: '',  // ID del área asociada al UPEyCE
    descripcion: ''  // Campo  para describir el propósito del UPEyCE
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();

  // Cargar áreas disponibles
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/areas');
        setAreas(response.data);
      } catch (error) {
        console.error('Error al cargar áreas:', error);
      }
    };
    fetchAreas();
  }, []);

  // Inicializar el formulario con datos si se está editando
  useEffect(() => {
    if (UPEyCE) {
      setFormData({
        //id_solicitud: UPEyCE.id_solicitud || '',
        ID_numero_UPEyCE: UPEyCE.ID_numero_UPEyCE,
        id_area: UPEyCE.id_area.toString(),
        descripcion: UPEyCE.descripcion || ''
      });
    } else {
      // Para nuevos registros, preseleccionar el área del usuario si no es admin
      if (user && user.role !== 'admin' && user.id_area) {
        setFormData(prev => ({
          ...prev,
          id_area: user.id_area.toString()
        }));
      }
    }
  }, [UPEyCE, user]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ID_numero_UPEyCE) {
      newErrors.ID_numero_UPEyCE = 'El id UPEyCE es obligatorio';
    }
    
    if (!formData.id_area) {
      newErrors.id_area = 'El área es obligatoria';
    }

    if (!formData.descripcion) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

      
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Preparar datos para envío
      const dataToSend = { ...formData };
      
      await onSave(dataToSend, config);
    } catch (error) {
      console.error('Error guardando registro UPEyCE:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.error || 'Error al guardar el registro UPEyCE'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {UPEyCE ? 'Editar Registro UPEyCE' : 'Nuevo Registro UPEyCE'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.submit && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Número UPEyCE */}
            <div>
              <label htmlFor="numero_UPEyCE" className="block text-sm font-medium text-gray-700 mb-1">
                ID de la solicitud del UPEyCE *
              </label>
              <input
                type="text"
                id="numero_UPEyCE"
                name="numero_UPEyCE"
                value={formData.ID_numero_UPEyCE}
                onChange={handleChange} 
                placeholder="Ej: UPEyCE-2023-001"
                className={`w-full p-2 border ${
                  errors.numero_UPEyCE ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda`}
              />
              {errors.numero_UPEyCE && (
                <p className="mt-1 text-sm text-red-600">{errors.numero_UPEyCE}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Código de control interno para el seguimiento de documentos.
              </p>
            </div>

            {/* Área - Solo visible/editable para administradores */}
            <div>
              <label htmlFor="id_area" className="block text-sm font-medium text-gray-700 mb-1">
                Área *
              </label>
              {user && user.role === 'admin' ? (
                <select
                  id="id_area"
                  name="id_area"
                  value={formData.id_area}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.id_area ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda`}
                >
                  <option value="">Seleccione un área</option>
                  {areas.map(area => (
                    <option key={area.id_area} value={area.id_area}>
                      {area.nombre_area}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="hidden"
                    name="id_area"
                    value={formData.id_area}
                  />
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {areas.find(a => a.id_area === parseInt(formData.id_area))?.nombre_area || "Campo no disponible"}
                    <p className="text-xs text-gray-500 mt-1">
                      El área se asigna automáticamente según su perfil
                    </p>
                  </div>
                </>
              )}
              {errors.id_area && (
                <p className="mt-1 text-sm text-red-600">{errors.id_area}</p>
              )}
            </div>

            {/* Descripción (nuevo campo) */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows="3"
                value={formData.descripcion || ''}
                onChange={handleChange}
                placeholder="Describe el propósito o contenido de este UPEyCE"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Opcional: Añade información adicional sobre este UPEyCE.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-guinda hover:bg-guinda-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-guinda disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {UPEyCE ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  UPEyCE ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UPEyCEForm;