
// SistemaIntegral/frontend/SS/src/components/ProtectedRoute/ProtectedRoute.jsx


// Este componente es un contenedor para proteger rutas que requieren autenticación

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => { 
  const { isAuthenticated, loading } = useAuth(); // Extrae el estado de autenticación y carga del contexto de autenticación

  if (loading) { // Si está cargando, muestra un mensaje de carga
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) { // Si no está autenticado, redirige a la página de inicio de sesión
    return <Navigate to="/login" replace />; // Cambia la ruta a la que quieras redirigir al usuario no autenticado // el que no logro iniciar sesión
  }

  return children;// Si está autenticado, renderiza los hijos (la ruta protegida)
  // Esto permite que el componente hijo se muestre si el usuario está autenticado
};

export default ProtectedRoute;