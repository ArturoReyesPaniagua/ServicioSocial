// SistemaIntegral/frontend/SS/src/components/SolicitarUPEyCE/AdminSolicitudesPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [accion, setAccion] = useState(''); // 'aprobar' o 'rechazar'
  const [comentarios, setComentarios] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      if (activeTab === 'pendientes') {
        fetchSolicitudesPendientes();
      } else if (activeTab === 'todas') {
        fetchTodasSolicitudes();
      } else if (activeTab === 'estadisticas') {
        fetchEstadisticas();
      }
    }
  }, [activeTab, user]);

  const fetchSolicitudesPendientes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:3001/api/solicitudes-upeyc-pendientes', config);
      setSolicitudesPendientes(response.data);
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
      toast.error('Error al cargar solicitudes pendientes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodasSolicitudes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:3001/api/solicitudes-upeyc', config);
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error al cargar todas las solicitudes:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:3001/api/estadisticas-solicitudes', config);
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccion = (solicitud, tipoAccion) => {
    setSelectedSolicitud(solicitud);
    setAccion(tipoAccion);
    setComentarios('');
    setModalVisible(true);
  };

  const confirmarAccion = async () => {
    if (!selectedSolicitud || !accion) return;

    if (accion === 'rechazar' && !comentarios.trim()) {
      toast.error('Debe proporcionar un motivo para el rechazo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const url = `http://localhost:3001/api/solicitudes-upeyc/${selectedSolicitud.id_solicitud}/${accion}`;
      const data = { comentarios_respuesta: comentarios };
      
      await axios.put(url, data, config);
      
      toast.success(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`);
      
      setModalVisible(false);
      setSelectedSolicitud(null);
      setAccion('');
      setComentarios('');
      
      // Recargar datos
      if (activeTab === 'pendientes') {
        fetchSolicitudesPendientes();
      } else {
        fetchTodasSolicitudes();
      }
      
    } catch (error) {
      console.error(`Error al ${accion} solicitud:`, error);
      toast.error(`Error al ${accion} la solicitud`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobado': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'baja': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar permisos de administrador
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>No tiene permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gestión de Solicitudes UPEyCE</h1>
        <p className="text-gray-600">
          Administre las solicitudes de UPEyCE de todos los usuarios del sistema.
        </p>
      </div>

      {/* Navegación por tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pendientes'
                  ? 'border-guinda text-guinda'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pendientes
              {solicitudesPendientes.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {solicitudesPendientes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('todas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'todas'
                  ? 'border-guinda text-guinda'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Todas las Solicitudes
            </button>
            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'estadisticas'
                  ? 'border-guinda text-guinda'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Estadísticas
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de cada tab */}
      {activeTab === 'pendientes' && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium">Solicitudes Pendientes de Aprobación</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-guinda"></div>
            </div>
          ) : solicitudesPendientes.length > 0 ? (
            <div className="space-y-4">
              {solicitudesPendientes.map((solicitud) => (
                <div key={solicitud.id_solicitud} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        UPEyCE: {solicitud.numero_UPEyCE_solicitado}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Por: {solicitud.usuario_solicitante}</span>
                        <span>Área: {solicitud.nombre_area}</span>
                        <span>Hace {solicitud.dias_pendiente} días</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadColor(solicitud.prioridad)}`}>
                      {solicitud.prioridad}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Justificación:</p>
                    <p className="text-sm text-gray-600 mt-1">{solicitud.justificacion}</p>
                  </div>

                  {solicitud.descripcion && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">Descripción adicional:</p>
                      <p className="text-sm text-gray-600 mt-1">{solicitud.descripcion}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleAccion(solicitud, 'rechazar')}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleAccion(solicitud, 'aprobar')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Aprobar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes pendientes</h3>
              <p className="mt-1 text-sm text-gray-500">Todas las solicitudes han sido procesadas.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'todas' && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium">Todas las Solicitudes</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-guinda"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UPEyCE Solicitado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Área
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id_solicitud} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {solicitud.numero_UPEyCE_solicitado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitud.usuario_solicitante}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitud.nombre_area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(solicitud.estado)}`}>
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(solicitud.prioridad)}`}>
                          {solicitud.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(solicitud.fecha_solicitud)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'estadisticas' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium">Estadísticas del Sistema</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-guinda"></div>
            </div>
          ) : estadisticas ? (
            <div className="space-y-6">
              {/* Estadísticas generales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Total Solicitudes</h3>
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.general?.total_solicitudes || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Pendientes</h3>
                  <p className="text-3xl font-bold text-yellow-600">{estadisticas.general?.pendientes || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Aprobadas</h3>
                  <p className="text-3xl font-bold text-green-600">{estadisticas.general?.aprobadas || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Tiempo Promedio</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {estadisticas.general?.tiempo_promedio_respuesta_horas 
                      ? `${Math.round(estadisticas.general.tiempo_promedio_respuesta_horas)}h`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Top áreas */}
              {estadisticas.topAreas && estadisticas.topAreas.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Áreas que Más Solicitan (últimos 3 meses)</h3>
                  <div className="space-y-3">
                    {estadisticas.topAreas.map((area, index) => (
                      <div key={area.nombre_area} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {index + 1}. {area.nombre_area}
                        </span>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>Total: {area.total_solicitudes}</span>
                          <span>Aprobadas: {area.aprobadas}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay datos estadísticos disponibles.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación */}
      {modalVisible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {accion === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  UPEyCE: <strong>{selectedSolicitud?.numero_UPEyCE_solicitado}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Solicitante: <strong>{selectedSolicitud?.usuario_solicitante}</strong>
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">
                  {accion === 'aprobar' ? 'Comentarios (opcional)' : 'Motivo del rechazo *'}
                </label>
                <textarea
                  id="comentarios"
                  rows="3"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder={accion === 'aprobar' 
                    ? 'Comentarios adicionales sobre la aprobación...'
                    : 'Explique el motivo del rechazo...'
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setModalVisible(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAccion}
                  className={`px-4 py-2 rounded-md text-white ${
                    accion === 'aprobar'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudesPage;