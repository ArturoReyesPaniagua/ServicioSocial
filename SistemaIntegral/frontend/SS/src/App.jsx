// src/App.jsx
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
        <Route path="/" element={<Navigate to={isAuthenticated ? "/expedientes" : "/login"} />} />
        
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/expedientes" /> : <Login />
        } />
        
           
        <Route path="/expedientes" element={
          <ProtectedRoute>
            <MainLayout>
              <ExpedientesPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
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