// AuthContext.jsx
// SistemaIntegral/frontend/SS/src/context/AuthContext.jsx
// Este archivo contiene el contexto de autenticación para la aplicación React
// y maneja el estado de autenticación del usuario, incluyendo el inicio y cierre de sesión.

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

// Obtener URL base del API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }) {
  // Estado para almacenar el usuario, la autenticación y el estado de carga
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token al cargar la página
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Configurar el token en los headers para todas las peticiones
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Opcional: verificar el token con el backend
          // const response = await axios.get(`${API_BASE_URL}/auth/verify`);
          // if (response.data.valid) {
          //   setUser(JSON.parse(storedUser));
          //   setIsAuthenticated(true);
          // } else {
          //   // Token inválido, limpiar almacenamiento
          //   localStorage.removeItem('token');
          //   localStorage.removeItem('user');
          // }
          
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          // Si hay error, limpiar el almacenamiento
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Intentando login con API_BASE_URL:', API_BASE_URL);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
     });

      console.log('Respuesta del servidor:', response.data);

      // Verificar la estructura de la respuesta según tu backend
      if (response.data) {
        const token = response.data.access_token;
        if (token) {
          // Configurar el token para todas las solicitudes futuras
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Guardar el token
          localStorage.setItem('token', token);
          
          // Guardar los datos del usuario en el localStorage
          const userData = {
            userId: response.data.userId,
            username: response.data.username,
            role: response.data.role || 'user',
            nombre_area: response.data.nombre_area || 'Sin área asignada',
            id_area: response.data.id_area || null
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          
          setUser(userData);
          setIsAuthenticated(true);
          
          return { success: true };
        }
      }
      return { success: false, message: 'Credenciales inválidas' };
    } catch (error) {
      console.error('Error durante login:', error);
      
      // Mensaje de error más descriptivo
      let errorMessage = 'Error al conectar con el servidor';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Usuario o contraseña incorrectos';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de conexión. Verifique que el servidor esté ejecutándose.';
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = () => {
    // Eliminar headers de autorización
    delete axios.defaults.headers.common['Authorization'];
    
    // Eliminar datos del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Resetear estado
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};