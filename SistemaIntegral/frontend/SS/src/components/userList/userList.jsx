// src/components/userList/userList.jsx
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

const UserList = ({ 
  data = [], 
  onEdit, 
  onDelete, 
  onView,
  isLoading = false 
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Definir columnas
  const columns = useMemo(() => [
    {
      header: 'Username',
      accessorKey: 'username',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Role',
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
      header: 'User ID',
      accessorKey: 'userId',
      cell: info => info.getValue() || '',
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        if (!row.original) return null;
        
        return (
          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={() => onView(row.original)}
                className="p-1 text-blue-600 hover:text-blue-900"
                title="View details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(row.original)}
                className="p-1 text-yellow-600 hover:text-yellow-900"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(row.original)}
                className="p-1 text-red-600 hover:text-red-900"
                title="Delete"
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
  ], [onEdit, onDelete, onView]);

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
          placeholder="Search users..."
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
                  No users found
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