// userForm.jsx
// SistemaIntegral/frontend/SS/src/components/userList/userForm.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user: currentUser } = useAuth();

  // Inicializar el formulario con datos del usuario si existe
  useEffect(() => {
    if (user) {
      // Al editar, no incluimos la contraseña ya que generalmente no deberia de ser visible
      // y se espera que el usuario la ingrese nuevamente si desea cambiarla
      setFormData({
        userId: user.userId,
        username: user.username,
        role: user.role || 'user', // Valor por defecto en caso de que no venga role
        password: '' // Contraseña vacía para edición
      });
    } else {
      // Si es nuevo usuario, resetear el formulario
      setFormData({
        username: '',
        password: '',
        role: 'user'
      });
    }
  }, [user]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) newErrors.username = 'El nombre de usuario es obligatorio';
    
    // Solo validar contraseña en creación o si se proporciona al editar
    if (!user && !formData.password) {
      newErrors.password = 'La contraseña es obligatoria para nuevos usuarios';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.role) newErrors.role = 'El rol es obligatorio';
    
    // Validar si está intentando cambiar su propio rol (si es administrador)
    if (user && user.userId === currentUser?.userId && user.role === 'admin' && formData.role !== 'admin') {
      newErrors.role = 'No puede cambiar su propio rol de administrador';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log("Enviando datos del formulario:", {
        ...formData,
        password: formData.password ? '********' : '[sin cambios]'
      });
      
      // Si estamos editando y no se proporciona contraseña, la omitimos del envío
      const submitData = {...formData};
      if (user && !submitData.password) {
        delete submitData.password;
      }
      
      await onSave(submitData);
      // onSave maneja la redirección o cierre del modal
    } catch (error) {
      console.error('Error guardando usuario:', error);
      
      // Mejorar el manejo de errores del servidor
      let errorMessage = 'Error al guardar usuario';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'El nombre de usuario ya está registrado';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alternar visibilidad de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {user ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
              type="button"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.submit && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p>{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario *
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda`}
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600" id="username-error">{errors.username}</p>
              )}
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {user ? 'Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda pr-10`}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" id="password-error">{errors.password}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isSubmitting || (user?.userId === currentUser?.userId && user?.role === 'admin')}
                className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-guinda focus:border-guinda`}
                aria-invalid={errors.role ? "true" : "false"}
                aria-describedby={errors.role ? "role-error" : undefined}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600" id="role-error">{errors.role}</p>
              )}
              {user?.userId === currentUser?.userId && user?.role === 'admin' && (
                <p className="mt-1 text-xs text-gray-500">No puede cambiar su propio rol de administrador.</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {user ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  user ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;