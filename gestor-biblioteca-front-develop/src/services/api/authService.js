import axios from 'axios';

// Cambia esta URL por la de tu API .NET
const API_BASE_URL = 'http://localhost:5119/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
      const response = await api.post('/Auth/login', credentials);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error en el login';
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
      const message = error.response?.data?.message || error.message || 'Error en el registro';
      throw new Error(message);
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
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