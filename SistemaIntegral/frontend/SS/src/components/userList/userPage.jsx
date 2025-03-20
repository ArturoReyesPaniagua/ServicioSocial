// src/components/userList/userPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserList from './userList';
import DeleteConfirmation from '../common/DeleteConfirmation';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
      toast.error('Error loading users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la creación de un nuevo usuario (será implementado con un formulario)
  const handleCreateUser = async (userData) => {
    try {
      await axios.post('http://localhost:3001/api/auth/register', userData);
      toast.success('User created successfully');
      setFormVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Error creating user: ${error.response?.data?.error || error.message}`);
    }
  };

  // Manejar la actualización de un usuario existente (será implementado con un formulario)
  const handleUpdateUser = async (userData) => {
    try {
      await axios.put(`http://localhost:3001/api/auth/users/${userData.userId}`, userData);
      toast.success('User updated successfully');
      setFormVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(`Error updating user: ${error.response?.data?.error || error.message}`);
    }
  };

  // Manejar la eliminación de un usuario
  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/auth/users/${currentUser.userId}`);
      toast.success('User deleted successfully');
      setDeleteVisible(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Error deleting user: ${error.response?.data?.error || error.message}`);
    }
  };

  // Manejadores para editar, ver, eliminar
  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormVisible(true);
  };

  const handleView = (user) => {
    // Implementar visualización detallada si es necesario
    console.log('View user details:', user);
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
        <h1 className="text-2xl font-bold mb-4 md:mb-0">User Management</h1>
        
        <button
          onClick={handleShowCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          New User
        </button>
      </div>

      <UserList
        data={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Aquí se implementaría el formulario de usuarios cuando esté disponible */}
      {/* {formVisible && (
        <UserForm
          user={currentUser}
          onSave={currentUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => setFormVisible(false)}
        />
      )} */}

      {deleteVisible && (
        <DeleteConfirmation
          title="Delete User"
          message={`Are you sure you want to delete user ${currentUser?.username}? This action cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteVisible(false)}
        />
      )}
    </div>
  );
};

export default UserPage;