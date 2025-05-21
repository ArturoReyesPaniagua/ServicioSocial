// UPCYDPage.jsx
// SistemaIntegral/frontend/SS/src/components/UPCYD/UPCYDPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import UPCYDTable from './UPCYDTable';
import UPCYDForm from './UPCYDForm';
import UPCYDView from './UPCYDView';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { useAuth } from '../../context/AuthContext';

const UPCYDPage = () => {
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [currentUPCYD, setCurrentUPCYD] = useState(null);
  const [oficioFormVisible, setOficioFormVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar registros UPCYD al iniciar
  useEffect(() => {
    fetchUPCYDs();
  }, []);

  // Función para obtener los registros UPCYD
  const fetchUPCYDs = async () => {
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
      
      const response = await axios.get('http://localhost:3001/api/upcyd', config);
      setRegistros(response.data);
    } catch (error) {
      console.error('Error al cargar registros UPCYD:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else {
        toast.error('Error al cargar registros UPCYD. Por favor intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear un nuevo registro UPCYD
  const handleCreateUPCYD = async (data) => {
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
      
      const response = await axios.post('http://localhost:3001/api/upcyd', data, config);
      
      toast.success('Registro UPCYD creado exitosamente');
      setFormVisible(false);
      fetchUPCYDs();
      
      return response.data;
    } catch (error) {
      console.error('Error al crear registro UPCYD:', error);
      
      let errorMessage = 'Error al crear registro UPCYD';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función para actualizar un registro UPCYD existente
  const handleUpdateUPCYD = async (data) => {
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
        `http://localhost:3001/api/upcyd/${data.id_UPCYD}`, 
        data, 
        config
      );
      
      toast.success('Registro UPCYD actualizado exitosamente');
      setFormVisible(false);
      fetchUPCYDs();
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar registro UPCYD:', error);
      
      let errorMessage = 'Error al actualizar registro UPCYD';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Función para eliminar un registro UPCYD
  const handleDeleteUPCYD = async () => {
    if (!currentUPCYD) return;
    
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
      
      await axios.delete(`http://localhost:3001/api/upcyd/${currentUPCYD.id_UPCYD}`, config);
      
      toast.success('Registro UPCYD eliminado exitosamente');
      setDeleteVisible(false);
      setCurrentUPCYD(null);
      fetchUPCYDs();
    } catch (error) {
      console.error('Error al eliminar registro UPCYD:', error);
      
      let errorMessage = 'Error al eliminar registro UPCYD';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    }
  };

  // Función para generar un nuevo oficio a partir de un UPCYD
  const handleGenerateOficio = (upcyd) => {
    // Almacenar el UPCYD seleccionado en sessionStorage para usarlo en la página de oficios
    sessionStorage.setItem('selectedUPCYD', JSON.stringify(upcyd));
    
    // Navegar a la página de oficios con un parámetro para indicar que se está creando un nuevo oficio
    navigate('/oficios?action=create&upcyd=' + upcyd.id_UPCYD);
  };

  // Manejadores para editar, ver, eliminar
  const handleEdit = (upcyd) => {
    setCurrentUPCYD(upcyd);
    setFormVisible(true);
  };

  const handleView = (upcyd) => {
    setCurrentUPCYD(upcyd);
    setViewVisible(true);
  };

  const handleDelete = (upcyd) => {
    setCurrentUPCYD(upcyd);
    setDeleteVisible(true);
  };

  // Función para mostrar formulario de creación
  const handleShowCreateForm = () => {
    setCurrentUPCYD(null);
    setFormVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de UPCYD</h1>
        
        <button
          onClick={handleShowCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nuevo Registro UPCYD
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <p className="text-gray-700 mb-2">
          <strong>Sobre UPCYD:</strong> Los registros UPCYD permiten agrupar y gestionar oficios relacionados con una misma temática o proyecto.
        </p>
        <ul className="list-disc ml-5 text-gray-600 text-sm">
          <li>Cada número UPCYD puede tener múltiples oficios asociados</li>
          <li>Los oficios relacionados pueden ser visualizados desde la vista detallada</li>
          <li>Use el botón "Generar Oficio" para crear nuevos oficios asociados a un UPCYD</li>
        </ul>
      </div>

      <UPCYDTable
        data={registros}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onGenerateOficio={handleGenerateOficio}
        isLoading={isLoading}
      />

      {formVisible && (
        <UPCYDForm
          upcyd={currentUPCYD}
          onSave={currentUPCYD ? handleUpdateUPCYD : handleCreateUPCYD}
          onCancel={() => setFormVisible(false)}
        />
      )}

      {viewVisible && currentUPCYD && (
        <UPCYDView
          upcyd={currentUPCYD}
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
          title="Eliminar Registro UPCYD"
          message={`¿Está seguro que desea eliminar el registro UPCYD ${currentUPCYD?.numero_UPCYD}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteUPCYD}
          onCancel={() => setDeleteVisible(false)}
        />
      )}
    </div>
  );
};

export default UPCYDPage;