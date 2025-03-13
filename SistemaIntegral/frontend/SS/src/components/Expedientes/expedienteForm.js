import React from 'react';
import { Form, Input, DatePicker, Select, Button, message } from 'antd';
import expedientesService from '../../services/expedientesService';

const { TextArea } = Input;
const { Option } = Select;

const ExpedienteForm = ({ initialData, onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      if (initialData) {
        await expedientesService.updateExpediente(initialData.idExpediente, values);
        message.success('Expediente actualizado correctamente');
      } else {
        await expedientesService.createExpediente(values);
        message.success('Expediente creado correctamente');
      }
      onSuccess?.();
      form.resetFields();
    } catch (error) {
      message.error('Error al guardar el expediente');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData}
      onFinish={onFinish}
    >
      <Form.Item
        name="noDeExpediente"
        label="No. de Expediente"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="atendido">Atendido</Option>
          <Option value="no atendido">No Atendido</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="estado"
        label="Estado"
        rules={[{ required: true }]}
      >
        <Select>
          <Option value="concluido">Concluido</Option>
          <Option value="en proceso">En Proceso</Option>
          <Option value="cancelado">Cancelado</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="fechaDeRecepcion"
        label="Fecha de Recepción"
        rules={[{ required: true }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="solicitante"
        label="Solicitante"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="asunto"
        label="Asunto"
        rules={[{ required: true }]}
      >
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {initialData ? 'Actualizar' : 'Crear'} Expediente
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ExpedienteForm;