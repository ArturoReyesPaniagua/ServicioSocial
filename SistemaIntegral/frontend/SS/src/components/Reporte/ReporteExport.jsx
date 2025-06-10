
// SistemaIntegral/frontend/SS/src/components/Reporte/ReporteExport.jsx


// Este componente maneja la exportación de reportes en PDF y Excel

import { useState, useEffect } from 'react';
import { format as formatDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf'; // Importar jsPDF para generar PDFs
import autoTable from 'jspdf-autotable'; // Importar autoTable para generar tablas en PDF
import * as XLSX from 'xlsx'; // Importar librerías necesarias para  Excel

const ReporteExport = ({ 
  oficios, 
  format: exportFormat, 
  filters, 
  solicitantes, 
  responsables, 
  areas, 
  onClose 
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  // Generar el reporte en el formato especificado
  useEffect(() => {
    const generateReport = async () => {
      try {
        setIsGenerating(true);
        
        if (exportFormat === 'pdf') {
          generatePDF();
        } else if (exportFormat === 'excel') {
          generateExcel();
        } else {
          throw new Error('Formato de exportación no soportado');
        }
      } catch (error) {
        console.error('Error generando reporte:', error);
        setError(`Error generando reporte: ${error.message}`);
        setIsGenerating(false);
      }
    };
    
    generateReport();
  }, [exportFormat, oficios]);

  // Función para formatear datos
  const formatDateString = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date) 
        ? formatDate(date, 'dd/MM/yyyy', { locale: es })
        : '-';
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

  // Generar reporte en formato PDF
  const generatePDF = () => {
    try {
      // Crear instancia de jsPDF
      const doc = new jsPDF('landscape');
      
      // Título del documento
      doc.setFontSize(18);
      doc.text('Reporte de Oficios', 14, 15);
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 22);
      
      // Filtros aplicados
      let filtersText = 'Filtros aplicados: ';
      if (filters.estado) filtersText += `Estado: ${filters.estado} | `;
      if (filters.fechaRecepcionDesde) filtersText += `Recepción desde: ${formatDateString(filters.fechaRecepcionDesde)} | `;
      if (filters.fechaRecepcionHasta) filtersText += `Recepción hasta: ${formatDateString(filters.fechaRecepcionHasta)} | `;
      if (filters.fechaLimiteDesde) filtersText += `Límite desde: ${formatDateString(filters.fechaLimiteDesde)} | `;
      if (filters.fechaLimiteHasta) filtersText += `Límite hasta: ${formatDateString(filters.fechaLimiteHasta)} | `;
      
      // Truncar texto de filtros si es demasiado largo
      if (filtersText.length > 180) {
        filtersText = filtersText.substring(0, 180) + '...';
      }
      
      doc.text(filtersText, 14, 28);
      
      // Formatear datos para la tabla
      const tableData = oficios.map(oficio => [
        oficio.numero_de_oficio,
        oficio.estado,
        oficio.nombre_solicitante || getSolicitanteName(oficio.id_solicitante),
        oficio.nombre_responsable || getResponsableName(oficio.id_responsable),
        oficio.nombre_area || getAreaName(oficio.id_area),
        formatDateString(oficio.fecha_recepcion),
        formatDateString(oficio.fecha_limite),
        formatDateString(oficio.fecha_respuesta),
        oficio.archivado ? 'Sí' : 'No'
      ]);
      
      // Generar tabla con autoTable
      autoTable(doc, {
        startY: 35,
        head: [['No. Oficio', 'Estado', 'Solicitante', 'Responsable', 'Área', 'Recepción', 'Límite', 'Respuesta', 'Archivado']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [128, 0, 32], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
          8: { cellWidth: 15 }
        }
      });
      
      // Agregar numeración de páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
      
      // Generar nombre de archivo
      const fileName = `Reporte_Oficios_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      
      // Generar blob y URL para descarga
      const pdfBlob = doc.output('blob');
      const downloadUrl = URL.createObjectURL(pdfBlob);
      
      setDownloadUrl(downloadUrl);
      setFileName(fileName);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError(`Error generando PDF: ${error.message}`);
      setIsGenerating(false);
    }
  };

  // Generar reporte en formato Excel
  const generateExcel = () => {
    try {
      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Formatear datos para la hoja de trabajo
      const headerRow = ['No. Oficio', 'Estado', 'Solicitante', 'Responsable', 'Área', 'Asunto', 'Recepción', 'Límite', 'Respuesta', 'Archivado', 'Observaciones'];
      
      const dataRows = oficios.map(oficio => [
        oficio.numero_de_oficio,
        oficio.estado,
        oficio.nombre_solicitante || getSolicitanteName(oficio.id_solicitante),
        oficio.nombre_responsable || getResponsableName(oficio.id_responsable),
        oficio.nombre_area || getAreaName(oficio.id_area),
        oficio.asunto,
        formatDateString(oficio.fecha_recepcion),
        formatDateString(oficio.fecha_limite),
        formatDateString(oficio.fecha_respuesta),
        oficio.archivado ? 'Sí' : 'No',
        oficio.observaciones || ''
      ]);
      
      // Información de filtros
      const filterRows = [
        ['Reporte de Oficios'],
        [`Generado: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
        [''],
        ['Filtros aplicados:']
      ];
      
      // Agregar filas de filtro solo si existen
      if (filters.estado) filterRows.push([`Estado: ${filters.estado}`]);
      if (filters.fechaRecepcionDesde) filterRows.push([`Recepción desde: ${formatDateString(filters.fechaRecepcionDesde)}`]);
      if (filters.fechaRecepcionHasta) filterRows.push([`Recepción hasta: ${formatDateString(filters.fechaRecepcionHasta)}`]);
      if (filters.fechaLimiteDesde) filterRows.push([`Límite desde: ${formatDateString(filters.fechaLimiteDesde)}`]);
      if (filters.fechaLimiteHasta) filterRows.push([`Límite hasta: ${formatDateString(filters.fechaLimiteHasta)}`]);
      
      // Agregar total de oficios
      filterRows.push(['']);
      filterRows.push(['Total oficios:', oficios.length]);
      filterRows.push(['']);
      
      // Combinar todas las filas
      const wsData = [
        ...filterRows,
        headerRow,
        ...dataRows
      ];
      
      // Crear hoja de trabajo
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Establecer anchos de columna
      const wscols = [
        { wch: 15 },  // No. Oficio
        { wch: 15 },  // Estado
        { wch: 20 },  // Solicitante
        { wch: 20 },  // Responsable
        { wch: 20 },  // Área
        { wch: 40 },  // Asunto
        { wch: 15 },  // Recepción
        { wch: 15 },  // Límite
        { wch: 15 },  // Respuesta
        { wch: 10 },  // Archivado
        { wch: 40 }   // Observaciones
      ];
      
      ws['!cols'] = wscols;
      
      // Agregar hoja de trabajo al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
      
      // Generar blob y URL para descarga
      // Usamos writeFile para generar el archivo directamente
      const excelBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      
      // Convertir el binario a ArrayBuffer
      const buffer = new ArrayBuffer(excelBinary.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < excelBinary.length; i++) {
        view[i] = excelBinary.charCodeAt(i) & 0xFF;
      }
      
      // Crear Blob y URL para descarga
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = URL.createObjectURL(blob);
      
      // Generar nombre de archivo con fecha actual
      const today = new Date();
      const dateStr = today.getFullYear() + 
                     ('0' + (today.getMonth() + 1)).slice(-2) + 
                     ('0' + today.getDate()).slice(-2) + '_' +
                     ('0' + today.getHours()).slice(-2) + 
                     ('0' + today.getMinutes()).slice(-2) + 
                     ('0' + today.getSeconds()).slice(-2);
      const fileName = `Reporte_Oficios_${dateStr}.xlsx`;
      
      setDownloadUrl(downloadUrl);
      setFileName(fileName);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generando Excel:', error);
      setError(`Error generando Excel: ${error.message}`);
      setIsGenerating(false);
    }
  };

  // Descargar el archivo generado
  const handleDownload = () => {
    if (!downloadUrl || !fileName) return;
    
    // Crear elemento 'a' para descargar
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      onClose();
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {exportFormat === 'pdf' ? 'Exportar como PDF' : 'Exportar como Excel'}
          </h2>
          
          {isGenerating ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-guinda"></div>
              <p className="mt-3 text-gray-600">
                Generando reporte...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                <p>¡Reporte generado exitosamente!</p>
                <p className="text-sm mt-1">
                  Oficios incluidos: {oficios.length}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-guinda text-white rounded-md shadow-sm hover:bg-guinda-dark flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteExport;