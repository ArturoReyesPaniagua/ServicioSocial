// AuthContext.jsx
// SistemaIntegral/frontend/SS/src/context/AuthContext.jsx
// Este archivo contiene el contexto de autenticación para la aplicación React
// y maneja el estado de autenticación del usuario, incluyendo el inicio y cierre de sesión.

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null); // Crear el contexto de autenticación

export function AuthProvider({ children }) {
  // Estado  para almacenar el usuario, la autentificacion y el estado de carga
  // user: Almacena los datos del usuario autenticado
  // isAuthenticated: Almacena el estado de autenticación del usuario (true o false)
  // loading: Almacena el estado de carga de la aplicación (true o false)
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token al cargar la página
  // Aqui es donde se guarda la informacion del usuario y el token  lo que permite que la aplicacion no se recargue
  // y el usuario no tenga que volver a iniciar sesion cada vez que regarga la pagina]
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
      // Url del backend para la autenticación
      // si se modifica la url del backend, se debe modificar aqui sobretodo en el caso de modificar el puerto
      // En este caso se usa el puerto 3001 para el backend y 3000 para el frontend
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password
      });

      console.log('Respuesta login:', response.data);

      // El backend devuelve directamente los datos del usuario y el token
      if (response.data && response.data.access_token) {
        // Guardar el token y los datos del usuario
        localStorage.setItem('token', response.data.access_token); //guarda el token en el local storage
        localStorage.setItem('user', JSON.stringify({ //guarda el usuario en el local storage 
          userId: response.data.userId,
          username: response.data.username,
          role: response.data.role
        }));
        
        setUser({
          userId: response.data.userId,
          username: response.data.username,
          role: response.data.role
        });
        setIsAuthenticated(true); // Pone al usuario que esta verificado, ojo esto puede causar problemas de seguridad a la larga si se pone informacion delicada
        // Aquí puedes redirigir al usuario a la página de inicio o a donde desees
        
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

  // Quiero dejar en claro que la razon por la que realice este tipo de procesos es para evitar que el usuario tenga que volver a iniciar sesion cada vez que recarga la pagina
  // PPara evitar solicitar tantas peticiones al backend y que el backend se sature de peticiones innecesarias facilitando la escalabilidad de la aplicacion


  const logout = () => {
    localStorage.removeItem('token'); // Elimina el token del local storage
    localStorage.removeItem('user');// Elimina el user del local storeage
    setUser(null);
    setIsAuthenticated(false);
  };

  return (

    // Proporciona el contexto de autenticación a los componentes hijos
    // El valor del contexto incluye el usuario, el estado de autenticación, el estado de carga y las funciones de inicio y cierre de sesión
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
    // Si el contexto no está disponible, lanza un error
    // Esto es para asegurarse de que el hook solo se use dentro del AuthProvider
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};