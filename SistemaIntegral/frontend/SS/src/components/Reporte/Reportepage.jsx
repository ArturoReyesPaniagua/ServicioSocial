
// SistemaIntegral/frontend/SS/src/components/Reporte/ReportePage.jsx


// Este componente es la página principal para la generación de reporte con filtros por estado, fechas y solicitantes

import { useState, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ReportePreview from './ReportePreview';
import ReporteExport from './ReporteExport';

const ReportePage = () => {
  // Obtener información del usuario autenticado
  const { user } = useAuth();
  
  // Estados para los datos y filtros
  const [oficios, setOficios] = useState([]);
  const [filteredOficios, setFilteredOficios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [solicitantes, setSolicitantes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [areaName, setAreaName] = useState('');
  
  // Estados para los filtros
  const [filters, setFilters] = useState({
    estado: '',
    fechaRecepcionDesde: '',
    fechaRecepcionHasta: '',
    fechaLimiteDesde: '',
    fechaLimiteHasta: '',
    idSolicitante: '',
    idResponsable: '',
    idArea: '',
    archivado: ''
  });

  // Estados disponibles para el filtro
  const estadosDisponibles = [
    { value: 'concluido', label: 'Concluido' },
    { value: 'en proceso', label: 'En proceso' },
    { value: 'urgencia', label: 'urgencia' }
  ];

  // Opciones para el estado de archivo   // se tiene que cambiar
  const opcionesArchivo = [
    { value: 'true', label: 'Archivados' },
    { value: 'false', label: 'No archivados' }
  ];

  // Cargar datos necesarios al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Si el usuario es normal, preseleccionar su área
        if (user && user.role !== 'admin' && user.id_area) {
          setFilters(prev => ({
            ...prev,
            idArea: user.id_area.toString()
          }));
          
          // Si tenemos el nombre del área, guardarlo
          if (user.nombre_area) {
            setAreaName(user.nombre_area);
          }
        }
        
        // Cargar oficios
        await fetchOficios();
        
        // Cargar datos relacionados
        await fetchRelatedData();
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar los datos. Intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Función para cargar los oficios
  const fetchOficios = async () => {
    try {
      // Obtener el token para autorización
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
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/oficios`, config);


      //const response = await axios.get('http://localhost:3001/api/oficios', config);
      
      // El backend ya filtra por área para usuarios normales
      setOficios(response.data);
      setFilteredOficios(response.data);
    } catch (error) {
      console.error('Error cargando oficios:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
      } else {
        toast.error('Error al cargar oficios. Por favor intente nuevamente.');
      }
      
      throw error;
    }
  };

  // Función para cargar datos relacionados (solicitantes, responsables, áreas)
  const fetchRelatedData = async () => {
    try {
      // Obtener token para autorización
      const token = localStorage.getItem('token');
      
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Cargar solicitantes
      const API_URL = import.meta.env.VITE_API_URL;

      const solicitantesResponse = await axios.get(`${API_URL}/solicitantes`, config);
      //const solicitantesResponse = await axios.get('http://localhost:3001/api/solicitantes', config);
      setSolicitantes(solicitantesResponse.data);
      
      // Cargar responsables
      const responsablesResponse = await axios.get(`${API_URL}/responsables`, config);
      //const responsablesResponse = await axios.get('http://localhost:3001/api/responsables', config);
      setResponsables(responsablesResponse.data);
      
      // Cargar áreas (solo para administradores)
      if (user.role === 'admin') {
        const API_URL = import.meta.env.VITE_API_URL;
        const areasResponse = await axios.get(`${API_URL}/areas`, config);
        //const areasResponse = await axios.get('http://localhost:3001/api/areas', config);
        setAreas(areasResponse.data);
      } else if (user.id_area) {
        // Para usuarios normales, si no tenemos el nombre del área, obtenerlo
        if (!areaName && user.id_area) {
          try {
            const API_URL = import.meta.env.VITE_API_URL;
            const areaResponse = await axios.get(`${API_URL}/areas/${user.id_area}`, config);
            //const areaResponse = await axios.get(`http://localhost:3001/api/areas/${user.id_area}`, config);
            if (areaResponse.data && areaResponse.data.nombre_area) {
              setAreaName(areaResponse.data.nombre_area);
            }
          } catch (error) {
            console.error('Error al obtener nombre del área:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando datos relacionados:', error);
      throw error;
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Para usuarios normales, no permitir cambiar el área
    if (name === 'idArea' && user.role !== 'admin') {
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    // Para usuarios normales, mantener su área en los filtros
    if (user.role !== 'admin') {
      setFilters({
        estado: '',
        fechaRecepcionDesde: '',
        fechaRecepcionHasta: '',
        fechaLimiteDesde: '',
        fechaLimiteHasta: '',
        idSolicitante: '',
        idResponsable: '',
        idArea: user.id_area.toString(), // Mantener el área del usuario
        archivado: ''
      });
    } else {
      // Para administradores, limpiar todos los filtros
      setFilters({
        estado: '',
        fechaRecepcionDesde: '',
        fechaRecepcionHasta: '',
        fechaLimiteDesde: '',
        fechaLimiteHasta: '',
        idSolicitante: '',
        idResponsable: '',
        idArea: '',
        archivado: ''
      });
    }
    
    // Restaurar la lista completa
    setFilteredOficios(oficios);
  };

  // Aplicar filtros a la lista de oficios
  const applyFilters = () => {
    setIsLoading(true);
    
    try {
      // Filtrar los oficios según los criterios seleccionados
      let result = [...oficios];
      
      // Filtrar por estado
      if (filters.estado) {
        result = result.filter(oficio => oficio.estado === filters.estado);
      }
      
      // Filtrar por fecha de recepción (desde)
      if (filters.fechaRecepcionDesde) {
        const fechaDesde = new Date(filters.fechaRecepcionDesde);
        result = result.filter(oficio => {
          if (!oficio.fecha_recepcion) return false;
          const fechaOficio = new Date(oficio.fecha_recepcion);
          return fechaOficio >= fechaDesde;
        });
      }
      
      // Filtrar por fecha de recepción (hasta)
      if (filters.fechaRecepcionHasta) {
        const fechaHasta = new Date(filters.fechaRecepcionHasta);
        // Ajustar para incluir todo el día
        fechaHasta.setHours(23, 59, 59, 999);
        result = result.filter(oficio => {
          if (!oficio.fecha_recepcion) return false;
          const fechaOficio = new Date(oficio.fecha_recepcion);
          return fechaOficio <= fechaHasta;
        });
      }
      
      // Filtrar por fecha límite (desde)
      if (filters.fechaLimiteDesde) {
        const fechaDesde = new Date(filters.fechaLimiteDesde);
        result = result.filter(oficio => {
          if (!oficio.fecha_limite) return false;
          const fechaOficio = new Date(oficio.fecha_limite);
          return fechaOficio >= fechaDesde;
        });
      }
      
      // Filtrar por fecha límite (hasta)
      if (filters.fechaLimiteHasta) {
        const fechaHasta = new Date(filters.fechaLimiteHasta);
        // Ajustar para incluir todo el día
        fechaHasta.setHours(23, 59, 59, 999);
        result = result.filter(oficio => {
          if (!oficio.fecha_limite) return false;
          const fechaOficio = new Date(oficio.fecha_limite);
          return fechaOficio <= fechaHasta;
        });
      }
      
      // Filtrar por solicitante
      if (filters.idSolicitante) {
        result = result.filter(oficio => 
          oficio.id_solicitante === parseInt(filters.idSolicitante)
        );
      }
      
      // Filtrar por responsable
      if (filters.idResponsable) {
        result = result.filter(oficio => 
          oficio.id_responsable === parseInt(filters.idResponsable)
        );
      }
      
      // Filtrar por área (solo para administradores)
      if (user.role === 'admin' && filters.idArea) {
        result = result.filter(oficio => 
          oficio.id_area === parseInt(filters.idArea)
        );
      }
      
      // Filtrar por estado de archivo
      if (filters.archivado) {
        const archivoValue = filters.archivado === 'true';
        result = result.filter(oficio => oficio.archivado === archivoValue);
      }
      
      // Actualizar la lista filtrada
      setFilteredOficios(result);
      
      // Mostrar mensaje sobre los resultados
      if (result.length === 0) {
        toast.info('No se encontraron oficios con los filtros aplicados');
      } else {
        toast.success(`Se encontraron ${result.length} oficios`);
      }
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      toast.error('Error al aplicar los filtros');
    } finally {
      setIsLoading(false);
    }
  };

  // Generar reporte (muestra la vista previa)
  const handleGenerateReport = () => {
    if (filteredOficios.length === 0) {
      toast.warning('No hay oficios para generar un reporte');
      return;
    }
    
    setShowPreview(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Generación de Reportes</h1>
        
        {user && user.role !== 'admin' && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-700">
              Está generando reportes únicamente para los oficios de su área asignada: <strong>{areaName}</strong>.
            </p>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">
          Aplique los filtros necesarios y genere reportes personalizados de los oficios.
        </p>
        
        {/* Sección de filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filtros de Búsqueda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Filtro por estado */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado del Oficio
              </label>
              <select
                id="estado"
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              >
                <option value="">Todos los estados</option>
                {estadosDisponibles.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por solicitante */}
            <div>
              <label htmlFor="idSolicitante" className="block text-sm font-medium text-gray-700 mb-1">
                Solicitante
              </label>
              <select
                id="idSolicitante"
                name="idSolicitante"
                value={filters.idSolicitante}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              >
                <option value="">Todos los solicitantes</option>
                {solicitantes.map(sol => (
                  <option key={sol.id_solicitante} value={sol.id_solicitante}>
                    {sol.nombre_solicitante}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por responsable */}
            <div>
              <label htmlFor="idResponsable" className="block text-sm font-medium text-gray-700 mb-1">
                Responsable
              </label>
              <select
                id="idResponsable"
                name="idResponsable"
                value={filters.idResponsable}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              >
                <option value="">Todos los responsables</option>
                {responsables.map(resp => (
                  <option key={resp.id_responsable} value={resp.id_responsable}>
                    {resp.nombre_responsable}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por área - Solo visible para administradores */}
            {user && user.role === 'admin' && (
              <div>
                <label htmlFor="idArea" className="block text-sm font-medium text-gray-700 mb-1">
                  Área
                </label>
                <select
                  id="idArea"
                  name="idArea"
                  value={filters.idArea}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
                >
                  <option value="">Todas las áreas</option>
                  {areas.map(area => (
                    <option key={area.id_area} value={area.id_area}>
                      {area.nombre_area}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Área preseleccionada para usuarios normales */}
            {user && user.role !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área
                </label>
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                  {areaName || 'Cargando...'}
                  <p className="text-xs text-gray-500 mt-1">
                    El área está preseleccionada según su perfil
                  </p>
                </div>
              </div>
            )}
            
            {/* Filtro por fecha de recepción (desde) */}
            <div>
              <label htmlFor="fechaRecepcionDesde" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Recepción (Desde)
              </label>
              <input
                type="date"
                id="fechaRecepcionDesde"
                name="fechaRecepcionDesde"
                value={filters.fechaRecepcionDesde}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
            </div>
            
            {/* Filtro por fecha de recepción (hasta) */}
            <div>
              <label htmlFor="fechaRecepcionHasta" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Recepción (Hasta)
              </label>
              <input
                type="date"
                id="fechaRecepcionHasta"
                name="fechaRecepcionHasta"
                value={filters.fechaRecepcionHasta}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
            </div>
            
            {/* Filtro por fecha límite (desde) */}
            <div>
              <label htmlFor="fechaLimiteDesde" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Límite (Desde)
              </label>
              <input
                type="date"
                id="fechaLimiteDesde"
                name="fechaLimiteDesde"
                value={filters.fechaLimiteDesde}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
            </div>
            
            {/* Filtro por fecha límite (hasta) */}
            <div>
              <label htmlFor="fechaLimiteHasta" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Límite (Hasta)
              </label>
              <input
                type="date"
                id="fechaLimiteHasta"
                name="fechaLimiteHasta"
                value={filters.fechaLimiteHasta}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
            </div>
            
            {/* Filtro por estado de archivo */}
            <div>
              <label htmlFor="archivado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Archivo
              </label>
              <select
                id="archivado"
                name="archivado"
                value={filters.archivado}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              >
                <option value="">Todos</option>
                {opcionesArchivo.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Botones de acción para los filtros */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-guinda"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={applyFilters}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
            </button>
          </div>
        </div>
        
        {/* Resumen de resultados y botón de generar reporte */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Resultados</h2>
              <p className="text-gray-600">
                {isLoading ? 'Cargando...' : `${filteredOficios.length} oficios encontrados`}
              </p>
            </div>
            
            <button
              onClick={handleGenerateReport}
              disabled={isLoading || filteredOficios.length === 0}
              className="mt-4 md:mt-0 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-guinda hover:bg-guinda-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-guinda disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generar Reporte
            </button>
          </div>
          
          {/* Vista previa de resultados (solo mostrar algunos campos clave) */}
          {filteredOficios.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oficio
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recepción
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Límite
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOficios.slice(0, 5).map((oficio) => (
                    <tr key={oficio.id_oficio} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {oficio.numero_de_oficio}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          oficio.estado === 'concluido' ? 'bg-green-100 text-green-800' :
                          oficio.estado === 'en proceso' ? 'bg-yellow-100 text-yellow-800' :
                          oficio.estado === 'urgencia' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {oficio.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {oficio.nombre_solicitante || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {oficio.fecha_recepcion 
                          ? format(new Date(oficio.fecha_recepcion), 'dd/MM/yyyy', { locale: es })
                          : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {oficio.fecha_limite 
                          ? format(new Date(oficio.fecha_limite), 'dd/MM/yyyy', { locale: es })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredOficios.length > 5 && (
                <div className="text-center text-gray-500 text-sm mt-3">
                  Mostrando 5 de {filteredOficios.length} oficios
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Mostrar componente de vista previa si está activado */}
      {showPreview && (
        <ReportePreview 
          oficios={filteredOficios}
          filters={filters}
          solicitantes={solicitantes}
          responsables={responsables}
          areas={areas}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default ReportePage;