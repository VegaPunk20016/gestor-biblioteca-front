import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '../services/api/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
        } catch (error) {
          console.log('Token inválido o expirado:', error.message);
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔄 Iniciando proceso de login...');
      const response = await authService.login(credentials);
      
      localStorage.setItem('authToken', response.token);
      
      // Decodificar el JWT para obtener info básica
      const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
      
      const userData = {
        id: tokenPayload.sub,
        email: tokenPayload.email,
        username: tokenPayload.username
      };
      
      setUser(userData);
      console.log('✅ Login exitoso');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Iniciando proceso de registro...', userData);
      const response = await authService.register(userData);
      console.log('✅ Registro exitoso:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};