import React, { useState, useEffect } from "react";
import LibrosService from "../../services/api/LibrosService";
import Swal from "sweetalert2";
import { Edit, Trash2, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./Libros.css";

export default function Libros({ onBack }) {
  const { user, logout } = useAuth();
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
      const res = await LibrosService.getAllBooks();
      setBooks(res.data || []);
    } catch (err) {
      console.error("Error al obtener libros:", err);
      Swal.fire("Error", "No se pudieron obtener los libros", "error");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await LibrosService.updateBook(editingId, {
          ...form,
          year: Number(form.year),
          stock: Number(form.stock),
        });
        Swal.fire("Éxito", "Libro actualizado correctamente", "success");
      } else {
        await LibrosService.createBook({
          ...form,
          year: Number(form.year),
          stock: Number(form.stock),
        });
        Swal.fire("Éxito", "Libro creado correctamente", "success");
      }
      setForm({ title: "", author: "", editorial: "", year: "", category: "", isbn: "", stock: "" });
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      console.error("Error creando/actualizando libro:", err);
      Swal.fire("Error", "No se pudo guardar el libro", "error");
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

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Eliminar libro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await LibrosService.deleteBook(id);
          Swal.fire("Eliminado!", "El libro fue eliminado.", "success");
          fetchBooks();
        } catch (err) {
          console.error("Error eliminando libro:", err);
          Swal.fire("Error", "No se pudo eliminar el libro", "error");
        }
      }
    });
  };

  return (
    <div className="dashboard-capuchino p-4">
      {/* Navbar */}
      <nav className="navbar-capuchino mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h2 className="navbar-brand-cap mb-0">Gestión de Libros</h2>
          <span className="navbar-user">👤 {user?.username || user?.email}</span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light" onClick={onBack}>
            Volver al panel
          </button>
          <button className="btn btn-light" onClick={() => Swal.fire({
            title: "Perfil del usuario",
            html: `<b>Nombre:</b> ${user?.username}<br/><b>Email:</b> ${user?.email}<br/><b>Rol:</b> ${user?.role}`,
            confirmButtonColor: "#8B4513"
          })}>
            Ver Perfil
          </button>
          <button className="btn btn-danger" onClick={logout}>Cerrar sesión</button>
        </div>
      </nav>

      {/* Formulario Crear / Editar Libro */}
      <h3 className="mb-3">{editingId ? "Editar Libro" : "Crear Nuevo Libro"}</h3>
      <form className="bg-cream p-4 rounded shadow-sm mb-5" onSubmit={handleCreateOrUpdate}>
        <div className="row g-3">
          {["title","author","editorial","year","category","isbn","stock"].map((field) => (
            <div className="col-md-4" key={field}>
              <input
                type={field === "year" || field === "stock" ? "number" : "text"}
                className="form-control"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-dark mt-3" disabled={loading}>
          {loading ? "Guardando..." : editingId ? "Actualizar Libro" : "Crear Libro"}
        </button>
      </form>

      {/* Lista de libros tipo libro */}
      <h3>Libros existentes</h3>
      <div className="row g-4 mt-2">
        {books.map((book) => (
          <div key={book.id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="book-card-cap">
              <div className="book-figure">
                <div className="book-spine-cap" />
                <div className="book-front-cap">
                  <div>
                    <div className="book-title-cap">{book.title}</div>
                    <div className="book-author-cap">{book.author}</div>
                    <div className="book-meta-cap">{book.category}</div>
                  </div>
                  <div className="book-actions-cap">
                    <button className="btn btn-sm btn-outline-dark" onClick={() => handleEdit(book)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(book.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
