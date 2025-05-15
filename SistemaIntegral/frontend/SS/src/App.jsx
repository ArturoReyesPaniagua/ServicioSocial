//App.jsx (actualizado)
// SistemaIntegral/frontend/SS/src/App.jsx
// Este archivo contiene la configuración de las rutas de la aplicación en React 

import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login/Login';
import MainLayout from './components/MainLayout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import OficiosPage from './components/Oficios/OficiosPage';
import UserPage from './components/userList/userPage';
import Reportepage from './components/Reporte/ReportePage';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/oficios" : "/login"} />} />
        
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/oficios" /> : <Login />
        } />
        
        {/* Ruta principal de oficios */}
        <Route path="/oficios" element={
          <ProtectedRoute>
            <MainLayout>
              <OficiosPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Ruta de lista de usuarios */}
        <Route path="/userList" element={
          <ProtectedRoute>
            <MainLayout>
              <UserPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Ruta de reportes */}
        <Route path="/Reporte" element={
          <ProtectedRoute>
            <MainLayout>
              <Reportepage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/expedientes" element={
          <ProtectedRoute>
            <Navigate to="/oficios" />
          </ProtectedRoute>
        } />
        
        <Route path="/Layout" element={
          <ProtectedRoute>
            <Navigate to="/oficios" />
          </ProtectedRoute>
        } />
        
        {/* Ruta para cualquier otra URL no definida */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;