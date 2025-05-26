// SolicitarUPEyCEForm.jsx
// SistemaIntegral/frontend/SS/src/components/SolicitarUPEyCE/SolicitarUPEyCEForm.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const SolicitarUPEyCEForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    numero_UPEyCE_solicitado: '',
    justificacion: '',
    descripcion: '',
    prioridad: 'normal'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);
  const [numberAvailable, setNumberAvailable] = useState(null);
  const { user } = useAuth();

  // Función para verificar disponibilidad del número UPEyCE
  const checkNumberAvailability = async (numero) => {
    if (!numero || numero.length < 3) {
      setNumberAvailable(null);
      return;
    }

    setIsCheckingNumber(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(
        'http://localhost:3001/api/verificar-numero-UPEyCE',
        { numero_UPEyCE: numero },
        config
      );

      setNumberAvailable(response.data.disponible);
      
      if (!response.data.disponible) {
        setErrors(prev => ({
          ...prev,
          numero_UPEyCE_solicitado: response.data.mensaje
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.numero_UPEyCE_solicitado;
          return newErrors;
        });
      }

    } catch (error) {
      console.error('Error verificando número:', error);
      setNumberAvailable(null);
    } finally {
      setIsCheckingNumber(false);
    }
  };

  // Debounce para la verificación del número
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.numero_UPEyCE_solicitado) {
        checkNumberAvailability(formData.numero_UPEyCE_solicitado);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.numero_UPEyCE_solicitado]);

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
    
    if (!formData.numero_UPEyCE_solicitado) {
      newErrors.numero_UPEyCE_solicitado = 'El número de UPEyCE es obligatorio';
    } else if (formData.numero_UPEyCE_solicitado.length < 3) {
      newErrors.numero_UPEyCE_solicitado = 'El número debe tener al menos 3 caracteres';
    } else if (!numberAvailable) {
      newErrors.numero_UPEyCE_solicitado = 'Este número no está disponible';
    }
    
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
      
      const response = await axios.post(
        'http://localhost:3001/api/solicitudes-UPEyCE',
        formData,
        config
      );
      
      toast.success('Solicitud de UPEyCE enviada exitosamente');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Limpiar formulario
      setFormData({
        numero_UPEyCE_solicitado: '',
        justificacion: '',
        descripcion: '',
        prioridad: 'normal'
      });
      setNumberAvailable(null);
      
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
          Su solicitud será revisada por un administrador en la medida de lo posible.
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
        {/* Número UPEyCE Solicitado */}
        <div>
          <label htmlFor="numero_UPEyCE_solicitado" className="block text-sm font-medium text-gray-700 mb-1">
            Número UPEyCE Solicitado *
          </label>
          <div className="relative">
            <input
              type="text"
              id="numero_UPEyCE_solicitado"
              name="numero_UPEyCE_solicitado"
              autoComplete='off'
              value={formData.numero_UPEyCE_solicitado}
              onChange={handleChange}
              placeholder="Recordatorio de que UPEyCE es UPEyCE + 1" 
              className={`w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda ${
                errors.numero_UPEyCE_solicitado ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            
            {/* Indicador de verificación */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isCheckingNumber && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
              )}
              {!isCheckingNumber && numberAvailable === true && (
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!isCheckingNumber && numberAvailable === false && (
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          
          {errors.numero_UPEyCE_solicitado && (
            <p className="mt-1 text-sm text-red-600">{errors.numero_UPEyCE_solicitado}</p>
          )}
          {!errors.numero_UPEyCE_solicitado && numberAvailable === true && (
            <p className="mt-1 text-sm text-green-600">✓ Número disponible</p>
          )}
          
          <p className="mt-1 text-xs text-gray-500">
            Ingrese un identificador único para su folio UPEyCE. 
          </p>
        </div>

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
            <option value="alta">Alta - Importante</option>
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
              Mínimo 10 caracteres. Sea específico sobre el propósito y la necesidad.
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
                  <li>Puede consultar el estado en cualquier momento</li>
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
            disabled={isSubmitting || !numberAvailable}
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