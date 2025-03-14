// src/components/Layout/MainLayout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="main-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isOpen ? '✕' : '☰'}
        </button>
        <div className="header-title">
          Sistema Integral de Expedientes
        </div>
        <div className="user-info">
          <span>{user?.username || 'Usuario'}</span>
          <button className="logout-btn" onClick={logout}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Menú Principal</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => navigateTo('/interno/expedientes')}>
                📁 Expedientes
              </button>
            </li>
            {user?.role === 'admin' && (
              <li>
                <button onClick={() => navigateTo('/interno/registrar')}>
                  👤 Registrar Usuario
                </button>
              </li>
            )}
            <li>
              <button onClick={() => navigateTo('/interno/estados')}>
                🔄 Estados
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className={`main-content ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;