// File: OficioForm.jsx
// SistemaIntegral/frontend/SS/src/components/Oficios/OficioForm.jsx
// Este componente es el formulario para crear y editar oficios

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import './OficioForm.css';

const OficioForm = ({ oficio, estados, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    estado: 'en proceso',
    numero_de_oficio: '',
    fecha_recepcion: '',
    fecha_limite: '',
    archivado: false,
    fecha_respuesta: '',
    id_solicitante: '',
    asunto: '',
    observaciones: '',
    id_responsable: '',
    id_area: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solicitantes, setSolicitantes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [nuevoSolicitante, setNuevoSolicitante] = useState('');
  const [nuevoResponsable, setNuevoResponsable] = useState('');
  const [mostrarFormSolicitante, setMostrarFormSolicitante] = useState(false);
  const [mostrarFormResponsable, setMostrarFormResponsable] = useState(false);

  // Cargar datos relacionados (solicitantes, responsables, áreas)
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Cargar solicitantes
        const solicitantesResponse = await axios.get('http://localhost:3001/api/solicitantes');
        setSolicitantes(solicitantesResponse.data);
        
        // Cargar responsables
        const responsablesResponse = await axios.get('http://localhost:3001/api/responsables');
        setResponsables(responsablesResponse.data);
        
        // Cargar áreas
        const areasResponse = await axios.get('http://localhost:3001/api/areas');
        setAreas(areasResponse.data);
      } catch (error) {
        console.error('Error cargando datos relacionados:', error);
      }
    };
    
    fetchRelatedData();
  }, []);


  useEffect(() => {
    if (oficio) {
      const formattedOficio = {
        ...oficio,
        fecha_limite:
          oficio.fecha_limite === '' ? null :
          oficio.fecha_limite ? format(new Date(oficio.fecha_limite), 'yyyy-MM-dd') : '',
        fecha_respuesta:
          oficio.fecha_respuesta === '' ? null :
          oficio.fecha_respuesta ? format(new Date(oficio.fecha_respuesta), 'yyyy-MM-dd') : '',
        fecha_recepcion:
          oficio.fecha_recepcion ? format(new Date(oficio.fecha_recepcion), 'yyyy-MM-dd') : '',
      };
      console.log('Formatted Oficio:', formattedOficio);
      setFormData(formattedOficio);
    }
  }, [oficio]);

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

  // Crear nuevo solicitante
  const handleCreateSolicitante = async () => {
    if (!nuevoSolicitante.trim()) {
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3001/api/solicitantes', {
        nombre_solicitante: nuevoSolicitante
      });
      
      const newSolicitante = response.data;
      setSolicitantes(prev => [...prev, { 
        id_solicitante: newSolicitante.id_solicitante, 
        nombre_solicitante: nuevoSolicitante 
      }]);
      
      // Actualizar el formulario con el nuevo solicitante
      setFormData(prev => ({
        ...prev,
        id_solicitante: newSolicitante.id_solicitante
      }));
      
      setNuevoSolicitante('');
      setMostrarFormSolicitante(false);
    } catch (error) {
      console.error('Error al crear solicitante:', error);
    }
  };

  // Crear nuevo responsable
  const handleCreateResponsable = async () => {
    if (!nuevoResponsable.trim()) {
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3001/api/responsables', {
        nombre_responsable: nuevoResponsable
      });
      
      const newResponsable = response.data;
      setResponsables(prev => [...prev, { 
        id_responsable: newResponsable.id_responsable, 
        nombre_responsable: nuevoResponsable 
      }]);
      
      // Actualizar el formulario con el nuevo responsable
      setFormData(prev => ({
        ...prev,
        id_responsable: newResponsable.id_responsable
      }));
      
      setNuevoResponsable('');
      setMostrarFormResponsable(false);
    } catch (error) {
      console.error('Error al crear responsable:', error);
    }
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.numero_de_oficio) newErrors.numero_de_oficio = 'El número de oficio es obligatorio';
    if (!formData.estado) newErrors.estado = 'Debe seleccionar un estado';
    if (!formData.fecha_recepcion) newErrors.fecha_recepcion = 'La fecha de recepción es obligatoria';
    if (!formData.id_solicitante) newErrors.id_solicitante = 'El solicitante es obligatorio';
    if (!formData.asunto) newErrors.asunto = 'El asunto es obligatorio';
    if (!formData.id_responsable) newErrors.id_responsable = 'El responsable es obligatorio';
    if (!formData.id_area) newErrors.id_area = 'El área es obligatoria';
    console.log(formData);
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
      console.error('Error guardando oficio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="oficio-form-modal">
      <div className="oficio-form-container">
        <div className="oficio-form-header">
          <h2 className="oficio-form-title">
            {oficio ? 'Editar Oficio' : 'Nuevo Oficio'}
          </h2>
          <button
            onClick={onCancel}
            className="oficio-form-close-btn"
          >
            <svg className="oficio-form-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="oficio-form">
          <div className="oficio-form-grid">
            {/* No. Oficio */}
            <div className="oficio-form-field">
              <label htmlFor="numero_de_oficio" className="oficio-form-label">
                No. Oficio *
              </label>
              <input
                type="text"
                id="numero_de_oficio"
                name="numero_de_oficio"
                value={formData.numero_de_oficio}
                onChange={handleChange}
                className={`oficio-form-input ${
                  errors.numero_de_oficio ? 'oficio-form-input-error' : ''
                }`}
              />
              {errors.numero_de_oficio && (
                <p className="oficio-form-error">{errors.numero_de_oficio}</p>
              )}
            </div>

            {/* Estado */}
            <div className="oficio-form-field">
              <label htmlFor="estado" className="oficio-form-label">
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={`oficio-form-select ${
                  errors.estado ? 'oficio-form-input-error' : ''
                }`}
              >
                <option value="">Seleccione un estado</option>
                {estados.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
              {errors.estado && (
                <p className="oficio-form-error">{errors.estado}</p>
              )}
            </div>

            {/* Fecha de Recepción */}
            <div className="oficio-form-field">
              <label htmlFor="fecha_recepcion" className="oficio-form-label">
                Fecha de Recepción *
              </label>
              <input
                type="date"
                id="fecha_recepcion"
                name="fecha_recepcion"
                value={formData.fecha_recepcion}
                onChange={handleChange}
                className={`oficio-form-input ${
                  errors.fecha_recepcion ? 'oficio-form-input-error' : ''
                }`}
              />
              {errors.fecha_recepcion && (
                <p className="oficio-form-error">{errors.fecha_recepcion}</p>
              )}
            </div>

            {/* Fecha Límite */}
            <div className="oficio-form-field">
              <label htmlFor="fecha_limite" className="oficio-form-label">
                Fecha Límite
              </label>
              <input
                type="date"
                id="fecha_limite"
                name="fecha_limite"
                value={formData.fecha_limite}
                onChange={handleChange}
                className="oficio-form-input"
              />
            </div>

            {/* Solicitante */}
            <div className="oficio-form-field">
              <label htmlFor="id_solicitante" className="oficio-form-label">
                Solicitante *
              </label>
              <div className="oficio-form-flex">
                <select
                  id="id_solicitante"
                  name="id_solicitante"
                  value={formData.id_solicitante}
                  onChange={handleChange}
                  className={`oficio-form-select ${
                    errors.id_solicitante ? 'oficio-form-input-error' : ''
                  }`}
                >
                  <option value="">Seleccione un solicitante</option>
                  {solicitantes.map(sol => (
                    <option key={sol.id_solicitante} value={sol.id_solicitante}>
                      {sol.nombre_solicitante}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setMostrarFormSolicitante(!mostrarFormSolicitante)}
                  className="oficio-form-add-btn"
                >
                  +
                </button>
              </div>
              {errors.id_solicitante && (
                <p className="oficio-form-error">{errors.id_solicitante}</p>
              )}
              
              {/* Formulario para nuevo solicitante */}
              {mostrarFormSolicitante && (
                <div className="oficio-form-add-container">
                  <div className="oficio-form-flex">
                    <input
                      type="text"
                      value={nuevoSolicitante}
                      onChange={(e) => setNuevoSolicitante(e.target.value)}
                      placeholder="Nombre del nuevo solicitante"
                      className="oficio-form-input"
                    />
                    <button
                      type="button"
                      onClick={handleCreateSolicitante}
                      className="oficio-form-submit-btn oficio-form-add-submit-btn"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Responsable */}
            <div className="oficio-form-field">
              <label htmlFor="id_responsable" className="oficio-form-label">
                Responsable *
              </label>
              <div className="oficio-form-flex">
                <select
                  id="id_responsable"
                  name="id_responsable"
                  value={formData.id_responsable}
                  onChange={handleChange}
                  className={`oficio-form-select ${
                    errors.id_responsable ? 'oficio-form-input-error' : ''
                  }`}
                >
                  <option value="">Seleccione un responsable</option>
                  {responsables.map(resp => (
                    <option key={resp.id_responsable} value={resp.id_responsable}>
                      {resp.nombre_responsable}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setMostrarFormResponsable(!mostrarFormResponsable)}
                  className="oficio-form-add-btn"
                >
                  +
                </button>
              </div>
              {errors.id_responsable && (
                <p className="oficio-form-error">{errors.id_responsable}</p>
              )}
              
              {/* Formulario para nuevo responsable */}
              {mostrarFormResponsable && (
                <div className="oficio-form-add-container">
                  <div className="oficio-form-flex">
                    <input
                      type="text"
                      value={nuevoResponsable}
                      onChange={(e) => setNuevoResponsable(e.target.value)}
                      placeholder="Nombre del nuevo responsable"
                      className="oficio-form-input"
                    />
                    <button
                      type="button"
                      onClick={handleCreateResponsable}
                      className="oficio-form-submit-btn oficio-form-add-submit-btn"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Área */}
            <div className="oficio-form-field">
              <label htmlFor="id_area" className="oficio-form-label">
                Área *
              </label>
              <select
                id="id_area"
                name="id_area"
                value={formData.id_area}
                onChange={handleChange}
                className={`oficio-form-select ${
                  errors.id_area ? 'oficio-form-input-error' : ''
                }`}
              >
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area.id_area} value={area.id_area}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
              {errors.id_area && (
                <p className="oficio-form-error">{errors.id_area}</p>
              )}
            </div>

            {/* Fecha de Respuesta */}
            <div className="oficio-form-field">
              <label htmlFor="fecha_respuesta" className="oficio-form-label">
                Fecha de Respuesta
              </label>
              <input
                type="date"
                id="fecha_respuesta"
                name="fecha_respuesta"
                value={formData.fecha_respuesta}
                onChange={handleChange}
                className="oficio-form-input"
              />
            </div>
          </div>

          {/* Asunto */}
          <div className="oficio-form-field">
            <label htmlFor="asunto" className="oficio-form-label">
              Asunto *
            </label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              className={`oficio-form-input ${
                errors.asunto ? 'oficio-form-input-error' : ''
              }`}
            />
            {errors.asunto && (
              <p className="oficio-form-error">{errors.asunto}</p>
            )}
          </div>

          {/* Observaciones */}
          <div className="oficio-form-field">
            <label htmlFor="observaciones" className="oficio-form-label">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              value={formData.observaciones}
              onChange={handleChange}
              className="oficio-form-textarea"
            />
          </div>

          {/* Checkbox para archivado */}
          <div className="oficio-form-checkbox-container">
            <input
              type="checkbox"
              id="archivado"
              name="archivado"
              checked={formData.archivado}
              onChange={handleChange}
              className="oficio-form-checkbox"
            />
            <label htmlFor="archivado" className="oficio-form-checkbox-label">
              Archivar oficio
            </label>
          </div>

          <div className="oficio-form-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="oficio-form-cancel-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="oficio-form-submit-btn"
            >
              {isSubmitting ? 'Guardando...' : oficio ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OficioForm;