// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login/Login';
import RegisterForm from './components/Registration/Registration';
import MainLayout from './components/MainLayout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ExpedientesPage from './components/Expedientes/ExpedientesPage';
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
        
        <Route path="/register" element={
          <ProtectedRoute>
            <MainLayout>
              <RegisterForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/expedientes" element={
          <ProtectedRoute>
            <MainLayout>
              <ExpedientesPage />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Ruta antigua /Layout para compatibilidad */}
        <Route path="/Layout" element={
          <ProtectedRoute>
            <Navigate to="/expedientes" />
          </ProtectedRoute>
        } />
        {/* Ruta antigua /Layout para compatibilidad */}
          <Route path="/Layout" element={
            <ProtectedRoute>
              <Navigate to="/userList" />
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