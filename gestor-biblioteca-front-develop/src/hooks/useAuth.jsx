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
        if (userProfile) {
          setUser({
            ...userProfile,
            token: token // 👈 AGREGAR EL TOKEN
          });
        } else {
          // Si no hay perfil pero hay token, intentar decodificar el token
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const tokenPayload = JSON.parse(atob(tokenParts[1]));
              setUser({
                id: tokenPayload.sub || tokenPayload.id,
                email: tokenPayload.email,
                username: tokenPayload.username || tokenPayload.name || tokenPayload.unique_name,
                role: tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] 
                      || tokenPayload.role 
                      || "Usuario",
                token: token // 👈 AGREGAR EL TOKEN
              });
            }
          } catch (tokenError) {
            console.log('No se pudo decodificar el token');
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('Token inválido o expirado:', error.message);
          localStorage.removeItem('authToken');
        } else {
          console.log('Error al obtener perfil, pero el token puede ser válido:', error.message);
        }
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
    console.log('📦 Respuesta completa del login:', response);

    // Verificar que la respuesta tenga un token
    let token;
    if (typeof response.data === 'string') {
      token = response.data;
    } else if (response.data?.token) {
      token = response.data.token;
    } else if (response.token) {
      token = response.token;
    } else if (response.accessToken) {
      token = response.accessToken;
    }
    
    if (!token) {
      console.error('❌ No se recibió token en la respuesta:', response);
      throw new Error('No se recibió token de autenticación');
    }

    // Guardar token
    localStorage.setItem('authToken', token);

    // Decodificar el JWT para obtener datos del usuario
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Token JWT inválido');
      }
      
      const tokenPayload = JSON.parse(atob(tokenParts[1]));

      const userData = {
        id: tokenPayload.sub || tokenPayload.id || tokenPayload.userId,
        email: tokenPayload.email || credentials.email,
        username: tokenPayload.username || tokenPayload.name || tokenPayload.unique_name,
        role: tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] 
              || tokenPayload["role"]
              || tokenPayload.role 
              || "Usuario",
        token: token // 👈 AGREGAR EL TOKEN AQUÍ
      };

      setUser(userData);
      console.log('✅ Login exitoso:', userData);
      return { success: true };
    } catch (tokenError) {
      console.error('❌ Error al decodificar token:', tokenError);
      // Aún así guardamos el token y creamos un usuario básico
      const userData = {
        id: null,
        email: credentials.email,
        username: credentials.email,
        role: "Usuario",
        token: token // 👈 AGREGAR EL TOKEN AQUÍ TAMBIÉN
      };
      setUser(userData);
      return { success: true };
    }

  } catch (error) {
    console.error('❌ Error en login:', error);
    return { 
      success: false, 
      error: error.message || 'Error al iniciar sesión'
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