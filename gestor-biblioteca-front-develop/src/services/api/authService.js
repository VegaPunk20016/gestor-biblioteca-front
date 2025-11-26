import axios from 'axios';

// URL base de la API en producción
const API_BASE_URL = 'https://readhub.somee.com/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado a 30 segundos
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      console.log('📤 Enviando credenciales de login a la API:', { email: credentials.email });
      const response = await api.post('/Auth/login', credentials);
      console.log('✅ Respuesta del login:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Manejo específico de errores
      let message = 'Error en el login';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'La solicitud está tardando demasiado. Por favor verifica tu conexión a internet e intenta nuevamente.';
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        message = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.response?.status === 401) {
        message = 'Credenciales inválidas. Verifica tu email y contraseña.';
      } else if (error.response?.status === 404) {
        message = 'El servicio de autenticación no está disponible.';
      } else if (error.response?.status === 500) {
        const serverMessage = error.response?.data?.message || error.response?.data?.error;
        message = serverMessage || 'Error interno del servidor. Por favor intenta más tarde o contacta al administrador.';
      } else if (error.response?.status >= 500) {
        message = 'Error del servidor. Por favor intenta más tarde.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      throw new Error(message);
    }
  },

  async register(userData) {
    try {
      console.log('📤 Enviando datos de registro a la API:', userData);
      const response = await api.post('/Auth/register', userData);
      console.log('✅ Respuesta del registro:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      // Manejo específico de errores
      let message = 'Error en el registro';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'La solicitud está tardando demasiado. Por favor verifica tu conexión a internet e intenta nuevamente.';
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        message = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.response?.status === 400) {
        message = error.response?.data?.message || 'Datos inválidos. Verifica la información ingresada.';
      } else if (error.response?.status === 409) {
        message = 'El usuario ya existe. Intenta con otro email.';
      } else if (error.response?.status === 500) {
        const serverMessage = error.response?.data?.message || error.response?.data?.error;
        message = serverMessage || 'Error interno del servidor. Por favor intenta más tarde o contacta al administrador.';
      } else if (error.response?.status >= 500) {
        message = 'Error del servidor. Por favor intenta más tarde.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      throw new Error(message);
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/Auth/profile');
      return response.data;
    } catch (error) {
      // Si es 404, es normal que no exista el endpoint de perfil, no lanzar error
      if (error.response?.status === 404) {
        console.log('Endpoint de perfil no disponible, continuando sin perfil');
        return null;
      }
      const message = error.response?.data?.message || error.message || 'Error al obtener perfil';
      throw new Error(message);
    }
  },
  async getAllUsers() {
    try {
      const response = await api.get('/Auth/users'); // 🔹 Asegúrate que tu backend tenga este endpoint
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener usuarios');
    }
  },

  async assignRole(userId, role) {
    try {
      const response = await api.put(`/Role/assign/${userId}`, { role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error al asignar rol');
    }
  },
};

export default api;