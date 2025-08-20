// SistemaIntegral/frontend/SS/src/components/Admin/AdminSolicitudesPage.jsx
// Componente para que los administradores gestionen las solicitudes de UPEyCE

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'aprobar' o 'rechazar'
  const [comentarios, setComentarios] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSolicitudesPendientes();
      fetchEstadisticas();
    }
  }, [user]);

  const fetchSolicitudesPendientes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/solicitudes-UPEyCE-pendientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
      toast.error('Error al cargar las solicitudes pendientes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/estadisticas-solicitudes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
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
      
      const response = await axios.put(
        `http://localhost:3001/api/solicitudes-UPEyCE/${selectedSolicitud.id_solicitud}/${endpoint}`,
        { comentarios_respuesta: comentarios },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setShowModal(false);
      setSelectedSolicitud(null);
      setComentarios('');
      
      // Recargar solicitudes y estadísticas
      fetchSolicitudesPendientes();
      fetchEstadisticas();

    } catch (error) {
      console.error(`Error al ${modalType} solicitud:`, error);
      toast.error(error.response?.data?.error || `Error al ${modalType} la solicitud`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
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

  const getDaysColor = (dias) => {
    if (dias >= 7) return 'text-red-600 font-bold';
    if (dias >= 3) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Administración de Solicitudes UPEyCE</h1>
        <p className="text-gray-600">
          Gestione las solicitudes de folios UPEyCE pendientes de aprobación.
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📋</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Solicitudes</p>
                <p className="text-2xl font-bold text-blue-900">
                  {estadisticas.estadisticas_generales?.total_solicitudes || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {estadisticas.estadisticas_generales?.pendientes || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✅</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-900">
                  {estadisticas.estadisticas_generales?.aprobadas || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
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

      {/* Lista de solicitudes pendientes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Solicitudes Pendientes ({solicitudes.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes pendientes</h3>
            <p className="text-gray-500">Todas las solicitudes han sido procesadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario / Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número Sugerido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id_solicitud} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {solicitud.justificacion}
                        </p>
                        {solicitud.descripcion && (
                          <p className="text-sm text-gray-500 truncate">
                            {solicitud.descripcion}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{solicitud.usuario_solicita}</p>
                        <p className="text-gray-500">{solicitud.nombre_area}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(solicitud.prioridad)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{formatDate(solicitud.fecha_solicitud)}</p>
                        <p className={`${getDaysColor(solicitud.dias_pendiente)}`}>
                          {solicitud.dias_pendiente} días pendiente
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {solicitud.numero_sugerido}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAprobar(solicitud)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          ✅ Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(solicitud)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                modalType === 'aprobar' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className="text-2xl">
                  {modalType === 'aprobar' ? '✅' : '❌'}
                </span>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">
                {modalType === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {modalType === 'aprobar' 
                    ? `¿Está seguro de que desea aprobar esta solicitud? Se asignará el número UPEyCE: ${selectedSolicitud.numero_sugerido}`
                    : 'Está a punto de rechazar esta solicitud. Debe proporcionar un motivo.'
                  }
                </p>
                
                {/* Campo de comentarios */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {modalType === 'aprobar' ? 'Comentarios (opcional)' : 'Motivo del rechazo *'}
                  </label>
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-guinda focus:border-guinda"
                    rows="3"
                    placeholder={modalType === 'aprobar' 
                      ? 'Comentarios adicionales...'
                      : 'Explique el motivo del rechazo...'
                    }
                    required={modalType === 'rechazar'}
                  />
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={confirmarAccion}
                    className={`flex-1 px-4 py-2 text-base font-medium text-white rounded-md shadow-sm ${
                      modalType === 'aprobar'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  >
                    {modalType === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedSolicitud(null);
                      setComentarios('');
                    }}
                    className="flex-1 px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
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