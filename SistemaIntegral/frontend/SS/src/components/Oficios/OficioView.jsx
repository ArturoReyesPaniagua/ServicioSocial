// File: OficioView.jsx
// SistemaIntegral/frontend/SS/src/components/Oficios/OficioView.jsx
// Este componente muestra los detalles completos de un oficio específico con navegación entre oficios relacionados

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import PDFManager from './PDFManager';

const OficioView = ({ oficio, onClose, onEdit, onNavigateToOficio }) => {
  const [oficiosRelacionados, setOficiosRelacionados] = useState([]);
  const [UPEyCEInfo, setUPEyCEInfo] = useState(null);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState(false);

  // Cargar información adicional al montar el componente
  useEffect(() => {
    if (oficio) {
      fetchRelatedData();
    }
  }, [oficio]);

  // Función para obtener datos relacionados (UPEyCE y oficios relacionados)
  const fetchRelatedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Obtener información del UPEyCE si existe
      if (oficio.id_UPEyCE) {
        try {
          const UPEyCEResponse = await axios.get(
            `http://localhost:3001/api/UPEyCE/${oficio.id_UPEyCE}`,
            config
          );
          setUPEyCEInfo(UPEyCEResponse.data);
        } catch (error) {
          console.error('Error al cargar información de UPEyCE:', error);
          setUPEyCEInfo(null);
        }
      } else {
        setUPEyCEInfo(null);
      }

      // Obtener información de oficios relacionados
      if (oficio.oficios_relacionados) {
        setIsLoadingRelated(true);
        try {
          // Parsear los IDs de oficios relacionados
          let relacionadosIds = [];
          
          if (typeof oficio.oficios_relacionados === 'string' && oficio.oficios_relacionados.trim()) {
            relacionadosIds = oficio.oficios_relacionados.split(',').map(id => id.trim());
          } else if (Array.isArray(oficio.oficios_relacionados)) {
            relacionadosIds = oficio.oficios_relacionados;
          }

          // Convertir a números y filtrar IDs válidos
          const idsNumericos = relacionadosIds
            .map(id => parseInt(id, 10))
            .filter(id => !isNaN(id) && id !== oficio.id_oficio);

          if (idsNumericos.length > 0) {
            // Obtener todos los oficios para filtrar los relacionados
            const oficiosResponse = await axios.get('http://localhost:3001/api/oficios', config);
            
            // Filtrar solo los oficios relacionados
            const relacionados = oficiosResponse.data.filter(of => 
              idsNumericos.includes(of.id_oficio)
            );
            
            setOficiosRelacionados(relacionados);
          } else {
            setOficiosRelacionados([]);
          }
        } catch (error) {
          console.error('Error al cargar oficios relacionados:', error);
          setOficiosRelacionados([]);
        } finally {
          setIsLoadingRelated(false);
        }
      } else {
        setOficiosRelacionados([]);
        setIsLoadingRelated(false);
      }
    } catch (error) {
      console.error('Error al cargar datos relacionados:', error);
    }
  };

  // Función auxiliar para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para determinar el color de estado
  const getEstadoColor = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en proceso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'urgencia':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Verificar si hay fecha límite vencida
  const isOverdue = () => {
    if (!oficio.fecha_limite) return false;
    const limitDate = new Date(oficio.fecha_limite);
    const today = new Date();
    return limitDate < today;
  };

  // Función para manejar la navegación a un oficio relacionado
  const handleOficioRelacionadoClick = async (oficioRelacionado) => {
    if (!onNavigateToOficio) {
      console.warn('La función onNavigateToOficio no está disponible');
      return;
    }

    setLoadingNavigation(true);
    try {
      await onNavigateToOficio(oficioRelacionado);
    } catch (error) {
      console.error('Error al navegar al oficio relacionado:', error);
    } finally {
      setLoadingNavigation(false);
    }
  };

  return (
    // Modal para mostrar los detalles del oficio
    <div className="fixed top-[150px] left-0 right-0 bottom-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-1 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header del modal */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Detalles del Oficio</h2>
              <p className="text-sm text-gray-500 mt-1">
                 Creado: {formatDate(oficio.fecha_recepcion)}
              </p>

            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              aria-label="Cerrar vista de oficio"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Información principal del oficio */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna izquierda */}
              <div className="space-y-6">
                {/* Número de Oficio - Destacado */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">Número de Oficio:</span>
                  <p className="text-xl font-bold text-blue-900 mt-1">{oficio.numero_de_oficio}</p>
                </div>
                
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Área del oficio:</span>
                    <p className="text-base font-medium">{oficio.nombre_area || 'No especificada'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estado:</span>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(oficio.estado)}`}>
                        {oficio.estado || 'Sin estado'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha de Recepción:</span>
                    <p className="text-base">{formatDate(oficio.fecha_recepcion)}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha Límite:</span>
                    <p className={`text-base ${isOverdue() && (oficio.estado === 'en proceso' || oficio.estado === 'urgencia') ? 'text-red-600 font-semibold' : ''}`}>
                      {formatDate(oficio.fecha_limite)}
                      {isOverdue() && (oficio.estado === 'en proceso' || oficio.estado === 'urgencia') && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          VENCIDA
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Personas involucradas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Solicitante:</span>
                    <p className="text-base font-medium">{oficio.nombre_solicitante || 'No especificado'}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Responsable:</span>
                    <p className="text-base font-medium">{oficio.nombre_responsable || 'No asignado'}</p>
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-6">
                {/* Fecha de respuesta y archivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha de Respuesta:</span>
                    <p className="text-base">{formatDate(oficio.fecha_respuesta)}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Estado de Archivo:</span>
                    <p className="text-base mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        oficio.archivado 
                          ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                          : 'bg-green-100 text-green-800 border border-green-300'
                      }`}>
                        {oficio.archivado ? '📁 Archivado' : '📂 Activo'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Expediente (nuevo campo) */}
                {oficio.expediente && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Expediente:</span>
                    <p className="text-base font-medium">{oficio.expediente}</p>
                  </div>
                )}

                {/* Información de UPEyCE */}
                {UPEyCEInfo ? (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <span className="text-sm font-medium text-purple-700">UPEyCE Asociado:</span>
                    <p className="text-base font-bold text-purple-900 mt-1">
                      {UPEyCEInfo.numero_UPEyCE}
                    </p>
                    {UPEyCEInfo.descripcion && (
                      <p className="text-sm text-purple-700 mt-2">{UPEyCEInfo.descripcion}</p>
                    )}
                    <p className="text-xs text-purple-600 mt-1">
                      Creado: {formatDate(UPEyCEInfo.fecha_creacion)}
                    </p>
                  </div>
                ) : oficio.id_UPEyCE ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-500">UPEyCE:</span>
                    <p className="text-sm text-gray-600">ID: {oficio.id_UPEyCE} (Información no disponible)</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-500">UPEyCE:</span>
                    <p className="text-sm text-gray-600">Sin UPEyCE asignado</p>
                  </div>
                )}

                {/* Oficio de Respuesta */}
                {oficio.oficio_respuesta && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-700">Oficio de Respuesta:</span>
                    <p className="text-base font-medium text-blue-900 mt-1">
                      {oficio.oficio_respuesta}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Asunto - Ancho completo */}
            <div className="mt-6">
              <span className="text-sm font-medium text-gray-500">Asunto:</span>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-base leading-relaxed">{oficio.asunto || 'Sin asunto especificado'}</p>
              </div>
            </div>

            {/* Observaciones - Ancho completo */}
            <div className="mt-6">
              <span className="text-sm font-medium text-gray-500">Observaciones:</span>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {oficio.observaciones || 'Sin observaciones registradas.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Oficios Relacionados */}
          {(oficiosRelacionados.length > 0 || isLoadingRelated || oficio.oficios_relacionados) && (
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Oficios Relacionados
                {oficiosRelacionados.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {oficiosRelacionados.length}
                  </span>
                )}
              </h3>
              
              {isLoadingRelated ? (
                <div className="flex justify-center items-center py-8 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Cargando oficios relacionados...</span>
                </div>
              ) : oficiosRelacionados.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {oficiosRelacionados.map((oficioRel) => (
                      <button
                        key={oficioRel.id_oficio}
                        onClick={() => handleOficioRelacionadoClick(oficioRel)}
                        disabled={loadingNavigation}
                        className="text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Número de oficio */}
                            <p className="font-bold text-blue-700 group-hover:text-blue-800 text-lg mb-2">
                              #{oficioRel.numero_de_oficio}
                            </p>
                            
                            {/* Estado */}
                            <div className="mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(oficioRel.estado)}`}>
                                {oficioRel.estado || 'Sin estado'}
                              </span>
                            </div>
                            
                            {/* Asunto */}
                            {oficioRel.asunto && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2" title={oficioRel.asunto}>
                                {oficioRel.asunto.length > 60 
                                  ? oficioRel.asunto.substring(0, 60) + '...' 
                                  : oficioRel.asunto
                                }
                              </p>
                            )}
                            
                            {/* Fecha */}
                            <p className="text-xs text-gray-400">
                              📅 {formatDate(oficioRel.fecha_recepcion)}
                            </p>
                            
                            {/* Solicitante */}
                            {oficioRel.nombre_solicitante && (
                              <p className="text-xs text-gray-500 mt-1">
                                👤 {oficioRel.nombre_solicitante}
                              </p>
                            )}
                          </div>
                          
                          {/* Icono de navegación */}
                          <div className="ml-3 flex-shrink-0">
                            {loadingNavigation ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      💡 Haga clic en cualquier oficio para ver sus detalles completos
                    </p>
                  </div>
                </div>
              ) : oficio.oficios_relacionados ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Este oficio tiene oficios relacionados configurados, pero no se pudieron cargar en este momento.
                  </p>
                  <p className="text-yellow-700 text-xs mt-1">
                    IDs configurados: {oficio.oficios_relacionados}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">📄 Este oficio no tiene oficios relacionados</p>
                </div>
              )}
            </div>
          )}

          {/* Gestor de PDFs del oficio */}
          <div className="border-t border-gray-200 pt-6">
            <PDFManager oficioId={oficio.id_oficio} />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end mt-8 space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-sm transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
            <button
              onClick={onEdit}
              className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-sm transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Oficio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OficioView;