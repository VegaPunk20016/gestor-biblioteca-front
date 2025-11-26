import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LibrosService from "../../services/api/LibrosService";
import Swal from "sweetalert2";
import { Edit, Trash2, X, Plus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Libros.css";
import "../../pages/Landing/Landing.css";
import logo from "../../assets/logo.png";

export default function Libros() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    editorial: "",
    year: "",
    category: "",
    isbn: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      Swal.fire({
        title: "Cargando libros...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      
      const res = await LibrosService.getAllBooks();
      setBooks(res.data || []);
      Swal.close();
    } catch (err) {
      console.error("Error al obtener libros:", err);
      const errorMessage = err.response?.data?.message || err.message || "No se pudieron obtener los libros";
      Swal.fire({
        icon: "error",
        title: "Error al cargar libros",
        text: errorMessage,
        confirmButtonColor: "#8B4513",
        confirmButtonText: "Entendido"
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "El título es requerido";
    if (!form.author.trim()) errors.author = "El autor es requerido";
    if (!form.category.trim()) errors.category = "La categoría es requerida";
    if (form.year && (isNaN(form.year) || form.year < 0 || form.year > new Date().getFullYear() + 1)) {
      errors.year = "Año inválido";
    }
    if (form.stock && (isNaN(form.stock) || form.stock < 0)) {
      errors.stock = "El stock debe ser un número positivo";
    }
    if (form.isbn && form.isbn.length > 20) {
      errors.isbn = "El ISBN es demasiado largo";
    }
    return errors;
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Datos inválidos",
        html: Object.values(errors).map(err => `<p>• ${err}</p>`).join(''),
        confirmButtonColor: "#8B4513",
        confirmButtonText: "Entendido"
      });
      return;
    }

    setLoading(true);
    try {
      Swal.fire({
        title: editingId ? "Actualizando libro..." : "Creando libro...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const bookData = {
        ...form,
        year: form.year ? Number(form.year) : null,
        stock: form.stock ? Number(form.stock) : 0,
      };

      if (editingId) {
        await LibrosService.updateBook(editingId, bookData);
        Swal.fire({
          icon: "success",
          title: "¡Libro actualizado!",
          text: "El libro ha sido actualizado correctamente.",
          confirmButtonColor: "#8B4513",
          confirmButtonText: "Perfecto"
        });
      } else {
        await LibrosService.createBook(bookData);
        Swal.fire({
          icon: "success",
          title: "¡Libro creado!",
          text: "El libro ha sido agregado al catálogo correctamente.",
          confirmButtonColor: "#8B4513",
          confirmButtonText: "Perfecto"
        });
      }

      setForm({ title: "", author: "", editorial: "", year: "", category: "", isbn: "", stock: "" });
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      console.error("Error creando/actualizando libro:", err);
      const errorMessage = err.response?.data?.message || err.message || "No se pudo guardar el libro";
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: errorMessage,
        confirmButtonColor: "#8B4513",
        confirmButtonText: "Entendido"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      editorial: book.editorial,
      year: book.year,
      category: book.category,
      isbn: book.isbn,
      stock: book.stock,
    });
    setEditingId(book.id);
  };

  const handleDelete = (book) => {
    Swal.fire({
      title: "¿Eliminar libro?",
      html: `<p>Estás a punto de eliminar:</p><p><b>${book.title}</b></p><p>Esta acción no se puede deshacer.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#8B4513",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: "Eliminando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          await LibrosService.deleteBook(book.id);
          Swal.fire({
            icon: "success",
            title: "¡Libro eliminado!",
            text: `"${book.title}" ha sido eliminado del catálogo.`,
            confirmButtonColor: "#8B4513",
            confirmButtonText: "Entendido"
          });
          fetchBooks();
        } catch (err) {
          console.error("Error eliminando libro:", err);
          const errorMessage = err.response?.data?.message || err.message || "No se pudo eliminar el libro";
          Swal.fire({
            icon: "error",
            title: "Error al eliminar",
            text: errorMessage,
            confirmButtonColor: "#8B4513",
            confirmButtonText: "Entendido"
          });
        }
      }
    });
  };

  const handleCancelEdit = () => {
    setForm({ title: "", author: "", editorial: "", year: "", category: "", isbn: "", stock: "" });
    setEditingId(null);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Estás seguro de que deseas salir de tu cuenta",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8B4513",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) logout();
    });
  };

  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="ReadHub Logo" className="navbar-logo-icon" />
        <div className="navbar-user-info">
          <span className="navbar-user-name">👤 {user?.username || user?.email || "Usuario"}</span>
          <span className="navbar-user-role">{user?.role || "Usuario"}</span>
        </div>
      </div>
      <div className="navbar-actions">
        <button className="nav-button nav-button--text" onClick={() => navigate("/dashboard")}>
          ← Volver al Panel
        </button>
        <button 
          className="nav-button nav-button--text"
          onClick={() => Swal.fire({
            title: "👤 Perfil del Usuario",
            html: `<b>Nombre:</b> ${user?.username || "No disponible"}<br/>
                   <b>Email:</b> ${user?.email || "No disponible"}<br/>
                   <b>Rol:</b> ${user?.role || "Usuario"}`,
            confirmButtonColor: "#8B4513",
            confirmButtonText: "Cerrar"
          })}
        >
          Ver Perfil
        </button>
        <button className="nav-button nav-button--filled" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="landing-footer" style={{ textAlign: 'center', padding: '1rem', color: '#5b3b2e', fontWeight: 500 }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
  );

  return (
    <div className="libros-wrapper">
      <Navbar />
      <motion.div
        className="libros-content container-fluid py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Formulario Crear / Editar Libro */}
        <div className="libros-section">
          <div className="form-header">
            <h2 className="section-title">
              {editingId ? "✏️ Editar Libro" : "➕ Crear Nuevo Libro"}
            </h2>
            {editingId && (
              <button className="btn-cancel-edit" onClick={handleCancelEdit}>
                <X size={18} /> Cancelar edición
              </button>
            )}
          </div>
          
          <motion.form 
            className="libros-form"
            onSubmit={handleCreateOrUpdate}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-custom">Título *</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="Título del libro"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Autor *</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="Nombre del autor"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Editorial</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="Nombre de la editorial"
                  name="editorial"
                  value={form.editorial}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Año</label>
                <input
                  type="number"
                  className="form-control-custom"
                  placeholder="Año de publicación"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Categoría *</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="Categoría del libro"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">ISBN</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="ISBN del libro"
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Stock</label>
                <input
                  type="number"
                  className="form-control-custom"
                  placeholder="Cantidad disponible"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  "Guardando..."
                ) : editingId ? (
                  <>
                    <Edit size={18} /> Actualizar Libro
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Crear Libro
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        {/* Lista de libros */}
        <div className="libros-section">
          <h2 className="section-title">📚 Libros Existentes ({books.length})</h2>
          {books.length === 0 ? (
            <div className="empty-state">
              <p className="text-muted">No hay libros en el catálogo aún. ¡Crea el primero!</p>
            </div>
          ) : (
            <div className="row g-4">
              <AnimatePresence>
                {books.map((book, index) => (
                  <motion.div 
                    key={book.id} 
                    className="col-sm-6 col-md-4 col-lg-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <motion.div 
                      className="book-card-cap"
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="book-figure">
                        <div className="book-spine-cap" />
                        <div className="book-front-cap">
                          <div>
                            <div className="book-title-cap">{book.title || "Sin título"}</div>
                            <div className="book-author-cap">{book.author || "Autor desconocido"}</div>
                            <div className="book-meta-cap">{book.category || "Sin categoría"}</div>
                            {book.stock !== undefined && (
                              <div className="book-stock-cap">Stock: {book.stock}</div>
                            )}
                          </div>
                          <div className="book-actions-cap">
                            <motion.button 
                              className="btn btn-sm btn-outline-dark" 
                              onClick={() => handleEdit(book)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Editar libro"
                            >
                              <Edit size={16} />
                            </motion.button>
                            <motion.button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => handleDelete(book)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Eliminar libro"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
