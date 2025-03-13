import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  message,
  Popconfirm,
  Tag
} from 'antd';
import expedientesService from '../../services/expedientesService';

const ExpedientesList = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExpedientes = async () => {
    try {
      setLoading(true);
      const data = await expedientesService.getAllExpedientes();
      setExpedientes(data);
    } catch (error) {
      message.error('Error al cargar expedientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpedientes();
  }, []);

  const handleSearch = async (value) => {
    try {
      setLoading(true);
      if (value) {
        const data = await expedientesService.searchExpedientes(value);
        setExpedientes(data);
      } else {
        fetchExpedientes();
      }
    } catch (error) {
      message.error('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expedientesService.deleteExpediente(id);
      message.success('Expediente eliminado');
      fetchExpedientes();
    } catch (error) {
      message.error('Error al eliminar expediente');
    }
  };

  const columns = [
    {
      title: 'No. Expediente',
      dataIndex: 'noDeExpediente',
      key: 'noDeExpediente',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'atendido' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        const colors = {
          'concluido': 'green',
          'en proceso': 'blue',
          'cancelado': 'red'
        };
        return <Tag color={colors[estado]}>{estado}</Tag>;
      },
    },
    {
      title: 'Solicitante',
      dataIndex: 'solicitante',
      key: 'solicitante',
    },
    {
      title: 'Asunto',
      dataIndex: 'asunto',
      key: 'asunto',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Está seguro de eliminar este expediente?"
            onConfirm={() => handleDelete(record.idExpediente)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="primary" danger>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.Search
          placeholder="Buscar expedientes..."
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={expedientes}
          rowKey="idExpediente"
          loading={loading}
        />
      </Space>
    </div>
  );
};

export default ExpedientesList;