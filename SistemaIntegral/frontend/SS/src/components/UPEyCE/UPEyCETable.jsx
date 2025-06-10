
// SistemaIntegral/frontend/SS/src/components/UPEyCE/UPEyCETable.jsx

// Este componente muestra una tabla de registros UPEyCE con funcionalidades de búsqueda, ordenamiento y acciones

import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UPEyCETable = ({ 
  data = [],
  onEdit,
  onDelete,
  onView,
  onGenerateOficio,
  isLoading = false 
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [oficiosCount, setOficiosCount] = useState({});
  const { user } = useAuth();

  // Obtener conteo de oficios para cada UPEyCE
  useEffect(() => {
    const fetchOficiosCount = async () => {
      if (!data || data.length === 0) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Obtenemos todos los oficios
        const response = await axios.get('http://localhost:3001/api/oficios', config);
        
        // Contamos los oficios por UPEyCE
        const counts = {};
        response.data.forEach(oficio => {
          if (oficio.id_UPEyCE) {
            counts[oficio.id_UPEyCE] = (counts[oficio.id_UPEyCE] || 0) + 1;
          }
        });
        
        setOficiosCount(counts);
      } catch (error) {
        console.error('Error al obtener conteo de oficios:', error);
      }
    };
    
    fetchOficiosCount();
  }, [data]);

  // Definir columnas
  const columns = useMemo(() => [
    {
      header: 'Número UPEyCE',
      accessorKey: 'numero_UPEyCE',
      cell: info => {
        const value = info.getValue();
        return (
          <span className="font-medium text-blue-700">
            {value || ''}
          </span>
        );
      },
    },
    {
      header: 'Área',
      accessorKey: 'nombre_area',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Fecha de Creación',
      accessorKey: 'fecha_creacion',
      cell: info => {
        const value = info.getValue();
        try {
          return value ? format(new Date(value), 'dd/MM/yyyy', { locale: es }) : '';
        } catch (error) {
          return '';
        }
      },
    },
    {
      header: 'Creado por',
      accessorKey: 'nombre_usuario',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Descripción',
      accessorKey: 'descripcion',
      cell: info => {
        const value = info.getValue();
        if (!value) return '';
        
        return value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
      },
    },
    {
      header: 'Oficios',
      id: 'oficios_count',
      cell: ({ row }) => {
        const UPEyCEId = row.original?.id_UPEyCE;
        if (!UPEyCEId) return '0';
        
        const count = oficiosCount[UPEyCEId] || 0;
        
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
              count > 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'
            } font-medium`}>
              {count}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => {
        const isAdmin = user?.role === 'admin';
        const isOwnRecord = user?.userId === row.original?.id_usuario;
        
        return (
          <div className="flex space-x-2">
            {/* Ver detalles */}
            <button
              onClick={() => onView && onView(row.original)}
              className="p-1 text-blue-600 hover:text-blue-900"
              title="Ver detalles"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            {/* Editar - solo admin o propietario */}
            {(isAdmin || isOwnRecord) && (
              <button
                onClick={() => onEdit && onEdit(row.original)}
                className="p-1 text-yellow-600 hover:text-yellow-900"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {/* Asociar Oficio */}
            <button
              onClick={() => onGenerateOficio && onGenerateOficio(row.original)}
              className="p-1 text-green-600 hover:text-green-900"
              title="Asociar Oficio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            {/* Eliminar - solo admin */}
            {isAdmin && (
              <button
                onClick={() => onDelete && onDelete(row.original)}
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
  ], [onEdit, onDelete, onView, onGenerateOficio, user, oficiosCount]);

  // Configurar tabla con TanStack Table
  const table = useReactTable({
    data,
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
          placeholder="Buscar UPEyCE..."
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-guinda"></div>
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
                  No se encontraron registros UPEyCE
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UPEyCETable;