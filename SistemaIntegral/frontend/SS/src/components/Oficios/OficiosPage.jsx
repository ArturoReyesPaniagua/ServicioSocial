
// SistemaIntegral/frontend/SS/src/components/Oficios/OficiosPage.jsx
// Este componente es la página principal de gestión de oficios
// y permite crear, editar, eliminar y ver detalles de los oficios

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import OficiosTable from './OficiosTable';
import OficioForm from './OficioForm';
import OficioView from './OficioView';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext'; // Importar el contexto de autenticación
//import '../../.env'; //


const OficiosPage = () => {
  const [oficios, setOficios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [currentOficio, setCurrentOficio] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'archived', 'estado'
  const [selectedEstado, setSelectedEstado] = useState('');
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const { user } = useAuth(); // Obtener información del usuario actual
  
  // Estados disponibles
  const estadosDisponibles = [
    { value: 'concluido', label: 'Concluido' },
    { value: 'en proceso', label: 'En proceso' },
    { value: 'urgencia', label: 'urgencia' }
  ];

  // Fetch oficios al cargar
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar oficios
        await fetchOficios();
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar los datos. Intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Función para cargar oficios según el filtro seleccionado
  const fetchOficios = async () => {
    setIsLoading(true);
    try {
      // URL base para cargar oficios
      const API_URL = import.meta.env.VITE_API_URL;
      
      let url = `${API_URL}/oficios`;
      //let url = 'http://localhost:3001/api/oficios';
      
      // Cargar oficios según el filtro seleccionado
      if (filterType === 'archived') {
        url = `${API_URL}/oficios/archivado/true`;
        //url = 'http://localhost:3001/api/oficios/archivado/true';
      } else if (filterType === 'active') {
        url = `${API_URL}/oficios/archivado/false`;
        //url = 'http://localhost:3001/api/oficios/archivado/false';
      } else if (filterType === 'estado' && selectedEstado) {
        url = `${API_URL}/oficios/estado/${selectedEstado}`;
       // url = `http://localhost:3001/api/oficios/estado/${selectedEstado}`;
      }
      
      else if (filterType === 'area' && selectedArea && user.role === "admin") {
        url = `${API_URL}/oficios/area/${selectedArea}`;
        //url = `http://localhost:3001/api/oficios/area/${selectedArea}`;
      }
      
      
      const response = await axios.get(url);
      // Actualizar el estado con los oficios obtenidos
      setOficios(response.data);
    } catch (error) {
      console.error('Error cargando oficios:', error);
      toast.error('Error al cargar oficios');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar oficios por área (solo para admin)
  useEffect(() => {
    fetchAreas();
  }, []);
  
  const fetchAreas = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/areas`);
      //const response = await axios.get('http://localhost:3001/api/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      toast.error('Error al cargar áreas');
    }
  };

  // Filtrar cuando cambien los filtros
  useEffect(() => {
    fetchOficios();
  }, [filterType, selectedEstado, selectedArea]);

  // Función para obtener un oficio por ID
  const getOficioById = async (oficioId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/oficios/${oficioId}`, config); 
      //const response = await axios.get(`http://localhost:3001/api/oficios/${oficioId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error al obtener oficio por ID:', error);
      toast.error('Error al cargar el oficio solicitado');
      return null;
    }
  };

  // Función para navegar a un oficio relacionado
  const handleNavigateToOficio = async (oficioRelacionado) => {
    try {
      // Obtener los datos completos del oficio
      const oficioCompleto = await getOficioById(oficioRelacionado.id_oficio);
      
      if (oficioCompleto) {
        // Cambiar el oficio actual al relacionado
        setCurrentOficio(oficioCompleto);
        // Mantener la vista abierta para mostrar el nuevo oficio
        setViewVisible(true);
      }
    } catch (error) {
      console.error('Error al navegar al oficio relacionado:', error);
      toast.error('Error al cargar el oficio relacionado');
    }
  };

  // Crear un nuevo oficio
  const handleCreateOficio = async (oficioData) => {
    try {
      oficioData.fecha_recepcion = format(new Date(oficioData.fecha_recepcion), 'yyyy-MM-dd');
      oficioData.fecha_limite = oficioData.fecha_limite ? format(new Date(oficioData.fecha_limite), 'yyyy-MM-dd') : null;
      oficioData.fecha_respuesta = oficioData.fecha_respuesta ? format(new Date(oficioData.fecha_respuesta), 'yyyy-MM-dd') : null;
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.post(`${API_URL}/oficios`, oficioData);
      //await axios.post('http://localhost:3001/api/oficios', oficioData);
      toast.success('Oficio creado exitosamente');
      setFormVisible(false);
      fetchOficios();
    } catch (error) {
      console.error('Error creando oficio:', error);
      toast.error('Error al crear el oficio');
    }
  };

  // Actualizar un oficio existente
  const handleUpdateOficio = async (oficioData) => {
    try {
      // Aquí se debe enviar el ID del oficio a actualizar junto con los datos
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.put(`${API_URL}/oficios/${oficioData.id_oficio}`, oficioData);
      //await axios.put(`http://localhost:3001/api/oficios/${oficioData.id_oficio}`, oficioData);
      toast.success('Oficio actualizado exitosamente');
      setFormVisible(false);
      fetchOficios();
      
      // Si estamos viendo el oficio actualizado, actualizar la vista
      if (currentOficio && currentOficio.id_oficio === oficioData.id_oficio) {
        const oficioActualizado = await getOficioById(oficioData.id_oficio);
        if (oficioActualizado) {
          setCurrentOficio(oficioActualizado);
        }
      }
    } catch (error) {
      console.error('Error actualizando oficio:', error);
      toast.error('Error al actualizar el oficio');
    }
  };

  // Eliminar un oficio
  const handleDeleteOficio = async () => {
    if (!currentOficio) return;
    
    try {
      // Aquí se debe enviar el ID del oficio a eliminar
      const API_URL = import.meta.env.VITE_API_URL;

      await axios.delete(`${API_URL}/oficios/${currentOficio.id_oficio}`);
      //await axios.delete(`http://localhost:3001/api/oficios/${currentOficio.id_oficio}`);
      
      // Opcionalmente eliminar los PDFs asociados
      // Esto podría manejarse en el backend directamente
      toast.success('Oficio eliminado exitosamente');
      setDeleteVisible(false);
      setCurrentOficio(null);
      fetchOficios();
    } catch (error) {
      console.error('Error eliminando oficio:', error);
      toast.error('Error al eliminar el oficio');
    }
  };

  // Archivar/Desarchivar oficio
  const handleArchiveOficio = async (oficio) => {
    try {
      const updatedData = {
        ...oficio,
        archivado: !oficio.archivado
      };
      
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.put(`${API_URL}/oficios/${oficio.id_oficio}`, updatedData);
      //await axios.put(`http://localhost:3001/api/oficios/${oficio.id_oficio}`, updatedData);
      
      toast.success(oficio.archivado 
        ? 'Oficio desarchivado exitosamente' 
        : 'Oficio archivado exitosamente'
      );
      
      fetchOficios();
    } catch (error) {
      console.error('Error cambiando estado de archivo:', error);
      toast.error('Error al cambiar estado de archivo del oficio');
    }
  };

  // Manejadores para editar, ver, eliminar
  const handleEdit = (oficio) => {
    setCurrentOficio(oficio);
    setFormVisible(true);
  };

  const handleView = async (oficio) => {
    // Obtener datos completos del oficio
    const oficioCompleto = await getOficioById(oficio.id_oficio);
    if (oficioCompleto) {
      setCurrentOficio(oficioCompleto);
      setViewVisible(true);
    }
  };

  const handleDelete = (oficio) => {
    setCurrentOficio(oficio);
    setDeleteVisible(true);
  };

  // Función para limpiar y mostrar formulario de creación
  const handleShowCreateForm = () => {
    setCurrentOficio(null);
    setFormVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Administración de Oficios</h1>
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex gap-2">
            <select
              className="p-2 border border-gray-300 rounded"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los oficios</option>
              <option value="active">Oficios activos</option>
              <option value="archived">Oficios archivados</option>
              <option value="estado">Filtrar por estado</option>
              {user.role === "admin" && <option value="area">Filtrar por área</option>}
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

            {filterType === "area" && (
              <select
                className="p-2 border border-gray-300 rounded"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              > 
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area.id_area} value={area.id_area}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <button
            onClick={handleShowCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Nuevo Oficio
          </button>
        </div>
      </div>

      <OficiosTable
        data={oficios}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onArchive={handleArchiveOficio}
        isLoading={isLoading}
      />

      {formVisible && (
        <OficioForm
          oficio={currentOficio}
          estados={estadosDisponibles}
          onSave={currentOficio ? handleUpdateOficio : handleCreateOficio}
          onCancel={() => setFormVisible(false)}
        />
      )}

      {viewVisible && currentOficio && (
        <OficioView
          oficio={currentOficio}
          onClose={() => setViewVisible(false)}
          onEdit={() => {
            setViewVisible(false);
            setFormVisible(true);
          }}
          onNavigateToOficio={handleNavigateToOficio}
        />
      )}

      {deleteVisible && (
        <DeleteConfirmation
          title="Eliminar Oficio"
          message={`¿Está seguro que desea eliminar el oficio ${currentOficio?.numero_de_oficio}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteOficio}
          onCancel={() => setDeleteVisible(false)}
        />
      )}
    </div>
  );
};

export default OficiosPage;