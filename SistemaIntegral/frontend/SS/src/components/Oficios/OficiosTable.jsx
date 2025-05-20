// File: OficiosTable.jsx
// SistemaIntegral/frontend/SS/src/components/Oficios/OficiosTable.jsx
// Este componente muestra una tabla de oficios
// y permite realizar acciones como editar, eliminar, ver detalles y archivar 
// funciona con reacttable y axios para la gestión de datos

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
import axios from 'axios';

const OficiosTable = ({ 
  data = [], 
  onEdit, 
  onDelete, 
  onView, 
  onArchive,
  isLoading = false 
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [oficiosWithFiles, setOficiosWithFiles] = useState({});
  const [enrichedData, setEnrichedData] = useState([]);

  // Cargar información de archivos para oficios
  useEffect(() => {
    const fetchFilesInfo = async () => {
      if (!data || !data.length) return;
      
      try {
        const response = await axios.get('http://localhost:3001/api/pdfs');
        if (response && response.data) {
          // Crear un objeto con id_oficio como clave y el conteo de archivos como valor
          const filesCount = {};
          response.data.forEach(pdf => {
            if (pdf.id_oficio) {
              filesCount[pdf.id_oficio] = (filesCount[pdf.id_oficio] || 0) + 1;
            }
          });
          
          setOficiosWithFiles(filesCount);
        }
      } catch (error) {
        console.error('Error al cargar información de archivos:', error);
      }
    };
    
    fetchFilesInfo();
  }, [data]);

  // Cargar información de áreas (separado del useEffect anterior)
  useEffect(() => {
    const fetchArea = async () => {
      if (!data || !data.length) return;
      try {
        const response = await axios.get('http://localhost:3001/api/areas');
        if (response && response.data) {
          const areas = response.data.reduce((acc, area) => {
            acc[area.id_area] = area.nombre_area;
            return acc;
          }, {});
          const enriched = data.map(oficio => ({
            ...oficio,
            nombre_area: areas[oficio.id_area] || 'No definida',
          }));
          setEnrichedData(enriched);
        }
      } catch (error) {
        console.error('Error al cargar información de áreas:', error);
      }
    };
    
    fetchArea();
  }, [data]);

  // Definir columnas
  const columns = useMemo(() => [
    {
      header: 'No. Oficio',
      accessorKey: 'numero_de_oficio',
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseInt(rowA.getValue(columnId), 10);
        const b = parseInt(rowB.getValue(columnId), 10);
        return isNaN(a) || isNaN(b) ? 0 : a - b;
      },
      cell: info => info.getValue() || '',
    },
    {
      header: 'Area',
      accessorKey: 'nombre_area',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Estado',
      accessorKey: 'estado',
      cell: info => {
        const value = info.getValue();
        if (!value) return '';
        
        let bgColor;
        switch(value) {
          case 'concluido':
            bgColor = 'bg-green-100 text-green-800';
            break;
          case 'en proceso':
            bgColor = 'bg-yellow-100 text-yellow-800';
            break;
          case 'cancelado':
            bgColor = 'bg-red-100 text-red-800';
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
      header: 'Fecha Recepción',
      accessorKey: 'fecha_recepcion',
      cell: info => {
        const value = info.getValue();
        try {
          return value ? format(new Date(value), 'dd/MM/yyyy', { locale: es }) : '';
        } catch (error) {
          console.error('Error al formatear fecha:', error);
          return '';
        }
      },
    },
    {
      header: 'Fecha Límite',
      accessorKey: 'fecha_limite',
      cell: info => {
        const value = info.getValue();
        if (!value) return '';
        
        try {
          const date = new Date(value);
          const today = new Date();
          const isOverdue = date < today;
          
          return (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {format(date, 'dd/MM/yyyy', { locale: es })}
            </span>
          );
        } catch (error) {
          console.error('Error al formatear fecha límite:', error);
          return '';
        }
      },
    },
    {
      header: 'Solicitante',
      accessorKey: 'nombre_solicitante',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Asunto',
      accessorKey: 'asunto',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Docs',
      id: 'documentos',
      cell: ({ row }) => {
        const oficioId = row.original?.id_oficio;
        if (!oficioId) return null;
        
        const fileCount = oficiosWithFiles[oficioId] || 0;
        
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
              fileCount > 0 ? 'bg-guinda text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {fileCount}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: ({ row }) => {
        if (!row.original) return null;
        
        return (
          <div className="flex space-x-2">
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
            <button
              onClick={() => onEdit && onEdit(row.original)}
              className="p-1 text-yellow-600 hover:text-yellow-900"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {/*<button
              onClick={() => onArchive && onArchive(row.original)}
              className="p-1 text-purple-600 hover:text-purple-900?"
              title={row.original.archivado ? "Desarchivar" : "Archivar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            */}
            <button
              onClick={() => onDelete && onDelete(row.original)}
              className="p-1 text-red-600 hover:text-red-900"
              title="Eliminar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ], [onEdit, onDelete, onView, onArchive, oficiosWithFiles]);

  // Configurar tabla con TanStack
  const table = useReactTable({
    data: enrichedData.length > 0 ? enrichedData : data,
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
          placeholder="Buscar en todas las columnas..."
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
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OficiosTable;