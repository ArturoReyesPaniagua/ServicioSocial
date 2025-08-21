import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminFoliosPage = () => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [folioSugerido, setFolioSugerido] = useState('');
  const [numeroFolioManual, setNumeroFolioManual] = useState('');
  const [comentarios, setComentarios] = useState('');

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

  // Cargar solicitudes pendientes
  const cargarSolicitudesPendientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/solicitudes-folio-pendientes`, config);
      setSolicitudesPendientes(response.data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      toast.error('Error al cargar las solicitudes pendientes');
    } finally {
      setLoading(false);
    }
  };

  // Obtener número de folio sugerido
  const obtenerFolioSugerido = async (idArea) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/sugerir-folio/${idArea}`, config);
      setFolioSugerido(response.data.suggested_number);
      setNumeroFolioManual(response.data.suggested_number);
    } catch (error) {
      console.error('Error obteniendo folio sugerido:', error);
      setFolioSugerido('1');
      setNumeroFolioManual('1');
    }
  };

  // Abrir modal de aprobación
  const abrirModalAprobacion = async (solicitud) => {
    setModalData(solicitud);
    await obtenerFolioSugerido(solicitud.id_area);
  };

  // Aprobar solicitud
  const aprobarSolicitud = async () => {
    if (!numeroFolioManual.trim()) {
      toast.error('El número de folio es requerido');
      return;
    }

    try {
      setProcessingId(modalData.id_solicitud);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const data = {
        numero_folio: numeroFolioManual.trim(),
        comentarios_respuesta: comentarios.trim()
      };

      await axios.put(`${API_URL}/solicitudes-folio/${modalData.id_solicitud}/aprobar`, data, config);
      
      toast.success(`Solicitud aprobada exitosamente. Folio asignado: ${numeroFolioManual}`);
      cerrarModal();
      cargarSolicitudesPendientes();
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      const errorMsg = error.response?.data?.error || 'Error procesando la solicitud';
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  // Rechazar solicitud
  const rechazarSolicitud = async (id, motivo) => {
    if (!motivo || !motivo.trim()) {
      toast.error('El motivo del rechazo es requerido');
      return;
    }

    try {
      setProcessingId(id);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const data = {
        comentarios_respuesta: motivo
      };

      await axios.put(`${API_URL}/solicitudes-folio/${id}/rechazar`, data, config);
      
      toast.success('Solicitud rechazada exitosamente');
      cargarSolicitudesPendientes();
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      const errorMsg = error.response?.data?.error || 'Error procesando la solicitud';
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalData(null);
    setFolioSugerido('');
    setNumeroFolioManual('');
    setComentarios('');
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

  // Obtener color de prioridad
  const getColorPrioridad = (prioridad) => {
    return prioridad === 'urgente' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';
  };

  useEffect(() => {
    cargarSolicitudesPendientes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administración de Folios
        </h1>
        <p className="text-gray-600">
          Revise y apruebe las solicitudes de folios pendientes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
          <h3 className="text-lg font-semibold text-blue-800">Total Pendientes</h3>
          <p className="text-3xl font-bold text-blue-600">{solicitudesPendientes.length}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
          <h3 className="text-lg font-semibold text-yellow-800">Urgentes</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {solicitudesPendientes.filter(s => s.prioridad === 'urgente').length}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
          <h3 className="text-lg font-semibold text-green-800">Procesadas Hoy</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
      </div>

      {/* Lista de solicitudes */}
      {solicitudesPendientes.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay solicitudes pendientes
          </h3>
          <p className="text-gray-600">
            Todas las solicitudes han sido procesadas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudesPendientes.map((solicitud) => (
            <div key={solicitud.id_solicitud} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">
                      Solicitud #{solicitud.id_solicitud}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorPrioridad(solicitud.prioridad)}`}>
                      {solicitud.prioridad.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Área:</span>
                      <p className="text-sm text-gray-900">{solicitud.nombre_area}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Solicitante:</span>
                      <p className="text-sm text-gray-900">{solicitud.usuario_solicita}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Fecha:</span>
                      <p className="text-sm text-gray-900">{formatearFecha(solicitud.fecha_solicitud)}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500">Justificación:</span>
                    <p className="text-sm text-gray-900 mt-1">{solicitud.justificacion}</p>
                  </div>
                  {solicitud.descripcion && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Descripción:</span>
                      <p className="text-sm text-gray-700 mt-1">{solicitud.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => rechazarSolicitud(solicitud.id_solicitud, prompt('Motivo del rechazo:'))}
                  disabled={processingId === solicitud.id_solicitud}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {processingId === solicitud.id_solicitud ? 'Procesando...' : 'Rechazar'}
                </button>
                <button
                  onClick={() => abrirModalAprobacion(solicitud)}
                  disabled={processingId === solicitud.id_solicitud}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de aprobación */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aprobar Solicitud #{modalData.id_solicitud}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Folio
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={numeroFolioManual}
                    onChange={(e) => setNumeroFolioManual(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Número de folio"
                  />
                  <button
                    onClick={() => setNumeroFolioManual(folioSugerido)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                  >
                    Sugerido: {folioSugerido}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Se sugiere el número {folioSugerido} (siguiente disponible)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios (opcional)
                </label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comentarios adicionales..."
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Área:</strong> {modalData.nombre_area}<br/>
                  <strong>Solicitante:</strong> {modalData.usuario_solicita}<br/>
                  <strong>Justificación:</strong> {modalData.justificacion}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={aprobarSolicitud}
                disabled={processingId === modalData.id_solicitud || !numeroFolioManual.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {processingId === modalData.id_solicitud ? 'Aprobando...' : 'Aprobar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoliosPage;