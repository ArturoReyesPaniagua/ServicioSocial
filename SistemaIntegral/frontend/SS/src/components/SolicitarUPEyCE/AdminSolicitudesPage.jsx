// SistemaIntegral/frontend/SS/src/components/SolicitarUPEyCE/AdminSolicitudesPage.jsx
// Componente optimizado para administración de solicitudes UPEyCE

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('todas');
  const { user } = useAuth();

  // API Base URL - SOLUCIÓN ROBUSTA
  const getApiUrl = () => {
    // Prioridad 1: Variable de entorno
    const envUrl = import.meta.env.VITE_API_URL;
    
    // Prioridad 2: URL hardcodeada como fallback
    const fallbackUrl = 'http://localhost:3001/api';
    
    // Verificaciones
    if (envUrl && envUrl !== 'undefined' && envUrl.trim() !== '') {
      console.log('✅ Usando VITE_API_URL:', envUrl);
      return envUrl;
    }
    
    console.warn('⚠️ VITE_API_URL no disponible, usando fallback:', fallbackUrl);
    console.warn('   Archivo .env:', !!import.meta.env.VITE_API_URL);
    console.warn('   Valor crudo:', JSON.stringify(import.meta.env.VITE_API_URL));
    
    return fallbackUrl;
  };
  
  const API_URL = getApiUrl();

  useEffect(() => {
    if (user?.role === 'admin') {
      // Verificar configuración en desarrollo
      if (import.meta.env.DEV) {
        console.log('🔍 === VERIFICACIÓN DE CONFIGURACIÓN ===');
        console.log('📝 VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('🌐 API_URL final:', API_URL);
        console.log('👤 Usuario:', { username: user.username, role: user.role });
      }
      
      fetchSolicitudes();
      fetchEstadisticas();
    }
  }, [user]);

  useEffect(() => {
    filtrarSolicitudes();
  }, [solicitudes, activeTab, searchTerm, filterPriority]);

  const fetchSolicitudes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('🔍 Cargando solicitudes desde:', `${API_URL}/solicitudes-UPEyCE`);
      console.log('🔍 API_URL actual:', API_URL);

      const response = await axios.get(`${API_URL}/solicitudes-UPEyCE`, config);
      setSolicitudes(response.data);
      console.log('✅ Solicitudes cargadas:', response.data.length);
    } catch (error) {
      console.error('❌ Error al cargar solicitudes:', error);
      console.error('URL utilizada:', `${API_URL}/solicitudes-UPEyCE`);
      toast.error('Error al cargar las solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Calcular estadísticas directamente desde las solicitudes
      const response = await axios.get(`${API_URL}/solicitudes-UPEyCE`, config);
      const todasSolicitudes = response.data;
      
      const stats = {
        total_pendientes: todasSolicitudes.filter(s => s.estado === 'pendiente').length,
        total_aprobadas: todasSolicitudes.filter(s => s.estado === 'aprobado').length,
        total_rechazadas: todasSolicitudes.filter(s => s.estado === 'rechazado').length,
        tiempo_promedio_respuesta: calcularTiempoPromedio(todasSolicitudes)
      };
      
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const calcularTiempoPromedio = (solicitudes) => {
    const procesadas = solicitudes.filter(s => s.fecha_respuesta);
    if (procesadas.length === 0) return 0;
    
    const tiempos = procesadas.map(s => {
      const inicio = new Date(s.fecha_solicitud);
      const fin = new Date(s.fecha_respuesta);
      return (fin - inicio) / (1000 * 60 * 60); // horas
    });
    
    return tiempos.reduce((sum, tiempo) => sum + tiempo, 0) / tiempos.length;
  };

  const filtrarSolicitudes = () => {
    let filtradas = solicitudes;

    // Filtrar por estado (tab activo)
    if (activeTab !== 'todas') {
      filtradas = filtradas.filter(s => s.estado === activeTab);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtradas = filtradas.filter(s => 
        s.justificacion?.toLowerCase().includes(term) ||
        s.usuario_solicitante?.toLowerCase().includes(term) ||
        s.nombre_area?.toLowerCase().includes(term) ||
        s.numero_UPEyCE_asignado?.toLowerCase().includes(term)
      );
    }

    // Filtrar por prioridad
    if (filterPriority !== 'todas') {
      filtradas = filtradas.filter(s => s.prioridad === filterPriority);
    }

    setSolicitudesFiltradas(filtradas);
  };

  const handleAprobar = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalType('aprobar');
    setComentarios('');
    setShowModal(true);
  };

  const handleRechazar = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalType('rechazar');
    setComentarios('');
    setShowModal(true);
  };

  const confirmarAccion = async () => {
    if (modalType === 'rechazar' && (!comentarios || comentarios.trim().length < 5)) {
      toast.error('Debe proporcionar un motivo para el rechazo (mínimo 5 caracteres)');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = modalType === 'aprobar' ? 'aprobar' : 'rechazar';
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('🔍 === PROCESANDO SOLICITUD ===');
      console.log('📝 Solicitud ID:', selectedSolicitud.id_solicitud);
      console.log('📝 Acción:', modalType);
      console.log('📝 URL completa:', `${API_URL}/solicitudes-UPEyCE/${selectedSolicitud.id_solicitud}/${endpoint}`);
      console.log('📝 Comentarios:', comentarios);

      const response = await axios.put(
        `${API_URL}/solicitudes-UPEyCE/${selectedSolicitud.id_solicitud}/${endpoint}`,
        { comentarios_respuesta: comentarios },
        config
      );

      console.log('✅ Respuesta del servidor:', response.data);

      // Verificar si la respuesta indica éxito
      if (response.data.success !== false) {
        toast.success(response.data.message || `Solicitud ${modalType === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`);
        
        setShowModal(false);
        setSelectedSolicitud(null);
        setComentarios('');
        
        // Recargar datos con un pequeño delay para asegurar que el servidor actualizó
        setTimeout(() => {
          console.log('🔄 Recargando datos...');
          fetchSolicitudes();
          fetchEstadisticas();
          
          // REFRESCAR CONTADOR DE NOTIFICACIONES EN MAINLAYOUT
          if (window.refrescarNotificaciones) {
            console.log('🔔 Refrescando notificaciones...');
            window.refrescarNotificaciones();
          }
        }, 500);
      } else {
        throw new Error(response.data.error || 'Error desconocido');
      }

    } catch (error) {
      console.error(`❌ Error al ${modalType} solicitud:`, error);
      console.error('Respuesta completa:', error.response);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          `Error al ${modalType} la solicitud`;
      
      toast.error(errorMessage);
      
      // En caso de error, también intentar recargar para ver el estado actual
      setTimeout(() => {
        fetchSolicitudes();
        // Intentar refrescar notificaciones aunque haya error
        if (window.refrescarNotificaciones) {
          window.refrescarNotificaciones();
        }
      }, 1000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getPriorityBadge = (prioridad) => {
    const classes = prioridad === 'urgente' 
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
        {prioridad === 'urgente' ? '🔴 Urgente' : '🔵 Normal'}
      </span>
    );
  };

  const getStatusBadge = (estado) => {
    const configs = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: '⏳' },
      aprobado: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: '✅' },
      rechazado: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: '❌' },
      cancelado: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: '🚫' }
    };
    
    const config = configs[estado] || configs.pendiente;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.icon} {estado?.charAt(0).toUpperCase() + estado?.slice(1)}
      </span>
    );
  };

  const getDaysColor = (dias) => {
    if (dias >= 7) return 'text-red-600 font-bold';
    if (dias >= 3) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const calcularDiasPendientes = (fechaSolicitud) => {
    return Math.floor((new Date() - new Date(fechaSolicitud)) / (1000 * 60 * 60 * 24));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-red-800">Acceso Denegado</h2>
          <p className="text-red-600">Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Administración de Solicitudes UPEyCE</h1>
        <p className="text-gray-600">
          Gestione las solicitudes de folios UPEyCE pendientes de aprobación.
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid-stats mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm stats-card-animated transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">{estadisticas.total_pendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm stats-card-animated transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-900">{estadisticas.total_aprobadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm stats-card-animated transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✗</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Rechazadas</p>
                <p className="text-2xl font-bold text-red-900">{estadisticas.total_rechazadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm stats-card-animated transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏱️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Math.round(estadisticas.tiempo_promedio_respuesta || 0)}h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs de Estado */}
          <div className="flex space-x-1">
            {[
              { key: 'todas', label: 'Todas', count: solicitudes.length },
              { key: 'pendientes', label: 'Pendientes', count: solicitudes.filter(s => s.estado === 'pendiente').length },
              { key: 'aprobado', label: 'Aprobadas', count: solicitudes.filter(s => s.estado === 'aprobado').length },
              { key: 'rechazado', label: 'Rechazadas', count: solicitudes.filter(s => s.estado === 'rechazado').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'tab-active'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Buscar por justificación, usuario, área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input input-guinda"
            />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="search-input input-guinda"
            >
              <option value="todas">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Solicitudes ({solicitudesFiltradas.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner-guinda w-12 h-12"></div>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay solicitudes</h3>
            <p className="text-gray-500">No se encontraron solicitudes con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {solicitudesFiltradas.map((solicitud) => {
              const diasPendientes = calcularDiasPendientes(solicitud.fecha_solicitud);
              
              return (
                <div key={solicitud.id_solicitud} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header con badges */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          ID: {solicitud.id_solicitud}
                        </span>
                        {getStatusBadge(solicitud.estado)}
                        {getPriorityBadge(solicitud.prioridad)}
                        {solicitud.estado === 'pendiente' && (
                          <span className={`text-xs px-2 py-1 rounded ${getDaysColor(diasPendientes)}`}>
                            {diasPendientes} días
                          </span>
                        )}
                      </div>

                      {/* Información principal */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Solicitante:</p>
                          <p className="text-sm font-medium">{solicitud.usuario_solicitante}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Área:</p>
                          <p className="text-sm font-medium">{solicitud.nombre_area}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de solicitud:</p>
                          <p className="text-sm">{formatDate(solicitud.fecha_solicitud)}</p>
                        </div>
                        {solicitud.numero_UPEyCE_asignado && (
                          <div>
                            <p className="text-sm text-gray-500">UPEyCE asignado:</p>
                            <p className="text-sm font-medium text-green-600">{solicitud.numero_UPEyCE_asignado}</p>
                          </div>
                        )}
                      </div>

                      {/* Justificación */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Justificación:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {solicitud.justificacion}
                        </p>
                      </div>

                      {/* Descripción si existe */}
                      {solicitud.descripcion && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">Descripción:</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {solicitud.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Comentarios de respuesta si existen */}
                      {solicitud.comentarios_respuesta && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">Comentarios del administrador:</p>
                          <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                            {solicitud.comentarios_respuesta}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    {solicitud.estado === 'pendiente' && (
                      <div className="flex space-x-2 mt-4 lg:mt-0 lg:ml-4">
                        <button
                          onClick={() => handleAprobar(solicitud)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(solicitud)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          ✗ Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && selectedSolicitud && (
        <div className="modal-backdrop overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white modal-responsive">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <span className="text-yellow-600 text-xl">
                  {modalType === 'aprobar' ? '✓' : '✗'}
                </span>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {modalType === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 mb-4">
                    {modalType === 'aprobar' 
                      ? '¿Está seguro de que desea aprobar esta solicitud?'
                      : '¿Está seguro de que desea rechazar esta solicitud?'
                    }
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    ID: {selectedSolicitud.id_solicitud} - {selectedSolicitud.usuario_solicitante}
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {modalType === 'aprobar' ? 'Comentarios (opcional):' : 'Motivo del rechazo:'}
                    </label>
                    <textarea
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder={modalType === 'aprobar' 
                        ? 'Comentarios adicionales...'
                        : 'Explique el motivo del rechazo...'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm input-guinda"
                      rows="3"
                      required={modalType === 'rechazar'}
                    />
                    {modalType === 'rechazar' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 5 caracteres requeridos
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarAccion}
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      modalType === 'aprobar'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                  >
                    {modalType === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudesPage;