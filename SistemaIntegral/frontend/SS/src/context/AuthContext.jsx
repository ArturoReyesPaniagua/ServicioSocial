// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // URL CORREGIDA AQUÍ - Esta es la ruta correcta según tu backend
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password
      });

      console.log('Respuesta login:', response.data);

      // El backend devuelve directamente los datos del usuario y el token
      if (response.data && response.data.access_token) {
        // Guardar el token y los datos del usuario
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify({
          userId: response.data.userId,
          username: response.data.username,
          role: response.data.role
        }));
        
        setUser({
          userId: response.data.userId,
          username: response.data.username,
          role: response.data.role
        });
        setIsAuthenticated(true);
        
        return { success: true };
      }
      return { success: false, message: 'Credenciales inválidas' };
    } catch (error) {
      console.error('Error durante login:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Error al conectar con el servidor' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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