// src/components/Expedientes/ExpedientesPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExpedientesTable from './ExpedientesTable';
import ExpedienteForm from './ExpedienteForm';
import ExpedienteView from './ExpedienteView';
import DeleteConfirmation from '../common/DeleteConfirmation';

const ExpedientesPage = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [currentExpediente, setCurrentExpediente] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'archived', 'estado'
  const [selectedEstado, setSelectedEstado] = useState('');
  
  // Estados disponibles (
  const estadosDisponibles = [
    { value: 'Concluido', label: 'Concluido' },
    { value: 'En proceso', label: 'En proceso' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  // Fetch expedientes al cargar
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar expedientes
        await fetchExpedientes();
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar los datos. Intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función para cargar expedientes según el filtro seleccionado
  const fetchExpedientes = async () => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:3001/api/expedientes';
      
      if (filterType === 'archived') {
        url = 'http://localhost:3001/api/expedientes/archivado/true';
      } else if (filterType === 'active') {
        url = 'http://localhost:3001/api/expedientes/archivado/false';
      } else if (filterType === 'estado' && selectedEstado) {
        url = `http://localhost:3001/api/expedientes/estado/${selectedEstado}`;
      }
      
      const response = await axios.get(url);
      setExpedientes(response.data);
    } catch (error) {
      console.error('Error cargando expedientes:', error);
      toast.error('Error al cargar expedientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar cuando cambien los filtros
  useEffect(() => {
    fetchExpedientes();
  }, [filterType, selectedEstado]);

  // Crear un nuevo expediente
  const handleCreateExpediente = async (expedienteData) => {
    try {
      await axios.post('http://localhost:3001/api/expedientes', expedienteData);
      toast.success('Expediente creado exitosamente');
      setFormVisible(false);
      fetchExpedientes();
    } catch (error) {
      console.error('Error creando expediente:', error);
      toast.error('Error al crear el expediente');
    }
  };

  // Actualizar un expediente existente
  const handleUpdateExpediente = async (expedienteData) => {
    try {
      await axios.put(`http://localhost:3001/api/expedientes/${expedienteData.idExpediente}`, expedienteData);
      toast.success('Expediente actualizado exitosamente');
      setFormVisible(false);
      fetchExpedientes();
    } catch (error) {
      console.error('Error actualizando expediente:', error);
      toast.error('Error al actualizar el expediente');
    }
  };

  // Eliminar un expediente
  const handleDeleteExpediente = async () => {
    if (!currentExpediente) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/expedientes/${currentExpediente.idExpediente}`);
      toast.success('Expediente eliminado exitosamente');
      setDeleteVisible(false);
      setCurrentExpediente(null);
      fetchExpedientes();
    } catch (error) {
      console.error('Error eliminando expediente:', error);
      toast.error('Error al eliminar el expediente');
    }
  };

  // Archivar/Desarchivar expediente
  const handleArchiveExpediente = async (expediente) => {
    try {
      const updatedData = {
        ...expediente,
        archivado: !expediente.archivado
      };
      
      await axios.put(`http://localhost:3001/api/expedientes/${expediente.idExpediente}`, updatedData);
      
      toast.success(expediente.archivado 
        ? 'Expediente desarchivado exitosamente' 
        : 'Expediente archivado exitosamente'
      );
      
      fetchExpedientes();
    } catch (error) {
      console.error('Error cambiando estado de archivo:', error);
      toast.error('Error al cambiar estado de archivo del expediente');
    }
  };

  // Manejadores para editar, ver, eliminar
  const handleEdit = (expediente) => {
    setCurrentExpediente(expediente);
    setFormVisible(true);
  };

  const handleView = (expediente) => {
    setCurrentExpediente(expediente);
    setViewVisible(true);
  };

  const handleDelete = (expediente) => {
    setCurrentExpediente(expediente);
    setDeleteVisible(true);
  };

  // Función para limpiar y mostrar formulario de creación
  const handleShowCreateForm = () => {
    setCurrentExpediente(null);
    setFormVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Expedientes</h1>
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex gap-2">
            <select
              className="p-2 border border-gray-300 rounded"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los expedientes</option>
              <option value="active">Expedientes activos</option>
              <option value="archived">Expedientes archivados</option>
              <option value="estado">Filtrar por estado</option>
            </select>
            
            {filterType === 'estado' && (
              <select
                className="p-2 border border-gray-300 rounded"
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                <option value="">Seleccione un estado</option>
                {estadosDisponibles.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <button
            onClick={handleShowCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Nuevo Expediente
          </button>
        </div>
      </div>

      <ExpedientesTable
        data={expedientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onArchive={handleArchiveExpediente}
        isLoading={isLoading}
      />

      {formVisible && (
        <ExpedienteForm
          expediente={currentExpediente}
          estados={estadosDisponibles} // Ya no necesitamos cargar estados desde la API
          onSave={currentExpediente ? handleUpdateExpediente : handleCreateExpediente}
          onCancel={() => setFormVisible(false)}
        />
      )}

      {viewVisible && currentExpediente && (
        <ExpedienteView
          expediente={currentExpediente}
          onClose={() => setViewVisible(false)}
          onEdit={() => {
            setViewVisible(false);
            setFormVisible(true);
          }}
        />
      )}

      {deleteVisible && (
        <DeleteConfirmation
          title="Eliminar Expediente"
          message={`¿Está seguro que desea eliminar el expediente ${currentExpediente?.NoExpediente}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteExpediente}
          onCancel={() => setDeleteVisible(false)}
        />
      )}
    </div>
  );
};

export default ExpedientesPage;