//App.jsx
// SistemaIntegral/frontend/SS/src/App.jsx
// Este archivo contiene la configuaracion de las rutas de la aplicacion en react 

import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login/Login';
//import RegisterForm from './components/Registration/Registration'; componente eliminado para integrarlo en tabla de usuarios 
import MainLayout from './components/MainLayout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ExpedientesPage from './components/Expedientes/ExpedientesPage';
import UserPage from './components/userList/userPage';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth(); // Importa el contexto de autenticación para verificar el estado de autenticación del usuario
  // loading es un estado que indica si la aplicacion esta cargando o no

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
        <Route path="/" element={<Navigate to={isAuthenticated ? "/expedientes" : "/login"} />} />
        
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/expedientes" /> : <Login />
        } />
        
           
        {/* Ruta de lista de lista expedientes // es la utilidad de expedientes  */}
        <Route path="/expedientes" element={
          <ProtectedRoute>
            <MainLayout>
              <ExpedientesPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Ruta de lista de usuarios // es la utilidad de expedientes  */}
        <Route path="/userList" element={
          <ProtectedRoute>
            <MainLayout>
              <UserPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Ruta antigua /Layout para compatibilidad */}
        <Route path="/Layout" element={
          <ProtectedRoute>
            <Navigate to="/expedientes" />
          </ProtectedRoute>
        } />
        
        {/* Ruta para la página de registro (eliminada) */}
        {/* <Route path="/register" element={<RegisterForm />} /> */}
        {/* Ruta para la página de inicio (eliminada) */}
        {/* <Route path="/home" element={<Home />} /> */}
        
        
       
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