// src/components/Expedientes/ExpedientesTable.jsx
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

const userList = ({ 
    data = [], 
    onEdit, 
    onDelete, 
    onView, 
    onArchive,
    isLoading = false 
  }) => {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [expedientesWithFiles, setExpedientesWithFiles] = useState({});
    useEffect(() => {
        const fetchFilesInfo = async () => {
          if (!data || !data.length) return;
          
          try {
            const response = await axios.get('http://localhost:3001/api/pdfs');
            if (response && response.data) {
              // Crear un objeto con idExpediente como clave y el conteo de archivos como valor
              const filesCount = {};
              response.data.forEach(pdf => {
                if (pdf.idExpediente) {
                  filesCount[pdf.idExpediente] = (filesCount[pdf.idExpediente] || 0) + 1;
                }
              });
              
              setExpedientesWithFiles(filesCount);
            }
          } catch (error) {
            console.error('Error al cargar información de archivos:', error);
          }
        };
        fetchFilesInfo();
    }, [data]);
  
    // Definir columnas
    const columns = useMemo(() => [
      {
        header: 'userName',
        accessorKey: 'NoExpediente',
        cell: info => info.getValue() || '',
      },
      {
        header: 'Folio',
        accessorKey: 'noFolioDeSeguimiento',
        cell: info => info.getValue() || '',
      },
      {
        header: 'Estado',
        accessorKey: 'Estado',
        cell: info => {
          const value = info.getValue();
          if (!value) return '';
          
          let bgColor;
          switch(value) {
            case 'Concluido':
              bgColor = 'bg-green-100 text-green-800';
              break;
            case 'En proceso':
              bgColor = 'bg-yellow-100 text-yellow-800';
              break;
            case 'Cancelado':
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