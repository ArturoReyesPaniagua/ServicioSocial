// src/components/Registration/Registration.jsx
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Registration.css';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError('El usuario y contraseña son obligatorios');
      setLoading(false);
      return;
    }
    
          try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        username,
        password,
        role,
      });
      
      console.log('Respuesta del registro:', response.data);
      setSuccess(true);
      
      // Si tienes react-toastify configurado para mostrar notificaciones
      if (typeof toast !== 'undefined') {
        toast.success('Usuario registrado con éxito');
      }
      
      // Limpiar el formulario después del registro exitoso
      setUsername('');
      setPassword('');
      setRole('user');
    } catch (error) {
      console.error("Error registrando usuario:", error);
      setError(error.response?.data?.error || "Error al registrar el usuario");
      
      if (typeof toast !== 'undefined') {
        toast.error(error.response?.data?.error || "Error al registrar el usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden'>
        {/* Encabezado con color guinda */}
        <div className="bg-guinda p-6">
          <h2 className="text-white text-xl font-bold text-center">
            Registrar Usuario
          </h2>
        </div>

        <div className='p-6'>
          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert">
              <p>Usuario registrado con éxito</p>
            </div>
          )}
          
          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Campo de usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
                required
              />
            </div>
            
            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
                required
              />
            </div>
            
            {/* Campo de selección de rol */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-guinda hover:bg-guinda-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-guinda disabled:bg-guinda-light disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </div>
                ) : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;