// SistemaIntegral/frontend/SS/src/components/Login/Login.jsx

// componente encargado de manejar el inicio de sesión de los usuarios

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación de campos vacíos porque pues la gente es muy olvidadiza xD
    if (!username.trim() || !password.trim()) {
      setError('El usuario y contraseña son obligatorios');
      return;
    }
    
    setLoading(true);
    try {
      //console.log('Intentando iniciar sesión con:', { username, password: '********' });
      
      const result = await login(username, password);
      //console.log('Resultado del login:', result);
      
      if (result.success) {
        // Redirigir a la página principal después de iniciar sesión
        navigate('/oficios'); //la pagina proncipal es oficios que muestra la lista de oficios pero aqui se puede cambiar a la pagina que se desee
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError('Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Encabezado con color guinda // color morena xD*/}
        <div className="bg-guinda p-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Iniciar Sesión
          </h2>
        </div>
        
        <div className="p-6">
          {/* Mensaje de error en caso de que no cargue o falle algo de los componentes deberia aparte mostrar el error que trae */}
          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de usuario del form de Login */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
            </div>
            
            {/* Campo de contraseña del form de login */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                autoComplete="on"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda"
              />
            </div>
            
            {/* Botón de envío  bien bonito*/}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-guinda hover:bg-guinda-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-guinda disabled:bg-guinda-light disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando...
                  </div>
                ) : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;