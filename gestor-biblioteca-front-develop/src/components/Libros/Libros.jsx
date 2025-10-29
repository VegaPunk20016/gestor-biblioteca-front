import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import LibrosService from "../../services/api/LibrosService";
import "./Libros.css";

const initialFormState = {
  title: "",
  author: "",
  editorial: "",
  year: "",
  category: "",
  isbn: "",
  stock: "",
};

const Libros = ({ onBack }) => {
  const { logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [updateForm, setUpdateForm] = useState(initialFormState);
  const [deleteId, setDeleteId] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await LibrosService.getAllBooks();
      setBooks(response.data);
    } catch (error) {
      console.error("❌ Error al obtener libros:", error);
    }
  };

  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await LibrosService.createBook(form);
      setForm(initialFormState);
      fetchBooks();
    } catch (error) {
      console.error("❌ Error creando libro:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return alert("Selecciona un libro para actualizar");
    try {
      await LibrosService.updateBook(editingId, updateForm);
      setEditingId(null);
      setUpdateForm(initialFormState);
      fetchBooks();
    } catch (error) {
      console.error("❌ Error actualizando libro:", error);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteId) return alert("Ingresa un ID válido");
    try {
      await LibrosService.deleteBook(deleteId);
      setDeleteId("");
      fetchBooks();
    } catch (error) {
      console.error("❌ Error eliminando libro:", error);
    }
  };

  const selectForUpdate = (book) => {
    setEditingId(book.id);
    setUpdateForm({
      title: book.title,
      author: book.author,
      editorial: book.editorial || "",
      year: book.year,
      category: book.category,
      isbn: book.isbn,
      stock: book.stock,
    });
  };

  return (
    <div className="libros-page">
      {/* NAVBAR */}
      <nav className="libros-nav">
        <h1 className="libros-title">📚 ReadHub - Gestión de Libros</h1>
        <div className="libros-nav-actions">
          <button onClick={onBack} className="nav-btn volver">Volver</button>
          <button onClick={logout} className="nav-btn logout">Cerrar Sesión</button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="libros-container">
        {/* CREAR */}
        <div className="libros-card">
          <h2>➕ Crear Libro</h2>
          <form onSubmit={handleCreate} className="libros-form">
            {Object.keys(initialFormState).map((key) => (
              <input
                key={key}
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={form[key]}
                onChange={(e) => handleChange(e, setForm)}
                required
              />
            ))}
            <button type="submit" className="action-btn crear">Crear</button>
          </form>
        </div>

        {/* ACTUALIZAR */}
        <div className="libros-card">
          <h2>✏️ Actualizar Libro</h2>
          <form onSubmit={handleUpdate} className="libros-form">
            <select
              onChange={(e) => {
                const selected = books.find((b) => b.id === parseInt(e.target.value));
                if (selected) selectForUpdate(selected);
              }}
            >
              <option value="">Selecciona un libro</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>

            {Object.keys(initialFormState).map((key) => (
              <input
                key={key}
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={updateForm[key]}
                onChange={(e) => handleChange(e, setUpdateForm)}
                required
              />
            ))}
            <button type="submit" className="action-btn actualizar">Actualizar</button>
          </form>
        </div>

        {/* ELIMINAR */}
        <div className="libros-card">
          <h2>🗑️ Eliminar Libro</h2>
          <form onSubmit={handleDelete} className="libros-form eliminar">
            <input
              type="number"
              placeholder="ID del libro"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              required
            />
            <button type="submit" className="action-btn eliminar">Eliminar</button>
          </form>
        </div>

        {/* TABLA */}
        <div className="libros-card libros-table-container">
          <h2>📖 Lista de Libros</h2>
          <table className="libros-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Editorial</th>
                <th>Año</th>
                <th>Categoría</th>
                <th>ISBN</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.editorial}</td>
                  <td>{book.year}</td>
                  <td>{book.category}</td>
                  <td>{book.isbn}</td>
                  <td>{book.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Libros;
