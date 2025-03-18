// src/components/Expedientes/ExpedienteForm.jsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ExpedienteForm = ({ expediente, estados, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    idEstado: '',
    fechaDeRecepcion: '',
    noFolioDeSeguimiento: '',
    fechaLimite: '',
    solicitante: '',
    asunto: '',
    responsable: '',
    fechaDeRespuesta: '',
    observaciones: '',
    archivado: false,
    NoExpediente: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar el formulario con datos del expediente si existe
  useEffect(() => {
    if (expediente) {
      // Formatear fechas ISO a formato yyyy-MM-dd para inputs de tipo date
      const formattedExpediente = {
        ...expediente,
        fechaDeRecepcion: expediente.fechaDeRecepcion ? format(new Date(expediente.fechaDeRecepcion), 'yyyy-MM-dd') : '',
        fechaLimite: expediente.fechaLimite ? format(new Date(expediente.fechaLimite), 'yyyy-MM-dd') : '',
        fechaDeRespuesta: expediente.fechaDeRespuesta ? format(new Date(expediente.fechaDeRespuesta), 'yyyy-MM-dd') : '',
      };
      setFormData(formattedExpediente);
    }
  }, [expediente]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.NoExpediente) newErrors.NoExpediente = 'El número de expediente es obligatorio';
    if (!formData.noFolioDeSeguimiento) newErrors.noFolioDeSeguimiento = 'El folio de seguimiento es obligatorio';
    if (!formData.idEstado) newErrors.idEstado = 'Debe seleccionar un estado';
    if (!formData.fechaDeRecepcion) newErrors.fechaDeRecepcion = 'La fecha de recepción es obligatoria';
    if (!formData.solicitante) newErrors.solicitante = 'El solicitante es obligatorio';
    if (!formData.asunto) newErrors.asunto = 'El asunto es obligatorio';
    if (!formData.responsable) newErrors.responsable = 'El responsable es obligatorio';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      // onSave manejará la redirección/cierre del modal
    } catch (error) {
      console.error('Error guardando expediente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {expediente ? 'Editar Expediente' : 'Nuevo Expediente'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* No. Expediente */}
              <div>
                <label htmlFor="NoExpediente" className="block text-sm font-medium text-gray-700">
                  No. Expediente *
                </label>
                <input
                  type="text"
                  id="NoExpediente"
                  name="NoExpediente"
                  value={formData.NoExpediente}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${
                    errors.NoExpediente ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.NoExpediente && (
                  <p className="mt-1 text-sm text-red-600">{errors.NoExpediente}</p>
                )}
              </div>

              {/* Folio de Seguimiento */}
              <div>
                <label htmlFor="noFolioDeSeguimiento" className="block text-sm font-medium text-gray-700">
                  Folio de Seguimiento *
                </label>
                <input
                  type="text"
                  id="noFolioDeSeguimiento"
                  name="noFolioDeSeguimiento"
                  value={formData.noFolioDeSeguimiento}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                    errors.noFolioDeSeguimiento ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.noFolioDeSeguimiento && (
                  <p className="mt-1 text-sm text-red-600">{errors.noFolioDeSeguimiento}</p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label htmlFor="idEstado" className="block text-sm font-medium text-gray-700">
                  Estado *
                </label>
                <select
                  id="idEstado"
                  name="idEstado"
                  value={formData.idEstado}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                    errors.idEstado ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione un estado</option>
                  {estados.map(estado => (
                    <option key={estado.idEstado} value={estado.idEstado}>
                      {estado.nombreEstado}
                    </option>
                  ))}
                </select>
                {errors.idEstado && (
                  <p className="mt-1 text-sm text-red-600">{errors.idEstado}</p>
                )}
              </div>

              {/* Fecha de Recepción */}
              <div>
                <label htmlFor="fechaDeRecepcion" className="block text-sm font-medium text-gray-700">
                  Fecha de Recepción *
                </label>
                <input
                  type="date"
                  id="fechaDeRecepcion"
                  name="fechaDeRecepcion"
                  value={formData.fechaDeRecepcion}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                    errors.fechaDeRecepcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fechaDeRecepcion && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaDeRecepcion}</p>
                )}
              </div>

              {/* Fecha Límite */}
              <div>
                <label htmlFor="fechaLimite" className="block text-sm font-medium text-gray-700">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  id="fechaLimite"
                  name="fechaLimite"
                  value={formData.fechaLimite}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>

              {/* Solicitante */}
              <div>
                <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700">
                  Solicitante *
                </label>
                <input
                  type="text"
                  id="solicitante"
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                    errors.solicitante ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.solicitante && (
                  <p className="mt-1 text-sm text-red-600">{errors.solicitante}</p>
                )}
              </div>

              {/* Asunto */}
              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-700">
                  Asunto *
                </label>
                <input
                  type="text"
                  id="asunto"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                    errors.asunto ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.asunto && (
                  <p className="mt-1 text-sm text-red-600">{errors.asunto}</p>
                )}
              </div>

              {/* Responsable */}
              <div>
                <label htmlFor="responsable" className="block text-sm font-medium text-gray-700">
                  Responsable *
                </label>
                <input
                  type="text"
                  id="responsable"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                    errors.responsable ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.responsable && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsable}</p>
                )}
              </div>

              {/* Fecha de Respuesta */}
              <div>
                <label htmlFor="fechaDeRespuesta" className="block text-sm font-medium text-gray-700">
                  Fecha de Respuesta
                </label>
                <input
                  type="date"
                  id="fechaDeRespuesta"
                  name="fechaDeRespuesta"
                  value={formData.fechaDeRespuesta}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>
            </div>

            {/* Observaciones - Fila completa */}
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                value={formData.observaciones}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>

            {/* Checkbox para archivado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="archivado"
                name="archivado"
                checked={formData.archivado}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="archivado" className="ml-2 block text-sm text-gray-700">
                Archivar expediente
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting ? 'Guardando...' : expediente ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpedienteForm;