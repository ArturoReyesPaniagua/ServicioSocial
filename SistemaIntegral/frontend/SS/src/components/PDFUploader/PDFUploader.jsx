// File: PDFUploader.jsx
// SistemaIntegral/frontend/SS/src/components/PDFUploader/PDFUploader.jsx


import { useState, useEffect } from 'react';
import axios from 'axios';

function PDFUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfs, setPdfs] = useState([]);

  // Cargar la lista de PDFs al iniciar el componente
  useEffect(() => {
    fetchPDFs();
  }, []);

  // Obtener lista de PDFs
  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/pdfs'); //Cambiar la url si se cambia el backend
      setPdfs(response.data); //Guardar la lista de PDFs en el estado
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener la lista de PDFs:', error);
      setLoading(false);
    }
  };

  // Manejar cambio de archivo
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setMessage('Por favor seleccione un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    
    setLoading(true);
    setMessage('');
    
    try {// esta parte es la que se encarga de subir el archivo al servidor
      await axios.post('http://localhost:3001/api/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
      console.error('Error al subir el archivo:', error); // Mostrar error en consola
      setMessage('Error al subir el archivo: ' + (error.response?.data?.message || error.message)); // Mostrar mensaje de error
    } finally {
      setLoading(false);
    }
  };

  // Manejar visualización de PDF
  const handleViewPDF = (id) => {
    // Abrir el PDF 
    window.open(`http://localhost:3001/api/pdf/${id}`, '_blank'); //permitir abrir el pdf en una nueva pestaña, esto es para que no se cierre la pestaña actual
  };

  return (
    // Componente principal este es un contenedor que contiene el formulario de carga y la lista de PDFs
    // cuenta como un modal que se puede abrir y cerrar
    // y contiene el formulario de carga y la lista de PDFs
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Gestión de PDFs</h3>
      
      {/* Formulario de carga */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar PDF
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
          disabled={loading || !selectedFile}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md
                   disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Subiendo...' : 'Subir PDF'}
        </button>
        
        {message && (
          <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </form>
      
      {/* Lista de PDFs */}
      <div>
        <h4 className="text-md font-medium mb-2">PDFs disponibles</h4>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : pdfs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {pdfs.map((pdf) => (
              <li key={pdf.idPDF} className="py-3 flex justify-between items-center">
                <span>{pdf.nombreArchivo || `Documento #${pdf.idPDF}`}</span>
                <button
                  onClick={() => handleViewPDF(pdf.idPDF)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver PDF
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay PDFs disponibles</p>
        )}
      </div>
    </div>
  );
}

export default PDFUploader;