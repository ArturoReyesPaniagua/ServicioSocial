import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import RegisterForm from './components/Registration/Registration';
import MainLayout from './components/MainLayout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import ExpedientesPage from './components/Expedientes/ExpedientesPage'; // Crearemos este componente después

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/Layout" : "/login"} />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/register" 
        element={
          <ProtectedRoute>
            <RegisterForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Layout" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/expedientes" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <ExpedientesPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;