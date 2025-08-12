// src/components/SolicitarUPEyCE/SolicitarUPEyCEForm.jsx
// Formulario actualizado - El usuario ya no puede especificar el número UPEyCE

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const SolicitarUPEyCEForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    justificacion: '',
    descripcion: '',
    prioridad: 'normal'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

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
    
    if (!formData.justificacion) {
      newErrors.justificacion = 'La justificación es obligatoria';
    } else if (formData.justificacion.length < 10) {
      newErrors.justificacion = 'La justificación debe tener al menos 10 caracteres';
    } else if (formData.justificacion.length > 1000) {
      newErrors.justificacion = 'La justificación no puede exceder 1000 caracteres';
    }
    
    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
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
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await axios.post(`${API_URL}/solicitudes-UPEyCE`,formData, config);

      //const response = await axios.post(
        //'http://localhost:3001/api/solicitudes-UPEyCE',
        //formData,
        //config
      //);
      
      toast.success('Solicitud de UPEyCE enviada exitosamente');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Limpiar formulario
      setFormData({
        justificacion: '',
        descripcion: '',
        prioridad: 'normal'
      });
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      
      let errorMessage = 'Error al enviar la solicitud';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitar Nuevo UPEyCE</h2>
        <p className="text-gray-600">
          Complete el formulario para solicitar un nuevo folio UPEyCE. 
          Su solicitud será revisada por un administrador quien asignará el número de folio correspondiente.
        </p>
        
        {user && user.nombre_area && (
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-sm text-blue-700">
              <strong>Área:</strong> {user.nombre_area}
            </p>
          </div>
        )}
      </div>

      {errors.submit && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{errors.submit}</p>
        </div>
      )}

 
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prioridad */}
        <div>
          <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad de la Solicitud *
          </label>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
          >
            <option value="normal">Normal - Prioridad estándar</option>
            <option value="urgente">Urgente - Requiere atención inmediata</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Seleccione la prioridad según la urgencia de su necesidad.
          </p>
        </div>

        {/* Justificación */}
        <div>
          <label htmlFor="justificacion" className="block text-sm font-medium text-gray-700 mb-1">
            Justificación *
          </label>
          <textarea
            id="justificacion"
            name="justificacion"
            rows="4"
            value={formData.justificacion}
            onChange={handleChange}
            placeholder="Explique por qué necesita este UPEyCE, para qué tipo de documentos será utilizado, y la importancia de su aprobación..."
            className={`w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda resize-vertical ${
              errors.justificacion ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.justificacion && (
            <p className="mt-1 text-sm text-red-600">{errors.justificacion}</p>
          )}
          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Sea específico sobre el propósito y la necesidad.
            </p>
            <span className={`text-xs ${
              formData.justificacion.length > 1000 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {formData.justificacion.length}/1000
            </span>
          </div>
        </div>

        {/* Descripción Adicional */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción Adicional (Opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Información adicional que pueda ser útil para la evaluación de su solicitud..."
            className={`w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda resize-vertical ${
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
          )}
          <div className="mt-1 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Contexto adicional o detalles que ayuden en la evaluación.
            </p>
            <span className={`text-xs ${
              formData.descripcion.length > 500 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {formData.descripcion.length}/500
            </span>
          </div>
        </div>

        {/* Información sobre el proceso */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Proceso de Aprobación
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Su solicitud será evaluada por un administrador. Recibirá una notificación con la decisión.</p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Puede consultar el estado en cualquier momento.</li>
                  <li>Si es aprobada, se le asignará automáticamente el siguiente folio disponible.</li>
                  <li>El folio asignado aparecerá en sus notificaciones.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-guinda hover:bg-guinda-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-guinda disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando Solicitud...
              </div>
            ) : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitarUPEyCEForm;