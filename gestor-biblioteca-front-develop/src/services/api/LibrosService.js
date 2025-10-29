import axios from "axios";

// 🔧 Ajusta la URL base según tu backend real
const API_URL = "http://localhost:5000/api/Books";

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

// 📚 CRUD con autenticación
const getAllBooks = () => {
  return axios.get(API_URL, getAuthHeaders());
};

const getBookById = (id) => {
  return axios.get(`${API_URL}/${id}`, getAuthHeaders());
};

const createBook = (book) => {
  return axios.post(API_URL, book, getAuthHeaders());
};

const updateBook = (id, book) => {
  return axios.put(`${API_URL}/${id}`, book, getAuthHeaders());
};

const deleteBook = (id) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};

const LibrosService = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};

export default LibrosService;
