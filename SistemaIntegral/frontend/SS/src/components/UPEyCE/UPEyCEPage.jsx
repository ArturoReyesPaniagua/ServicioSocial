
// SistemaIntegral/frontend/SS/src/components/UPEyCE/UPEyCEPage.jsx

// Este componente maneja la página principal de UPEyCE, incluyendo la lista, creación, edición y eliminación de registros UPEyCE

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import UPEyCETable from './UPEyCETable';
import UPEyCEForm from './UPEyCEForm';
import UPEyCEView from './UPEyCEView';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { useAuth } from '../../context/AuthContext';

const UPEyCEPage = () => {
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [currentUPEyCE, setCurrentUPEyCE] = useState(null);
 // const [oficioFormVisible, setOficioFormVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar registros UPEyCE al iniciar
  useEffect(() => {
    fetchUPEyCEs();
  }, []);

  // Función para obtener los registros UPEyCE
  const fetchUPEyCEs = async () => {
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
      
      const response = await axios.get('http://localhost:3001/api/UPEyCE', config);
      setRegistros(response.data);
    } catch (error) {
      console.error('Error al cargar registros UPEyCE:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else {
        toast.error('Error al cargar registros UPEyCE. Por favor intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear un nuevo registro UPEyCE
  const handleCreateUPEyCE = async (data) => {
    try {
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
      
      const response = await axios.post('http://localhost:3001/api/UPEyCE', data, config);
      
      toast.success('Control UPEyCE creado exitosamente');
      setFormVisible(false);
      fetchUPEyCEs();
      
      return response.data;
    } catch (error) {
      console.error('Error al crear registro UPEyCE:', error);
      
      let errorMessage = 'Error al crear registro UPEyCE';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función para actualizar un registro UPEyCE existente
  const handleUpdateUPEyCE = async (data) => {
    try {
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
      
      const response = await axios.put(
        `http://localhost:3001/api/UPEyCE/${data.id_UPEyCE}`, 
        data, 
        config
      );
      
      toast.success('Control UPEyCE actualizado exitosamente');
      setFormVisible(false);
      fetchUPEyCEs();
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar registro UPEyCE:', error);
      
      let errorMessage = 'Error al actualizar registro UPEyCE';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función para eliminar un registro UPEyCE
  const handleDeleteUPEyCE = async () => {
    if (!currentUPEyCE) return;
    
    try {
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
      
      await axios.delete(`http://localhost:3001/api/UPEyCE/${currentUPEyCE.id_UPEyCE}`, config);
      
      toast.success('Control UPEyCE eliminado exitosamente');
      setDeleteVisible(false);
      setCurrentUPEyCE(null);
      fetchUPEyCEs();
    } catch (error) {
      console.error('Error al eliminar registro UPEyCE:', error);
      
      let errorMessage = 'Error al eliminar registro UPEyCE';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    }
  };

  // Función para generar un nuevo oficio a partir de un UPEyCE
  const handleGenerateOficio = (UPEyCE) => {
    // Almacenar el UPEyCE seleccionado en sessionStorage para usarlo en la página de oficios
    sessionStorage.setItem('selectedUPEyCE', JSON.stringify(UPEyCE));
    
    // Navegar a la página de oficios con un parámetro para indicar que se está creando un nuevo oficio
    navigate('/oficios?action=create&UPEyCE=' + UPEyCE.id_UPEyCE);
  };

  // Manejadores para editar, ver, eliminar
  const handleEdit = (UPEyCE) => {
    setCurrentUPEyCE(UPEyCE);
    setFormVisible(true);
  };

  const handleView = (UPEyCE) => {
    setCurrentUPEyCE(UPEyCE);
    setViewVisible(true);
  };

  const handleDelete = (UPEyCE) => {
    setCurrentUPEyCE(UPEyCE);
    setDeleteVisible(true);
  };

  // Función para mostrar formulario de creación
  const handleShowCreateForm = () => {
    setCurrentUPEyCE(null);
    setFormVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Control de documentos UPEyCE</h1>
        
        <button
          onClick={handleShowCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nuevo Control UPEyCE
        </button>
      </div>

  

      <UPEyCETable
        data={registros}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onGenerateOficio={handleGenerateOficio}
        isLoading={isLoading}
      />

      {formVisible && (
        <UPEyCEForm
          UPEyCE={currentUPEyCE}
          onSave={currentUPEyCE ? handleUpdateUPEyCE : handleCreateUPEyCE}
          onCancel={() => setFormVisible(false)}
        />
      )}

      {viewVisible && currentUPEyCE && (
        <UPEyCEView
          UPEyCE={currentUPEyCE}
          onClose={() => setViewVisible(false)}
          onEdit={() => {
            setViewVisible(false);
            setFormVisible(true);
          }}
          onGenerateOficio={handleGenerateOficio}
        />
      )}

      {deleteVisible && (
        <DeleteConfirmation
          title="Eliminar Control UPEyCE"
          message={`¿Está seguro que desea eliminar el control UPEyCE ${currentUPEyCE?.numero_UPEyCE}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteUPEyCE}
          onCancel={() => setDeleteVisible(false)}
        />
      )}
    </div>
  );
};

export default UPEyCEPage;