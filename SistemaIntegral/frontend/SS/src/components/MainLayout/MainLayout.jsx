// SistemaIntegral/frontend/SS/src/components/MainLayout/MainLayout.jsx
// Este componente es el diseño principal de la aplicación

import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import axios from 'axios';
import './MainLayout.css';
import logo from '../../assets/logo_sec_educ.png';  

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [areaName, setAreaName] = useState('');
  const [notificacionesCount, setNotificacionesCount] = useState(0);

  // Obtener el nombre del área al cargar el componente
  useEffect(() => {
    const fetchAreaName = async () => {
      if (user && user.id_area) {
        try {
          // Si el nombre del área ya viene en el usuario, usarlo
          if (user.nombre_area) {
            setAreaName(user.nombre_area);
            return;
          }
          
          // Si no, obtenerlo de la API
          const token = localStorage.getItem('token');
          if (!token) return;
          
          const response = await axios.get(`http://localhost:3001/api/areas/${user.id_area}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data && response.data.nombre_area) {
            setAreaName(response.data.nombre_area);
          }
        } catch (error) {
          console.error('Error al obtener nombre del área:', error);
        }
      }
    };
    
    fetchAreaName();
  }, [user]);

  // Obtener conteo de notificaciones no leídas
  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get('http://localhost:3001/api/notificaciones?solo_no_leidas=true', config);
        setNotificacionesCount(response.data.length);
      } catch (error) {
        console.error('Error al obtener notificaciones:', error);
      }
    };
    
    fetchNotificaciones();
    
    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(fetchNotificaciones, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

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
          {user && user.role !== 'admin' && areaName && (
            <div className="text-xs text-white opacity-80 mt-1">
              Área: {areaName}
            </div>
          )}
        </div>
        
        <div className="user-info">
          <div className="text-right">
            <span className="font-medium">{user?.username}</span>
            {user?.role && (
              <div className="text-xs opacity-80">
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
            )}
          </div>
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
          {user && user.role !== 'admin' && areaName && (
            <div className="mt-2 text-sm opacity-80 bg-guinda-dark p-2 rounded">
              Área: {areaName}
            </div>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink 
                to="/oficios" 
                className={({ isActive }) => 
                  isActive ? "bg-guinda-700" : ""
                }
              >
                {({ isActive }) => (
                  <button className={isActive ? "bg-guinda-700" : ""}>
                    📄 Gestión de Oficios
                  </button>
                )}
              </NavLink>
            </li>

            {/* Separador para sección UPEyCE */}
            <li className="px-4 py-2">
              <div className="text-xs text-white opacity-60 uppercase tracking-wider font-semibold border-b border-guinda-light pb-1">
                Sistema UPEyCE
              </div>
            </li>

            <li>
              <NavLink 
                to="/SolicitarUPEyCE" 
                className={({ isActive }) => 
                  isActive ? "bg-guinda-700" : ""
                }
              >
                {({ isActive }) => (
                    {/*
                  <button className={isActive ? "bg-guinda-700" : ""}>
                    <div className="flex items-center justify-between w-full">
                      <span>📝 Solicitar UPEyCE</span>
                      {notificacionesCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {notificacionesCount}
                        </span>
                      )}
                    </div>
                  </button>
                  */}
                )}
              </NavLink>
            </li>

            {/* Solo mostrar para administradores */}
            {user?.role === 'admin' && (
              <>
                <li>
                  <NavLink 
                    to="/UPEyCE" 
                    className={({ isActive }) => 
                      isActive ? "bg-guinda-700" : ""
                    }
                  >
                    {({ isActive }) => (
                    {/*
                      <button className={isActive ? "bg-guinda-700" : ""}>
                        🗂️ Gestión UPEyCE
                      </button>
                    */}
                    )}
                  </NavLink>
                </li>

                <li>
                  <NavLink 
                    to="/AdminSolicitudes" 
                    className={({ isActive }) => 
                      isActive ? "bg-guinda-700" : ""
                    }
                  >
                    {({ isActive }) => (
                      {/*
                      <button className={isActive ? "bg-guinda-700" : ""}>
                        ⚙️ Aprobar Solicitudes
                      </button>

                      */}
                   
                    )}
                  </NavLink>
                </li>
              </>
            )}

            {/* Separador para otras opciones */}
            <li className="px-4 py-2 mt-4">
              <div className="text-xs text-white opacity-60 uppercase tracking-wider font-semibold border-b border-guinda-light pb-1">
                Reportes y Admin
              </div>
            </li>

            <li>
              <NavLink 
                to="/Reporte" 
                className={({ isActive }) => 
                  isActive ? "bg-guinda-700" : ""
                }
              >
                {({ isActive }) => (
                  <button className={isActive ? "bg-guinda-700" : ""}>
                    📊 Generar Reporte
                  </button>
                )}
              </NavLink>
            </li>

            {/* Solo mostrar gestión de usuarios para administradores */}
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
                      👥 Lista de Usuarios 
                    </button>
                  )}
                </NavLink>
              </li>
            )}
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