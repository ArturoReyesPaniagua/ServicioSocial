// src/components/MainLayout/MainLayout.jsx
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.css';
import logo from '../../assets/logo_sec_educ.png'; // Importamos el logo directamente parael header interno

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout-container">
      {/* Header institucional con el logo */}
      <header className="institutional-header">
        <div className="header__img">
          <img src={logo} alt="Logo institucional" className="header__logo" />
        </div>
        <div className="header__text">
          <p>
            <i>Subsecretaria de Educación Básica <br/>
            <strong>Unidad de Planeación, evaluación y control escolar</strong> <br/>
            Departamento de información y sistemas</i>  
          </p>
        </div>
      </header>
      
      {/* Header de navegación y menú */}
      <header className="main-header">
        <button 
          className="menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="header-title">
          Sistema de Gestión Integral
        </div>
        
        <div className="user-info">
          <span>{user?.username}</span>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Sidebar para navegación */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="text-xl font-bold">Menú Principal</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink 
                to="/expedientes" 
                className={({ isActive }) => 
                  isActive ? "bg-guinda-700" : ""
                }
              >
                {({ isActive }) => (
                  <button className={isActive ? "bg-guinda-700" : ""}>
                    Expedientes
                  </button>
                )}
              </NavLink>
            </li>

            {user?.role === 'admin' && (
              <li>
                <NavLink 
                  to="/userList" 
                  className={({ isActive }) => 
                    isActive ? "bg-guinda-700" : ""
                  }
                >
                  {({ isActive }) => (
                    <button className={isActive ? "bg-guinda-700" : ""}>
                      Lista de usuarios 
                    </button>
                  )}
                </NavLink>
              </li>
            )}
            {/* Puedes añadir más opciones de menú aquí */}
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;