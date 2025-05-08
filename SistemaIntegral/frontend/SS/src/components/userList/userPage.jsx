//File: userPage.jsx
// SistemaIntegral/frontend/SS/src/components/userList/userPage.jsx
// Este componente es la página principal para la gestión de usuarios, donde se pueden crear, editar y eliminar usuarios

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
      const token = localStorage.getItem('token');
      
      // Configurar headers con el token de autenticación
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get('http://localhost:3001/api/auth/users', config);
      
      console.log('Usuarios cargados:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      
      let errorMessage = 'Error al cargar usuarios. Por favor intente nuevamente.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.';
          
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la creación de un nuevo usuario
  const handleCreateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      console.log('Creando usuario:', { ...userData, password: '[REDACTED]' });
      
      const response = await axios.post('http://localhost:3001/api/auth/register', userData, config);
      
      console.log('Respuesta del servidor:', response.data);
      
      toast.success('Usuario creado exitosamente');
      setFormVisible(false);
      fetchUsers();
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      let errorMessage = 'Error al crear usuario';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'El nombre de usuario ya está registrado';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      toast.error(errorMessage);
      throw error; // Re-lanzamos el error para que el formulario pueda manejarlo
    }
  };

  // Manejar la actualización de un usuario existente
  const handleUpdateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Crear una copia de los datos para no modificar el objeto original
      const updateData = { ...userData };
      // Si no hay contraseña, quitarla del objeto para no enviar un valor vacío
      if (!updateData.password) {
        delete updateData.password;
      }
      
      console.log('Actualizando usuario:', { 
        ...updateData, 
        password: updateData.password ? '[REDACTED]' : undefined 
      });
      
      const response = await axios.put(
        `http://localhost:3001/api/auth/users/${userData.userId}`, 
        updateData, 
        config
      );
      
      console.log('Respuesta del servidor:', response.data);
      
      // Si el usuario actualizado es el actualmente autenticado y cambió su username,
      // actualizar la información en localStorage
      if (userData.userId === currentAuthUser?.userId && userData.username !== currentAuthUser.username) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.username = userData.username;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        // Opcional: actualizar el contexto de autenticación si es necesario
        // setUser(storedUser);
      }
      
      toast.success('Usuario actualizado exitosamente');
      setFormVisible(false);
      fetchUsers();
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      
      let errorMessage = 'Error al actualizar usuario';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response.status === 403) {
          errorMessage = 'No tiene permisos para esta acción';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      toast.error(errorMessage);
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
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      console.log('Eliminando usuario:', currentUser.username);
      
      await axios.delete(`http://localhost:3001/api/auth/users/${currentUser.userId}`, config);
      
      toast.success('Usuario eliminado exitosamente');
      setDeleteVisible(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      let errorMessage = 'Error al eliminar usuario';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response.status === 403) {
          errorMessage = 'No tiene permisos para eliminar este usuario';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  // Manejadores para editar y eliminar usuarios
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

  // Verificar si el usuario actual es administrador
  const isAdmin = currentAuthUser?.role === 'admin';

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Usuarios</h1>
        
        {isAdmin && (
          <button
            onClick={handleShowCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Nuevo Usuario
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">No hay usuarios registrados o no tienes permisos para verlos.</p>
          {isAdmin && (
            <button
              onClick={handleShowCreateForm}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Crear el primer usuario
            </button>
          )}
        </div>
      ) : (
        <UserList
          data={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}

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