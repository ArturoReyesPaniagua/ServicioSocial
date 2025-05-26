
// File: ReportePreview.jsx
// SistemaIntegral/frontend/SS/src/components/Reporte/ReportePreview.jsx
// Este componente muestra una vista previa del reporte y permite exportarlo

import { useState } from 'react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import ReporteExport from './ReporteExport';

const ReportePreview = ({ 
  oficios, 
  filters, 
  solicitantes, 
  responsables, 
  areas, 
  onClose 
}) => {
  const [exportVisible, setExportVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState('');
  
  // Funciones para formatear datos
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, 'dd/MM/yyyy', { locale: es }) : '-';
    } catch (error) {
      return '-';
    }
  };
  
  // Obtener nombre de solicitante
  const getSolicitanteName = (id) => {
    const solicitante = solicitantes.find(s => s.id_solicitante === id);
    return solicitante ? solicitante.nombre_solicitante : '-';
  };
  
  // Obtener nombre de responsable
  const getResponsableName = (id) => {
    const responsable = responsables.find(r => r.id_responsable === id);
    return responsable ? responsable.nombre_responsable : '-';
  };
  
  // Obtener nombre de área
  const getAreaName = (id) => {
    const area = areas.find(a => a.id_area === id);
    return area ? area.nombre_area : '-';
  };
  
  // Obtener descripción de los filtros aplicados
  const getFilterDescription = () => {
    const filterDescriptions = [];
    
    if (filters.estado) {
      filterDescriptions.push(`Estado: ${filters.estado}`);
    }
    
    if (filters.fechaRecepcionDesde) {
      filterDescriptions.push(`Fecha Recepción Desde: ${formatDate(filters.fechaRecepcionDesde)}`);
    }
    
    if (filters.fechaRecepcionHasta) {
      filterDescriptions.push(`Fecha Recepción Hasta: ${formatDate(filters.fechaRecepcionHasta)}`);
    }
    
    if (filters.fechaLimiteDesde) {
      filterDescriptions.push(`Fecha Límite Desde: ${formatDate(filters.fechaLimiteDesde)}`);
    }
    
    if (filters.fechaLimiteHasta) {
      filterDescriptions.push(`Fecha Límite Hasta: ${formatDate(filters.fechaLimiteHasta)}`);
    }
    
    if (filters.idSolicitante) {
      const solicitante = solicitantes.find(s => s.id_solicitante === parseInt(filters.idSolicitante));
      if (solicitante) {
        filterDescriptions.push(`Solicitante: ${solicitante.nombre_solicitante}`);
      }
    }
    
    if (filters.idResponsable) {
      const responsable = responsables.find(r => r.id_responsable === parseInt(filters.idResponsable));
      if (responsable) {
        filterDescriptions.push(`Responsable: ${responsable.nombre_responsable}`);
      }
    }
    
    if (filters.idArea) {
      const area = areas.find(a => a.id_area === parseInt(filters.idArea));
      if (area) {
        filterDescriptions.push(`Área: ${area.nombre_area}`);
      }
    }
    
    if (filters.archivado) {
      filterDescriptions.push(`Archivado: ${filters.archivado === 'true' ? 'Sí' : 'No'}`);
    }
    
    return filterDescriptions.length > 0 
      ? filterDescriptions.join(' | ') 
      : 'Sin filtros aplicados';
  };

  // Manejar la exportación del reporte
  const handleExport = (format) => {
    setExportFormat(format);
    setExportVisible(true);
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Vista Previa del Reporte</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row justify-between mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Reporte de Oficios</h3>
              <p className="text-xs text-gray-500">
                Generado: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <p className="text-xs text-gray-500">
                Total de oficios: <span className="font-medium">{oficios.length}</span>
              </p>
            </div>
          </div>
          
          <div className="mt-1">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Filtros aplicados:</span> {getFilterDescription()}
            </p>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {/* Tabla de resultados */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Oficio
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Recepción
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Límite
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Respuesta
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {oficios.map((oficio) => (
                  <tr key={oficio.id_oficio} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {oficio.numero_de_oficio}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        oficio.estado === 'concluido' ? 'bg-green-100 text-green-800' :
                        oficio.estado === 'en proceso' ? 'bg-yellow-100 text-yellow-800' :
                        oficio.estado === 'urgencia' ? 'bg-red-100 text-red-850' :
                        'bg-red-100 text-red-850'
                      }`}>
                        {oficio.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {oficio.nombre_solicitante || getSolicitanteName(oficio.id_solicitante)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {oficio.nombre_responsable || getResponsableName(oficio.id_responsable)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {oficio.nombre_area || getAreaName(oficio.id_area)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(oficio.fecha_recepcion)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(oficio.fecha_limite)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(oficio.fecha_respuesta)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {oficio.archivado ? 'Sí' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-col md:flex-row gap-3 justify-end">
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar como PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar como Excel
            </button>
          </div>
        </div>
      </div>
      
      {/* Componente de exportación */}
      {exportVisible && (
        <ReporteExport
          oficios={oficios}
          format={exportFormat}
          filters={filters}
          solicitantes={solicitantes}
          responsables={responsables}
          areas={areas}
          onClose={() => setExportVisible(false)}
        />
      )}
    </div>
  );
};

export default ReportePreview;