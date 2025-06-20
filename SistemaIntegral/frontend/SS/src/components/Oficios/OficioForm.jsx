
// SistemaIntegral/frontend/SS/src/components/Oficios/OficioForm.jsx
// Este componente es el formulario para crear y editar oficios

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Importar el contexto de autenticación
import './OficioForm.css';

const OficioForm = ({ oficio, estados, onSave, onCancel }) => {
  const { user } = useAuth(); // Obtener información del usuario actual
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
    id_area: '',
    id_UPEyCE: '',  
    oficios_relacionados: '',  
    oficio_respuesta: ''       
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solicitantes, setSolicitantes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [UPEyCEs, setUPEyCEs] = useState([]); // Estado para almacenar UPEyCEs
  const [nuevoSolicitante, setNuevoSolicitante] = useState('');
  const [nuevoResponsable, setNuevoResponsable] = useState('');
  const [mostrarFormSolicitante, setMostrarFormSolicitante] = useState(false);
  const [mostrarFormResponsable, setMostrarFormResponsable] = useState(false);
  
  // Estados para Oficios Relacionados
  const [oficiosRelacionados, setOficiosRelacionados] = useState([]);
  const [selectedRelatedOficios, setSelectedRelatedOficios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Cargar datos relacionados (solicitantes, responsables, áreas, UPEyCEs)
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
        
        // Cargar UPEyCEs
        const token = localStorage.getItem('token');
        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          try {
            const UPEyCEsResponse = await axios.get('http://localhost:3001/api/UPEyCE', config);
            setUPEyCEs(UPEyCEsResponse.data);
          } catch (error) {
            console.error('Error al cargar UPEyCEs:', error);
          }
        }
 
        // preseleccionar su área
        if (user && user.role !== 'admin' && !oficio) {
          setFormData(prev => ({
            ...prev,
            id_area: user.id_area
            
          }));
          console.log('Área preseleccionada:', user.id_area);
          console.log('Nombre del área:', user.nombre_area);
        }
      } catch (error) {
        console.error('Error cargando datos relacionados:', error);
      }
    };
    
    fetchRelatedData();
  }, [oficio, user]);

  // Efecto para cargar oficios disponibles para relacionar
  useEffect(() => {
    const fetchOficios = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get('http://localhost:3001/api/oficios', config);
        // Filtrar el oficio actual si estamos editando
        const availableOficios = oficio 
          ? response.data.filter(o => o.id_oficio !== oficio.id_oficio) 
          : response.data;
        
        setOficiosRelacionados(availableOficios);
        
        // Si estamos editando, inicializar los oficios relacionados seleccionados
        if (oficio && oficio.oficios_relacionados) {
          try {
            // El campo oficios_relacionados esta almacenado como string (IDs separados por comas)
            const relacionadosIds = typeof oficio.oficios_relacionados === 'string'
              ? oficio.oficios_relacionados.split(',').map(id => id.trim())
              : oficio.oficios_relacionados;
            
            // Convertir a números si es necesario
            const idsNumericos = relacionadosIds.map(id => 
              typeof id === 'string' ? parseInt(id, 10) : id
            ).filter(id => !isNaN(id));
            
            // Encontrar los oficios correspondientes
            const oficiosSeleccionados = availableOficios.filter(of => 
              idsNumericos.includes(of.id_oficio)
            );
            // Actualizar el estado con los oficios relacionados seleccionados
            setSelectedRelatedOficios(oficiosSeleccionados);
          } catch (error) {
            console.error('Error al parsear oficios relacionados:', error);
          }
        }
      } catch (error) {
        console.error('Error al cargar oficios:', error);
      }
    };
    // Llamar a la función para cargar oficios
    fetchOficios();
  }, [oficio]);
  // Efecto para formatear datos del oficio al cargar
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
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post('http://localhost:3001/api/solicitantes', {
        nombre_solicitante: nuevoSolicitante
      }, config);
      
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
      // Limpiar el campo de nuevo solicitante
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
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      // Enviar solicitud para crear nuevo responsable
      const response = await axios.post('http://localhost:3001/api/responsables', {
        nombre_responsable: nuevoResponsable
      }, config);
      // Agregar el nuevo responsable a la lista
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
      // Limpiar el campo de nuevo responsable
      setNuevoResponsable('');
      setMostrarFormResponsable(false);
    } catch (error) {
      console.error('Error al crear responsable:', error);
    }
  };

  // Función para manejar la búsqueda de oficios
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    //  Si el término de búsqueda está vacío, limpiar resultados
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Filtrar oficios que coincidan con el término de búsqueda
    // y que no estén ya seleccionados
    const selectedIds = selectedRelatedOficios.map(o => o.id_oficio);
    const results = oficiosRelacionados.filter(oficio => 
      !selectedIds.includes(oficio.id_oficio) && (
        oficio.numero_de_oficio.toString().includes(term) ||
        (oficio.asunto && oficio.asunto.toLowerCase().includes(term))
      )
    );
    
    setSearchResults(results.slice(0, 5)); // Limitar resultados para no sobrecargar la UI
  };

  // Función para agregar un oficio relacionado
  const addRelatedOficio = (oficio) => {
    setSelectedRelatedOficios(prev => [...prev, oficio]);
    setSearchTerm('');
    setSearchResults([]);
    
    // Actualizar el formData con los IDs de los oficios relacionados
    const updatedIds = [...selectedRelatedOficios, oficio].map(o => o.id_oficio).join(',');
    setFormData(prev => ({
      ...prev,
      oficios_relacionados: updatedIds
    }));
  };

  // Función para eliminar un oficio relacionado
  const removeRelatedOficio = (oficioId) => {
    const updated = selectedRelatedOficios.filter(o => o.id_oficio !== oficioId);
    setSelectedRelatedOficios(updated);
    
    // Actualizar el formData con los IDs actualizados
    const updatedIds = updated.map(o => o.id_oficio).join(',');
    setFormData(prev => ({
      ...prev,
      oficios_relacionados: updatedIds
    }));
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    console.log('Validando formulario con datos:', formData);
    // Validar campos obligatorios
    if (!formData.numero_de_oficio) newErrors.numero_de_oficio = 'El número de oficio es obligatorio';
    if (!formData.estado) newErrors.estado = 'Debe seleccionar un estado';
    if (!formData.fecha_recepcion) newErrors.fecha_recepcion = 'La fecha de recepción es obligatoria';
    if (!formData.id_solicitante) newErrors.id_solicitante = 'El solicitante es obligatorio';
    if (!formData.asunto) newErrors.asunto = 'El asunto es obligatorio';
    if (!formData.id_responsable) newErrors.id_responsable = 'El responsable es obligatorio';
    if (!formData.id_area) newErrors.id_area = 'El área es obligatoria';
    
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
      
      // Formatear fechas para el backend
      if (dataToSend.fecha_recepcion) {
        dataToSend.fecha_recepcion = format(new Date(dataToSend.fecha_recepcion), 'yyyy-MM-dd');
      }
      if (dataToSend.fecha_limite) {
        dataToSend.fecha_limite = format(new Date(dataToSend.fecha_limite), 'yyyy-MM-dd');
      }
      if (dataToSend.fecha_respuesta) {
        dataToSend.fecha_respuesta = format(new Date(dataToSend.fecha_respuesta), 'yyyy-MM-dd');
      }
      
      await onSave(dataToSend, config);
    } catch (error) {
      console.error('Error guardando oficio:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.error || 'Error al guardar el oficio'
      }));
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

        {errors.submit && (
          <div className="mx-6 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{errors.submit}</p>
          </div>
        )}

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
                 autoComplete="off"
                placeholder='Ej. 228010040300000L/0639/2025'
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
                      type="submit"
                      onClick={handleCreateSolicitante}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "#800020",
                        transition: "background-color 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#600018"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#800020"}
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
                      type="submit"
                      onClick={handleCreateResponsable}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#800020",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#600018"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#800020"}
                  >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Área - Solo administradores pueden cambiarla */}
            <div className="oficio-form-field">
              <label htmlFor="id_area" className="oficio-form-label">
                Área *
              </label>
              {user && user.role === 'admin' ? (
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
              ) : (
                <>
                  <input
                    type="hidden"
                    name="id_area"
                    value={formData.id_area}
                  />
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {areas.find(a => a.id_area === Number(formData.id_area))?.nombre_area || "Campo no disponible"}
                    <p className="text-xs text-gray-500 mt-1">
                      El área se asigna automáticamente según su perfil
                    </p>
                  </div>
                 </>
              )}
              {errors.id_area && (
                <p className="oficio-form-error">{errors.id_area}</p>
              )}
            </div>

            {/* UPEyCE */}
            <div className="oficio-form-field">
              <label htmlFor="id_UPEyCE" className="oficio-form-label">
                UPEyCE (opcional)
              </label>
              <select
                id="id_UPEyCE"
                name="id_UPEyCE"
                value={formData.id_UPEyCE || ''}
                onChange={handleChange}
                className="oficio-form-select"
              >
                <option value="">Sin UPEyCE asignado</option>
                {UPEyCEs.map(UPEyCE => (
                  <option key={UPEyCE.id_UPEyCE} value={UPEyCE.id_UPEyCE}>
                    {UPEyCE.numero_UPEyCE}
                  </option>
                ))}
              </select>
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
              autocomplete="off"
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

          {/* Sección de Oficios Relacionados */}
          <div className="oficio-form-field mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Oficios Relacionados</h3>
            
            {/* Buscador de oficios */}
            <div className="mb-4">
              <label htmlFor="searchOficios" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar oficios para relacionar
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="searchOficios"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Buscar por número o asunto"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
                />
                
                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                    {searchResults.map(oficio => (
                      <div 
                        key={oficio.id_oficio} 
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex justify-between items-center"
                        onClick={() => addRelatedOficio(oficio)}
                      >
                        <div>
                          <span className="font-medium text-sm">Oficio #{oficio.numero_de_oficio}</span>
                          <p className="text-xs text-gray-600 truncate">{oficio.asunto}</p>
                        </div>
                        <button 
                          type="button"
                          className="oficio-form-cancel-btn" 
                        >
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Lista de oficios seleccionados */}
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Oficios seleccionados:</h4>
              
              {selectedRelatedOficios.length > 0 ? (
                <ul className="space-y-1">
                  {selectedRelatedOficios.map(oficio => (
                    <li 
                      key={oficio.id_oficio}
                      className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                    >
                      <div>
                        <span className="text-sm font-medium">#{oficio.numero_de_oficio}</span>
                        <p className="text-xs text-gray-600 truncate">{oficio.asunto}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRelatedOficio(oficio.id_oficio)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay oficios relacionados seleccionados</p>
              )}
            </div>
            
            <p className="mt-1 text-xs text-gray-500">
              Relacionar oficios permite agrupar documentación que pertenece al mismo tema o trámite.
            </p>
          </div>

          {/* Oficio de Respuesta */}
          <div className="oficio-form-field mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Oficio de Respuesta</h3>
            
            <div className="mb-4">
              <label htmlFor="oficio_respuesta" className="block text-sm font-medium text-gray-700 mb-1">
                Número de oficio de respuesta (si aplica)
              </label>
              <input
                type="text"
                id="oficio_respuesta"
                name="oficio_respuesta"
                value={formData.oficio_respuesta || ''}
                onChange={handleChange}
                placeholder="Ej: 123/2025"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use este campo para indicar el número de oficio que da respuesta al presente.
              </p>
            </div>
            
            {/* Estado de respuesta */}
            {formData.estado === 'concluido' && !formData.oficio_respuesta && (
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm rounded">
                <p className="font-medium">Recomendación:</p>
                <p>Este oficio está marcado como concluido. Considere agregar el número de  acuse para mejor seguimiento.</p>
              </div>
            )}
          </div>

          {/* Separador visual */}
          <hr className="my-6 border-gray-200" />

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
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#800020",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#600018"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#800020"}
              >
              {isSubmitting ? (
                <span className="oficio-form-submit-btn">
                  Guardando...
                </span>
              ) : oficio ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OficioForm;