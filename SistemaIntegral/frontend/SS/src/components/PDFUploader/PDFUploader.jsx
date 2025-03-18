// src/components/PDFUploader/PDFUploader.jsx
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

function PDFUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfs, setPdfs] = useState([]);

  // Cargar la lista de PDFs al montar el componente
  useEffect(() => {
    fetchPDFs();
  }, []);

  // Obtener lista de PDFs
  const fetchPDFs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pdfs');
      setPdfs(response.data);
    } catch (error) {
      console.error('Error al obtener la lista de PDFs:', error);
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
    try {
      await axios.post('http://localhost:3001/api/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage('Archivo subido exitosamente');
      setSelectedFile(null);
      // Recargar la lista de PDFs
      fetchPDFs();
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      setMessage('Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  // Manejar visualización de PDF
  const handleViewPDF = (id) => {
    // Abrir el PDF en una nueva pestaña
    window.open(`http://localhost:3001/api/pdf/${id}`, '_blank');
  };

  return (
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
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-guinda file:text-white
                      hover:file:bg-guinda-dark"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="bg-guinda hover:bg-guinda-dark text-white py-2 px-4 rounded-md
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
        {pdfs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {pdfs.map((pdf) => (
              <li key={pdf.idPDF} className="py-3 flex justify-between items-center">
                <span>Documento #{pdf.idPDF}</span>
                <button
                  onClick={() => handleViewPDF(pdf.idPDF)}
                  className="text-guinda hover:text-guinda-dark"
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