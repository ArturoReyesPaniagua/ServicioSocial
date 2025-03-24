// src/components/userList/userPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserList from './userList';
import UserForm from './userForm';
import DeleteConfirmation from '../common/DeleteConfirmation';
import { useAuth } from '../../context/AuthContext';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { user: currentAuthUser } = useAuth();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para cargar la lista de usuarios
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la creación de un nuevo usuario
  const handleCreateUser = async (userData) => {
    try {
      await axios.post('http://localhost:3001/api/auth/register', userData);
      toast.success('Usuario creado exitosamente');
      setFormVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Error al crear usuario: ${error.response?.data?.error || error.message}`);
      throw error; // Re-lanzamos el error para que el formulario pueda manejarlo
    }
  };

  // Manejar la actualización de un usuario existente
  const handleUpdateUser = async (userData) => {
    try {
      await axios.put(`http://localhost:3001/api/auth/users/${userData.userId}`, userData);
      toast.success('Usuario actualizado exitosamente');
      setFormVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(`Error al actualizar usuario: ${error.response?.data?.error || error.message}`);
      throw error; // Re-lanzamos el error para que el formulario pueda manejarlo
    }
  };

  // Manejar la eliminación de un usuario
  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    // Evitar que un usuario se elimine a sí mismo
    if (currentUser.userId === currentAuthUser?.userId) {
      toast.error('No puede eliminar su propio usuario');
      setDeleteVisible(false);
      return;
    }
    
    try {
      await axios.delete(`http://localhost:3001/api/auth/users/${currentUser.userId}`);
      toast.success('Usuario eliminado exitosamente');
      setDeleteVisible(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Error al eliminar usuario: ${error.response?.data?.error || error.message}`);
    }
  };

  // Manejadores para editar, ver, eliminar
  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormVisible(true);
  };

  const handleDelete = (user) => {
    setCurrentUser(user);
    setDeleteVisible(true);
  };

  // Función para mostrar formulario de creación
  const handleShowCreateForm = () => {
    setCurrentUser(null);
    setFormVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Usuarios</h1>
        
        <button
          onClick={handleShowCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nuevo Usuario
        </button>
      </div>

      <UserList
        data={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {formVisible && (
        <UserForm
          user={currentUser}
          onSave={currentUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => setFormVisible(false)}
        />
      )}

      {deleteVisible && (
        <DeleteConfirmation
          title="Eliminar Usuario"
          message={`¿Está seguro que desea eliminar al usuario ${currentUser?.username}? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteVisible(false)}
        />
      )}
    </div>
  );
};

export default UserPage;