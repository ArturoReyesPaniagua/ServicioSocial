import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SolicitarFolioPage = () => {
  const [activeTab, setActiveTab] = useState('solicitar');
  const [areas, setAreas] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    id_area: '',
    justificacion: '',
    descripcion: '',
    prioridad: 'normal'
  });

  // Configuración de API
  const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const fallbackUrl = 'http://localhost:3001/api';
    
    if (envUrl && envUrl !== 'undefined' && envUrl.trim() !== '') {
      return envUrl;
    }
    
    return fallbackUrl;
  };
  
  const API_URL = getApiUrl();

  // Cargar áreas disponibles
  const cargarAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/areas`, config);
      setAreas(response.data);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      toast.error('Error al cargar las áreas');
    }
  };

  // Cargar mis solicitudes
  const cargarMisSolicitudes = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/solicitudes-folio`, config);
      setMisSolicitudes(response.data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      toast.error('Error al cargar el historial de solicitudes');
    }
  };

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/notificaciones`, config);
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast.error('Error al cargar las notificaciones');
    }
  };

  // Enviar solicitud de folio
  const enviarSolicitud = async () => {
    if (!formData.id_area || !formData.justificacion.trim()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(`${API_URL}/solicitudes-folio`, formData, config);
      
      toast.success('Solicitud enviada exitosamente');
      setFormData({
        id_area: '',
        justificacion: '',
        descripcion: '',
        prioridad: 'normal'
      });
      cargarMisSolicitudes();
      setActiveTab('historial');
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      const errorMsg = error.response?.data?.error || 'Error enviando la solicitud';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar solicitud
  const cancelarSolicitud = async (id) => {
    const motivo = prompt('Motivo de la cancelación (opcional):');
    if (motivo === null) return; // Usuario canceló

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const data = {
        comentarios: motivo
      };

      await axios.put(`${API_URL}/solicitudes-folio/${id}/cancelar`, data, config);
      
      toast.success('Solicitud cancelada exitosamente');
      cargarMisSolicitudes();
    } catch (error) {
      console.error('Error cancelando solicitud:', error);
      const errorMsg = error.response?.data?.error || 'Error cancelando la solicitud';
      toast.error(errorMsg);
    }
  };

  // Marcar notificación como leída
  const marcarComoLeida = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/notificaciones/${id}/leida`, {}, config);
      
      cargarNotificaciones();
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color y texto del estado
  const getEstadoInfo = (estado) => {
    const estados = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', texto: 'Pendiente' },
      aprobado: { color: 'bg-green-100 text-green-800', texto: 'Aprobado' },
      rechazado: { color: 'bg-red-100 text-red-800', texto: 'Rechazado' },
      cancelado: { color: 'bg-gray-100 text-gray-800', texto: 'Cancelado' }
    };
    return estados[estado] || { color: 'bg-gray-100 text-gray-800', texto: estado };
  };

  // Obtener icono de notificación
  const getIconoNotificacion = (tipo) => {
    switch (tipo) {
      case 'solicitud_aprobada':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'solicitud_rechazada':
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  useEffect(() => {
    cargarAreas();
    cargarMisSolicitudes();
    cargarNotificaciones();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Sistema de Folios</h1>
        <p className="text-gray-600">
          Solicite nuevos folios y administre sus solicitudes existentes.
        </p>
      </div>

      {/* Navegación por tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('solicitar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'solicitar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Solicitar Folio
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'historial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mis Solicitudes ({misSolicitudes.length})
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notificaciones'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notificaciones ({notificaciones.filter(n => !n.leida).length})
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'solicitar' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Nueva Solicitud de Folio</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área *
              </label>
              <select
                value={formData.id_area}
                onChange={(e) => setFormData({...formData, id_area: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un área</option>
                {areas.map((area) => (
                  <option key={area.id_area} value={area.id_area}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación *
              </label>
              <textarea
                value={formData.justificacion}
                onChange={(e) => setFormData({...formData, justificacion: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explique por qué necesita este folio..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Describa claramente el motivo de la solicitud del folio
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción adicional (opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={enviarSolicitud}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="space-y-4">
          {misSolicitudes.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes
              </h3>
              <p className="text-gray-600">
                Aún no ha realizado ninguna solicitud de folio
              </p>
            </div>
          ) : (
            misSolicitudes.map((solicitud) => {
              const estadoInfo = getEstadoInfo(solicitud.estado);
              return (
                <div key={solicitud.id_solicitud} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          Solicitud #{solicitud.id_solicitud}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                          {estadoInfo.texto}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatearFecha(solicitud.fecha_solicitud)}
                      </p>
                    </div>
                    {solicitud.numero_folio_asignado && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Folio asignado:</p>
                        <p className="text-lg font-bold text-green-600">
                          {solicitud.numero_folio_asignado}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Área:</span>
                      <p className="text-sm text-gray-900">{solicitud.nombre_area}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Prioridad:</span>
                      <p className="text-sm text-gray-900">{solicitud.prioridad}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500">Justificación:</span>
                    <p className="text-sm text-gray-900 mt-1">{solicitud.justificacion}</p>
                  </div>

                  {solicitud.descripcion && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-500">Descripción:</span>
                      <p className="text-sm text-gray-700 mt-1">{solicitud.descripcion}</p>
                    </div>
                  )}

                  {solicitud.comentarios_respuesta && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-500">Comentarios del administrador:</span>
                      <p className="text-sm text-gray-900 mt-1">{solicitud.comentarios_respuesta}</p>
                    </div>
                  )}

                  {solicitud.estado === 'pendiente' && (
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        onClick={() => cancelarSolicitud(solicitud.id_solicitud)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Cancelar Solicitud
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'notificaciones' && (
        <div className="space-y-4">
          {notificaciones.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600">
                No tiene notificaciones pendientes
              </p>
            </div>
          ) : (
            notificaciones.map((notificacion) => (
              <div
                key={notificacion.id_notificacion}
                className={`p-4 rounded-lg border ${
                  notificacion.leida 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getIconoNotificacion(notificacion.tipo)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notificacion.titulo}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatearFecha(notificacion.fecha_creacion)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notificacion.mensaje}
                    </p>
                    {!notificacion.leida && (
                      <button
                        onClick={() => marcarComoLeida(notificacion.id_notificacion)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SolicitarFolioPage;