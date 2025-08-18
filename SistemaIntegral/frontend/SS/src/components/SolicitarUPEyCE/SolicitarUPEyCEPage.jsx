// SistemaIntegral/frontend/SS/src/components/SolicitarUPEyCE/SolicitarUPEyCEPage.jsx

// component para manejar solicitudes de UPEyCE y notificaciones
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import SolicitarUPEyCEForm from './SolicitarUPEyCEForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SolicitarUPEyCEPage = () => {
  const [activeTab, setActiveTab] = useState('solicitar');
  const [solicitudes, setSolicitudes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  // Cargar datos al montar el componente
  useEffect(() => {
    if (activeTab === 'historial') {
      fetchSolicitudes();
    } else if (activeTab === 'notificaciones') {
      fetchNotificaciones();
    }
  }, [activeTab]);

  // Función para obtener las solicitudes del usuario
  const fetchSolicitudes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/solicitudes-UPEyCE`, config);

      //const response = await axios.get('http://localhost:3001/api/solicitudes-UPEyCE', config);
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      toast.error('Error al cargar el historial de solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener notificaciones
  const fetchNotificaciones = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/notificaciones`, config);
      
      //const response = await axios.get('http://localhost:3001/api/notificaciones', config);
      setNotificaciones(response.data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificación como leída
  const marcarNotificacionLeida = async (idNotificacion) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.put(`${API_URL}/notificaciones/${idNotificacion}/leida`, {}, config);
      //await axios.put(`http://localhost:3001/api/notificaciones/${idNotificacion}/leida`, {}, config);
      
      // Actualizar la lista local
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id_notificacion === idNotificacion 
            ? { ...notif, leida: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  // Cancelar solicitud
  const cancelarSolicitud = async (idSolicitud) => {
    if (!confirm('¿Está seguro que desea cancelar esta solicitud?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const motivo = prompt('Ingrese el motivo de cancelación (opcional):') || 'Cancelado por el usuario';
      const API_URL = import.meta.env.VITE_API_URL;

      await axios.put(`${API_URL}/solicitudes-UPEyCE/${idSolicitud}/cancelar`, { motivo }, config);

      //await axios.put(`http://localhost:3001/api/solicitudes-UPEyCE/${idSolicitud}/cancelar`, { motivo }, config);
      
      toast.success('Solicitud cancelada exitosamente');
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al cancelar solicitud:', error);
      toast.error('Error al cancelar la solicitud');
    }
  };

  // Manejar éxito al crear solicitud
  const handleSolicitudSuccess = () => {
    setShowForm(false);
    //toast.success('Solicitud enviada exitosamente');
    if (activeTab === 'historial') {
      fetchSolicitudes();
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtener icono del tipo de notificación
  const getNotificationIcon = (tipo) => {
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2"> Solicitudes UPEyCE</h1>
        <p className="text-gray-600">
          Solicite nuevos folios UPEyCE y administre sus solicitudes existentes.
        </p>
      </div>

      {/* Navegación por tabs */ }{/* Se refiere a que hay una interfaz que contiene interfaces por si alguien llega a leer esto*/}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('solicitar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'solicitar'
                  ? 'border-guinda text-guinda'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Solicitar UPEyCE
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'historial'
                  ? 'border-guinda text-guinda'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mis Solicitudes
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notificaciones'
                  ? 'border-guinda text-guinda'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notificaciones
              {notificaciones.filter(n => !n.leida).length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {notificaciones.filter(n => !n.leida).length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de cada tab */}
      {activeTab === 'solicitar' && (
        <div>
          {!showForm ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Solicitar Nuevo UPEyCE</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Solicite un nuevo folio UPEyCE para sus documentos. Complete el formulario con la información requerida.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-guinda hover:bg-guinda-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-guinda"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Solicitud
              </button>
            </div>
          ) : (
            <SolicitarUPEyCEForm
              onSuccess={handleSolicitudSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}

      {activeTab === 'historial' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Historial de Solicitudes</h2>
            <button
              onClick={() => {
                setActiveTab('solicitar');
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-guinda hover:bg-guinda-dark"
            >
              Nueva Solicitud
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-guinda"></div>
            </div>
          ) : solicitudes.length > 0 ? (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id_solicitud} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        UPEyCE: {solicitud.ID_numero_UPEyCE_solicitado}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Solicitado: {formatDate(solicitud.fecha_solicitud)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                      {solicitud.estado === 'pendiente' && (
                        <button
                          onClick={() => cancelarSolicitud(solicitud.id_solicitud)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Prioridad:</p>
                      <p className="text-sm text-gray-600 capitalize">{solicitud.prioridad}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Área:</p>
                      <p className="text-sm text-gray-600">{solicitud.nombre_area}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Justificación:</p>
                    <p className="text-sm text-gray-600 mt-1">{solicitud.justificacion}</p>
                  </div>

                  {solicitud.comentarios_respuesta && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Comentarios de respuesta:</p>
                      <p className="text-sm text-gray-600 mt-1">{solicitud.comentarios_respuesta}</p>
                      {solicitud.fecha_respuesta && (
                        <p className="text-xs text-gray-500 mt-1">
                          Respondido: {formatDate(solicitud.fecha_respuesta)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
              <p className="mt-1 text-sm text-gray-500">Comience creando su primera solicitud de UPEyCE.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notificaciones' && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-medium">Notificaciones</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-guinda"></div>
            </div>
          ) : notificaciones.length > 0 ? (
            <div className="space-y-3">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id_notificacion}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    notificacion.leida 
                      ? 'bg-white border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => !notificacion.leida && marcarNotificacionLeida(notificacion.id_notificacion)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notificacion.tipo)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-medium ${
                          notificacion.leida ? 'text-gray-900' : 'text-gray-900 font-semibold'
                        }`}>
                          {notificacion.titulo}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDate(notificacion.fecha_creacion)}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        notificacion.leida ? 'text-gray-600' : 'text-gray-700'
                      }`}>
                        {notificacion.mensaje}
                      </p>
                      {notificacion.ID_numero_UPEyCE_solicitado && (
                        <p className="text-xs text-gray-500 mt-1">
                          UPEyCE: {notificacion.ID_numero_UPEyCE_solicitado}
                        </p>
                      )}
                    </div>
                    {!notificacion.leida && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-10h5v5h-5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
              <p className="mt-1 text-sm text-gray-500">Las notificaciones aparecerán aquí cuando haya actualizaciones en sus solicitudes.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolicitarUPEyCEPage;