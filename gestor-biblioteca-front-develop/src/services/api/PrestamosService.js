import axios from 'axios';

// Base URL del microservicio de Préstamos
const API_URL = 'https://readhubbookv2.somee.com/api/Prestamos';

// Función helper para incluir el token en las peticiones
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

class PrestamosService {
  
  // POST - Crear nuevo préstamo (Bibliotecario)
  // Endpoint: /api/Prestamos/PrestarBibliotecario
  async crearPrestamo(prestamoData) {
    try {
      console.log('📤 Creando préstamo:', prestamoData);
      const response = await axios.post(
        `${API_URL}/PrestarBibliotecario`, 
        prestamoData,
        { headers: getAuthHeaders() }
      );
      console.log('✅ Préstamo creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear préstamo:', error.response?.data || error);
      throw error;
    }
  }

  // PUT - Devolver un ítem prestado
  // Endpoint: /api/Prestamos/return-item/{loanItemId}
  // Body: { "quantity": number }
  async devolverItem(loanItemId, quantity) {
    try {
      console.log('📤 Devolviendo ítem:', { loanItemId, quantity });
      const response = await axios.put(
        `${API_URL}/return-item/${loanItemId}`,
        { quantity: parseInt(quantity) },
        { headers: getAuthHeaders() }
      );
      console.log('✅ Ítem devuelto:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al devolver ítem:', error.response?.data || error);
      throw error;
    }
  }

  // PUT - Renovar préstamo (Bibliotecario)
  // Endpoint: /api/Prestamos/RenovacionBibliotecario
  // Body: { "loanId": "guid", "extraDays": number }
  async renovarPrestamo(loanId, extraDays) {
    try {
      console.log('📤 Renovando préstamo:', { loanId, extraDays });
      const response = await axios.put(
        `${API_URL}/RenovacionBibliotecario`,
        { 
          loanId: loanId,
          extraDays: parseInt(extraDays)
        },
        { headers: getAuthHeaders() }
      );
      console.log('✅ Préstamo renovado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al renovar préstamo:', error.response?.data || error);
      throw error;
    }
  }

  // GET - Obtener todos los préstamos vencidos
  // Endpoint: /api/Prestamos/Prestamosvencidos
  async getPrestamosVencidos() {
    try {
      console.log('📤 Obteniendo préstamos vencidos');
      const response = await axios.get(
        `${API_URL}/Prestamosvencidos`,
        { headers: getAuthHeaders() }
      );
      console.log('✅ Préstamos vencidos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener préstamos vencidos:', error.response?.data || error);
      throw error;
    }
  }

  // GET - Obtener préstamos vencidos de un usuario específico
  // Endpoint: /api/Prestamos/Usuario/{userId}/Vencidos
  async getPrestamosVencidosUsuario(userId) {
    try {
      console.log('📤 Obteniendo préstamos vencidos del usuario:', userId);
      const response = await axios.get(
        `${API_URL}/Usuario/${userId}/Vencidos`,
        { headers: getAuthHeaders() }
      );
      console.log('✅ Préstamos vencidos del usuario obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener préstamos vencidos del usuario:', error.response?.data || error);
      throw error;
    }
  }

  // GET - Obtener préstamos de un usuario (adicional, útil para el dashboard)
  async getPrestamosUsuario(userId) {
    try {
      console.log('📤 Obteniendo préstamos del usuario:', userId);
      const response = await axios.get(
        `${API_URL}/Usuario/${userId}`,
        { headers: getAuthHeaders() }
      );
      console.log('✅ Préstamos del usuario obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener préstamos del usuario:', error.response?.data || error);
      throw error;
    }
  }
}

export default new PrestamosService();