// File UserList.jsx
// SistemaIntegral/frontend/SS/src/components/userList/UserList.jsx
// Este componente es una tabla que muestra una lista de usuarios y permite editar y eliminar usuarios

import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UserList = ({  
  data = [], 
  onEdit, 
  onDelete, 
  isLoading = false
}) => {
  const [areas, setAreas] = useState([]); // Lista de áreas para mostrar los nombres
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/areas`); // Cambiar la URL si se cambia el backend

        //const response = await axios.get('http://localhost:3001/api/areas');
        console.log('Áreas recibidas:', response.data); // Para debug
        if (response.data && response.data.length > 0) {
          setAreas(response.data);
        } else {
          console.error('No se encontraron áreas disponibles');
        }
      } catch (error) {
        console.error('Error al cargar áreas:', error);
      }
    };
    fetchAreas();
  }, []);

    
  
  // Definir columnas
  const columns = useMemo(() => [
    {
      header: 'Usuario',
      accessorKey: 'username',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Rol',
      accessorKey: 'role',
      cell: info => {
        const value = info.getValue();
        if (!value) return '';
        
        let bgColor;
        switch(value.toLowerCase()) {
          case 'admin':
            bgColor = 'bg-blue-100 text-blue-800';
            break;
          case 'user':
            bgColor = 'bg-green-100 text-green-800';
            break;
          default:
            bgColor = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {value}
          </span>
        );
      },
    },
  {
    header: 'Área',
    accessorKey: 'id_area',
    cell: info => {
      const areaId = info.getValue();
      const area = areas.find(area => area.id_area === areaId); 
      console.log('Área encontrada:', areaId); // Para debug
      return area ? (
        <span title={area.nombre_area} className="text-xs text-gray-500">
          {area.nombre_area}
        </span>
      ) : (
        "Error al cargar área" // Mensaje alternativo si no se encuentra el área
      );
    },
  },

    {
      header: 'ID de Usuario',
      accessorKey: 'userId',
      cell: info => {
        const value = info.getValue();
        return value ? 
          <span title={value} className="text-xs text-gray-500">
            {value}
            
          </span> : 'Problemas al cargar ID '; 
        },
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => {
        if (!row.original) return null;
        
        // Verificar si es el usuario actual para evitar auto-eliminación
        const isSelf = row.original.userId === currentUser?.userId;
        // Verificar si el usuario actual es administrador
        const isAdmin = currentUser?.role === 'admin';
        
        return (
          <div className="flex space-x-2">
            {/* Solo permitir edición si es admin o es el propio perfil */}
            {(isAdmin || isSelf) && (
              <button
                onClick={() => onEdit(row.original)}
                className="p-1 text-yellow-600 hover:text-yellow-900"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            
            {isAdmin && !isSelf && (
              <button
                onClick={() => onDelete(row.original)}
                className="p-1 text-red-600 hover:text-red-900"
                title="Eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        );
      },
    },
  ], [onEdit, onDelete, currentUser, areas]);

  // Configurar tabla con TanStack
  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter || ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Buscar usuarios..."
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      <span>
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? '▲' : '▼'
                        ) : ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 border-t border-gray-200">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;