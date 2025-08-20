// SistemaIntegral/frontend/SS/src/components/MainLayout/MainLayout.jsx
// Layout principal actualizado con contador de notificaciones funcional

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
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Configuración de API corregida
  const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const fallbackUrl = 'http://localhost:3001/api';
    
    if (envUrl && envUrl !== 'undefined' && envUrl.trim() !== '') {
      return envUrl;
    }
    
    return fallbackUrl;
  };
  
  const API_URL = getApiUrl();

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

          const response = await axios.get(
            `${API_URL}/areas/${user.id_area}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (response.data && response.data.nombre_area) {
            setAreaName(response.data.nombre_area);
          }
        } catch (error) {
          console.error('Error al obtener nombre del área:', error);
        }
      }
    };
   
    fetchAreaName();
  }, [user, API_URL]);

  // Función para obtener conteo de notificaciones (CORREGIDA)
  const fetchNotificacionesCount = async () => {
    if (!user) return;
    
    try {
      setIsLoadingNotifications(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      console.log('🔔 Obteniendo conteo de notificaciones desde MainLayout...');
      console.log('🌐 API_URL:', API_URL);

      // Usar el endpoint específico para conteo
      const response = await axios.get(`${API_URL}/notificaciones/conteo`, config);
      
      const nuevoConteo = response.data?.no_leidas || 0;
      console.log('📊 Conteo de notificaciones actualizado:', nuevoConteo);
      
      setNotificacionesCount(nuevoConteo);
    } catch (error) {
      console.error('❌ Error al obtener conteo de notificaciones:', error);
      
      // Fallback: intentar con el endpoint original
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get(`${API_URL}/notificaciones`, config);
        const noLeidas = response.data.filter(n => !n.leida).length;
        setNotificacionesCount(noLeidas);
        console.log('📊 Conteo obtenido con fallback:', noLeidas);
      } catch (fallbackError) {
        console.error('❌ Error en fallback de notificaciones:', fallbackError);
        // En caso de error, mantener el conteo actual
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Función para refrescar notificaciones (expuesta globalmente)
  const refrescarNotificaciones = () => {
    console.log('🔄 Refrescando notificaciones desde MainLayout...');
    fetchNotificacionesCount();
  };

  // Obtener conteo inicial y configurar polling
  useEffect(() => {
    if (user) {
      // Cargar inicial
      fetchNotificacionesCount();
      
      // Configurar intervalo de actualización cada 30 segundos
      const interval = setInterval(fetchNotificacionesCount, 30000);
      
      // Exponer función globalmente para que otros componentes puedan usarla
      window.refrescarNotificaciones = refrescarNotificaciones;
      
      return () => {
        clearInterval(interval);
        delete window.refrescarNotificaciones;
      };
    }
  }, [user, API_URL]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Función para navegar a notificaciones y marcar como visto
  const handleNotificacionesClick = () => {
    // Aquí puedes navegar a una página de notificaciones si la tienes
    // navigate('/notificaciones');
    console.log('📱 Click en notificaciones - función por implementar');
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
      
      {/* Header de navegación */}
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
          Sistema de Gestión Integral Oficios
          {user && user.role !== 'admin' && areaName && (
            <div className="text-xs text-white opacity-80 mt-1">
              Área: {areaName}
            </div>
          )}
        </div>
        
        <div className="user-info">
          {/* CONTADOR DE NOTIFICACIONES */}
          <div className="relative mr-4">
            <button
              onClick={handleNotificacionesClick}
              className="relative p-2 text-white hover:bg-guinda-light rounded-full transition-colors"
              title="Notificaciones"
            >
              {/* Icono de notificaciones */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
              {/* Badge de conteo */}
              {notificacionesCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                  {notificacionesCount > 99 ? '99+' : notificacionesCount}
                </div>
              )}
              
              {/* Indicador de carga */}
              {isLoadingNotifications && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>

          <div className="text-right">
            <span className="font-medium">{user?.username}</span>
            {user?.role && (
              <div className="text-xs opacity-80">
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
            )}
          </div>
          <button 
            className="logout-btn ml-3"
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
            <li className="px-4 py-2">
              <div className="text-xs text-white opacity-60 uppercase tracking-wider font-semibold border-b border-guinda-light pb-1">
                Manejo de Oficios
              </div>
            </li>
            <li>
              <NavLink 
                to="/oficios" 
                className={({ isActive }) => 
                  isActive ? "bg-guinda-700" : ""
                }
              >
                {({ isActive }) => (
                  <button className={isActive ? "bg-guinda-700" : ""}>
                    📄 Oficios
                  </button>
                )}
              </NavLink>
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
                    📊 Reportes
                  </button>
                )}
              </NavLink>
            </li>

            {/* Sección UPEyCE */}
            <li className="px-4 py-2 mt-4">
              <div className="text-xs text-white opacity-60 uppercase tracking-wider font-semibold border-b border-guinda-light pb-1">
                UPEyCE
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
                  <button className={isActive ? "bg-guinda-700" : ""}>
                    📝 Solicitar UPEyCE
                    {notificacionesCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {notificacionesCount}
                      </span>
                    )}
                  </button>
                )}
              </NavLink>
            </li>

            {/* Solo mostrar gestión para administradores */}
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
                      <button className={isActive ? "bg-guinda-700" : ""}>
                        🗃️ Gestión UPEyCE
                      </button>
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
                      <button className={isActive ? "bg-guinda-700" : ""}>
                        👥 Admin Solicitudes
                        {notificacionesCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {notificacionesCount}
                          </span>
                        )}
                      </button>
                    )}
                  </NavLink>
                </li>
                
                {/* Sección Administración */}
                <li className="px-4 py-2 mt-4">
                  <div className="text-xs text-white opacity-60 uppercase tracking-wider font-semibold border-b border-guinda-light pb-1">
                    Administración
                  </div>
                </li>
                <li>
                  <NavLink 
                    to="/userList" 
                    className={({ isActive }) => 
                      isActive ? "bg-guinda-700" : ""
                    }
                  >
                    {({ isActive }) => (
                      <button className={isActive ? "bg-guinda-700" : ""}>
                        👤 Usuarios
                      </button>
                    )}
                  </NavLink>
                </li>
              </>
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