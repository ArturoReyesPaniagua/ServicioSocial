// File: PDFManager.jsx
// SistemaIntegral/frontend/SS/src/components/Oficios/PDFManager.jsx
// Este componente maneja la carga, visualización y eliminación de documentos PDF asociados a un oficio específico

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PDFManager = ({ oficioId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar PDFs asociados al oficio
  useEffect(() => {
    if (oficioId) {
      fetchPDFs();
    }
  }, [oficioId]);

  // Función para obtener los PDFs del oficio
  const fetchPDFs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3001/api/pdfs/oficio/${oficioId}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error al obtener PDFs:', error);
      setMessage('Error al cargar los archivos: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el cambio de archivo
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Función para manejar la subida del archivo
  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage('Por favor seleccione un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('id_oficio', oficioId);

    setIsUploading(true);
    setMessage('');

    try {
      // Subir el archivo al servidor
      const response = await axios.post('http://localhost:3001/api/pdfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Archivo subido exitosamente');
      setSelectedFile(null);
      
      // Limpiar el input de archivo
      if (document.getElementById('pdf-upload')) {
        document.getElementById('pdf-upload').value = '';
      }
      
      // Recargar la lista de PDFs
      await fetchPDFs();
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setMessage('Error al subir el archivo: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Función para manejar la eliminación de archivos
  const handleDeleteFile = async (idPDF) => {
    if (!confirm('¿Está seguro que desea eliminar este archivo?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/pdfs/${idPDF}`);
      setMessage('Archivo eliminado exitosamente');
      // Actualizar la lista de archivos
      fetchPDFs();
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      setMessage('Error al eliminar el archivo: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Función para manejar la visualización del archivo PDF
  const handleViewFile = (idPDF) => {
    window.open(`http://localhost:3001/api/pdfs/${idPDF}`, '_blank');
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos del Oficio</h3>

      {/* Mensaje de información/error */}
      {message && (
        <div 
          className={`mb-4 p-3 rounded ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700 border-l-4 border-red-500' 
              : 'bg-green-100 text-green-700 border-l-4 border-green-500'
          }`}
        >
          {message}
        </div>
      )}

      {/* Formulario para subir archivos */}
      <form onSubmit={handleFileUpload} className="mb-6">
        <div className="mb-4">
          <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Subir nuevo documento PDF
          </label>
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700"
          />
        </div>
        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Subiendo...' : 'Subir Documento'}
        </button>
      </form>

      {/* Lista de archivos */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-2">Documentos Adjuntos</h4>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre del Archivo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Subida
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.idPDF}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {file.nombreArchivo || `Documento #${file.idPDF}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(file.fechaSubida)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => handleViewFile(file.idPDF)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        title="Ver PDF"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.idPDF)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar PDF"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">No hay documentos adjuntos a este oficio.</p>
        )}
      </div>
    </div>
  );
};

export default PDFManager;