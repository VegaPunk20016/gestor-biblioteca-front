import axios from "axios";

// 🔧 URL base de la API de Libros en producción
const API_BASE_URL = "https://readhubbookv2.somee.com/api";
const API_URL = `${API_BASE_URL}/Libros`;


// Función para incluir el token en los headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// 📚 CRUD de libros
const getAllBooks = () => axios.get(API_URL, getAuthHeaders());
const getBookById = (id) => axios.get(`${API_URL}/${id}`, getAuthHeaders());
const createBook = (book) => axios.post(API_URL, book, getAuthHeaders());
const updateBook = (id, book) =>
  axios.put(`${API_URL}/${id}`, book, getAuthHeaders());
const deleteBook = (id) => axios.delete(`${API_URL}/${id}`, getAuthHeaders());
const getAvailableBooks = () =>
  axios.get(`${API_URL}/LibrosDisponibles`, getAuthHeaders());

// 📘📌 ***AQUÍ AGREGAMOS LO DE PRÉSTAMOS***
const PrestamosAPI = `${API_BASE_URL}/Prestamos`;

const crearPrestamo = (payload) =>
  axios.post(`${PrestamosAPI}/PrestarBibliotecario`, payload, getAuthHeaders());

const renovarPrestamo = (payload) =>
  axios.put(`${PrestamosAPI}/RenovacionBibliotecario`, payload, getAuthHeaders());

const devolverItem = (loanItemId, quantity) =>
  axios.put(
    `${PrestamosAPI}/return-item/${loanItemId}`,
    { quantity },
    getAuthHeaders()
  );

const getPrestamosVencidos = () =>
  axios.get(`${PrestamosAPI}/Prestamosvencidos`, getAuthHeaders());

const getPrestamosVencidosUsuario = (userId) =>
  axios.get(`${PrestamosAPI}/Usuario/${userId}/Vencidos`, getAuthHeaders());

// Exportar TODO JUNTO
const LibrosService = {
  // libros
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAvailableBooks,

  // préstamos
  crearPrestamo,
  renovarPrestamo,
  devolverItem,
  getPrestamosVencidos,
  getPrestamosVencidosUsuario,
};

export default LibrosService;
