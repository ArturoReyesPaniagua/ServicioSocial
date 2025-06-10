
// SistemaIntegral/frontend/SS/src/components/ProtectedRoute/ProtectedRoute.jsx


// Este componente es un contenedor para proteger rutas que requieren autenticación

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => { // Componente que protege rutas que requieren autenticación
  const { isAuthenticated, loading } = useAuth(); // Extrae el estado de autenticación y carga del contexto de autenticación

  if (loading) { // Si está cargando, muestra un mensaje de carga
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) { // Si no está autenticado, redirige a la página de inicio de sesión
    return <Navigate to="/login" replace />; // Cambia la ruta a la que quieras redirigir al usuario no autenticado // el que no logro iniciar sesión
  }

  return children;
};

export default ProtectedRoute;