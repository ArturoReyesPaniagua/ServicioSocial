// UPEyCEView.jsx
// SistemaIntegral/frontend/SS/src/components/UPEyCE/UPEyCEView.jsx

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';

const UPEyCEView = ({ UPEyCE, onClose, onEdit, onGenerateOficio }) => {
  const [oficiosRelacionados, setOficiosRelacionados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar oficios relacionados con este UPEyCE
  useEffect(() => {
    const fetchRelatedOficios = async () => {
      if (!UPEyCE || !UPEyCE.id_UPEyCE) return;
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Token no encontrado');
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(
          `http://localhost:3001/api/oficios/UPEyCE/${UPEyCE.id_UPEyCE}`, 
          config
        );
        
        setOficiosRelacionados(response.data);
      } catch (error) {
        console.error('Error al cargar oficios relacionados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedOficios();
  }, [UPEyCE]);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Formatear estado de oficio
  const formatEstado = (estado) => {
    if (!estado) return '';
    
    let badgeClass;
    switch (estado) {
      case 'concluido':
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case 'en proceso':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'cancelado':
        badgeClass = 'bg-red-100 text-red-800';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {estado}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Control Interno UPEyCE</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Información del UPEyCE */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Número UPEyCE:</span>
                  <p className="text-base font-semibold">{UPEyCE?.numero_UPEyCE || 'No disponible'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Área:</span>
                  <p className="text-base">{UPEyCE?.nombre_area || 'No disponible'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha de Creación:</span>
                  <p className="text-base">{formatDate(UPEyCE?.fecha_creacion)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Creado por:</span>
                  <p className="text-base">{UPEyCE?.nombre_usuario || 'No disponible'}</p>
                </div>
              </div>
            </div>
            {UPEyCE?.descripcion && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-500">Descripción:</span>
                <p className="text-base mt-1 whitespace-pre-line">{UPEyCE.descripcion}</p>
              </div>
            )}
          </div>

          {/* Sección informativa */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="text-md font-semibold text-blue-800 mb-2">Control de Documentos</h3>
            <p className="text-sm text-blue-700">
              El número UPEyCE es un identificador interno que permite vincular documentos relacionados 
              y facilitar su seguimiento. Cada UPEyCE puede tener asociados varios oficios que comparten 
              un mismo tema o proceso administrativo.
            </p>
          </div>

          {/* Sección para oficios relacionados */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Oficios Asociados</h3>
              <button
                onClick={() => onGenerateOficio && onGenerateOficio(UPEyCE)}
                className="flex items-center text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Asociar Nuevo Oficio
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : oficiosRelacionados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Oficio
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Recepción
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asunto
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Solicitante
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {oficiosRelacionados.map(oficio => (
                      <tr key={oficio.id_oficio} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {oficio.numero_de_oficio}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {formatEstado(oficio.estado)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(oficio.fecha_recepcion)}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">
                          {oficio.asunto}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {oficio.nombre_solicitante}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay oficios asociados a este UPEyCE.</p>
                <p className="text-sm text-gray-400 mt-1">Use el botón "Asociar Nuevo Oficio" para crear uno.</p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit && onEdit(UPEyCE)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-guinda hover:bg-guinda-dark"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPEyCEView;