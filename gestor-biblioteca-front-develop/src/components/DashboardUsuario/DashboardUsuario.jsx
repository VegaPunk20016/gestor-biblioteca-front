// DashboardUsuario.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LibrosService from "../../services/api/LibrosService";
import Loading from "../common/Loading/Loading";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./DashboardUsuario.css";
import "../../pages/Landing/Landing.css";

const MySwal = withReactContent(Swal);

const DashboardUsuario = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [viewFavorites, setViewFavorites] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const hoverTimeout = useRef(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [author, setAuthor] = useState("Todos");
  const [loading, setLoading] = useState(true);

  // Fetch books y favoritos
  useEffect(() => {
    if (!user) {
      MySwal.fire({ icon: "warning", title: "Necesitas iniciar sesión" }).then(() => logout?.());
      return;
    }
    fetchBooks();
    loadFavorites();
  }, [user]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await LibrosService.getAllBooks();
      setBooks(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudieron obtener los libros del servidor.",
        confirmButtonColor: "#8B4513",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const key = `favorites_${user?.id ?? "guest"}`;
      const saved = localStorage.getItem(key);
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      console.warn("No se pudo cargar favoritos", e);
    }
  };

  const saveFavorites = (newFavs) => {
    try {
      const key = `favorites_${user?.id ?? "guest"}`;
      setFavorites(newFavs);
      localStorage.setItem(key, JSON.stringify(newFavs));
    } catch (e) {
      console.warn("No se pudo guardar favoritos", e);
    }
  };

  const toggleFavorite = (book, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const exists = favorites.some((b) => b.id === book.id);
    const updated = exists ? favorites.filter((b) => b.id !== book.id) : [...favorites, book];

    if (exists) {
      MySwal.fire({ icon: "info", title: "Removido de favoritos", text: book.title, timer: 1100, showConfirmButton: false });
    } else {
      MySwal.fire({ icon: "success", title: "Añadido a favoritos", text: book.title, timer: 1100, showConfirmButton: false });
    }

    saveFavorites(updated);
  };

  // Filtro de libros
  useEffect(() => {
    let list = [...books];
    if (search) list = list.filter((b) => (b.title ?? "").toLowerCase().includes(search.toLowerCase()));
    if (category !== "Todos") list = list.filter((b) => b.category === category);
    if (author !== "Todos") list = list.filter((b) => b.author === author);
    setFiltered(list);
  }, [search, category, author, books]);

  const handlePrestamo = async () => {
    if (!user) return Swal.fire("Error", "Debes iniciar sesión", "error");
    if (favorites.length === 0) return Swal.fire("Error", "No tienes libros en favoritos", "error");

    const { value: prestamoData } = await Swal.fire({
      title: "Solicitar Préstamo",
      html: `
        <label>Días de préstamo:</label>
        <input id="loanDays" type="number" class="swal2-input" placeholder="Ej: 5" min="1">
        <h3>Libros a solicitar:</h3>
        ${favorites
          .map(
            (book) => `
          <div style="text-align:left; margin:10px 0;">
            <p><strong>${book.title || book.titulo}</strong></p>
            <label>Cantidad:</label>
            <input id="qty-${book.idLibro || book.id}" type="number" class="swal2-input" style="width:80px;" min="1" max="${book.stock}" placeholder="1">
          </div>
        `
          )
          .join("")}
      `,
      confirmButtonText: "Solicitar Préstamo",
      preConfirm: () => {
        const loanDays = document.getElementById("loanDays").value;
        if (!loanDays || loanDays <= 0) Swal.showValidationMessage("Ingresa los días del préstamo");

        const booksData = favorites
          .map((book) => {
            const bookId = book.idLibro || book.id;
            let qty = parseInt(document.getElementById(`qty-${bookId}`).value);
            if (!qty || qty < 1) qty = 1;
            return { bookId, requestedQuantity: qty };
          })
          .filter((b) => b.requestedQuantity > 0);

        if (booksData.length === 0) Swal.showValidationMessage("Debes seleccionar al menos 1 libro");

        return { loanDays, books: booksData };
      },
    });

    if (!prestamoData) return;

    try {
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + parseInt(prestamoData.loanDays));

      const response = await fetch("https://readhubbookv2.somee.com/api/SolicitudPrestamos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          returnDate: returnDate.toISOString(),
          books: prestamoData.books,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "No se pudo realizar la solicitud de préstamo");
      }

      Swal.fire({ icon: "success", title: "¡Solicitud enviada!", confirmButtonColor: "#8B4513" });
      saveFavorites([]);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "Error al solicitar préstamo", confirmButtonColor: "#8B4513" });
    }
  };

  const onCardMouseEnter = (book) => {
    clearTimeout(hoverTimeout.current);
    setHoverPreview(book);
  };

  const onCardMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoverPreview(null), 220);
  };

  if (loading) return <Loading size="large" />;

  const displayBooks = viewFavorites ? favorites : filtered;

  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} className="navbar-logo-icon" />
        <div className="navbar-user-info">
          <span className="navbar-user-name">👤 {user?.username || user?.email}</span>
          <span className="navbar-user-role">{user?.role}</span>
        </div>
      </div>
      <div className="navbar-actions">
        <button className="nav-button nav-button--text" onClick={() => setViewFavorites(!viewFavorites)}>
          Favoritos ({favorites.length})
        </button>
        <button className="nav-button nav-button--filled" onClick={handlePrestamo} disabled={favorites.length === 0}>
          Realizar Préstamo
        </button>
        <button className="nav-button nav-button--filled" onClick={() => navigate("/prestamos")}>
          📚 Ver mis Préstamos
        </button>
        <button className="nav-button nav-button--filled" onClick={() => navigate("/multas")}>
          💰 Mis Multas
        </button>
        <button className="nav-button nav-button--filled btn-danger" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="landing-footer" style={{ textAlign: "center", padding: "1rem", color: "#5b3b2e", fontWeight: 500 }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
  );

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <motion.div className="usuario-dashboard container-fluid py-4 dashboard-capuchino" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="dashboard-section mb-4">
          <h2 className="dashboard-section-title">{viewFavorites ? "Tus Favoritos" : "Todos los Libros"}</h2>
          <div className="row g-3">
            {displayBooks.map((book) => (
              <div key={book.id} className="col-sm-6 col-md-4 col-lg-3">
                <motion.div
                  className="book-card-cap dashboard-card"
                  whileHover={{ scale: 1.05, y: -5 }}
                  onMouseEnter={() => onCardMouseEnter(book)}
                  onMouseLeave={onCardMouseLeave}
                >
                  <div className="book-figure">
                    <div className="book-spine-cap"></div>
                    <div className="book-front-cap">
                      <div className="book-title-cap">{book.title}</div>
                      <div className="book-author-cap">{book.author}</div>
                      <div className="book-meta-cap">{book.category}</div>
                      <button className="btn btn-sm btn-warning mt-2" onClick={(e) => toggleFavorite(book, e)}>
                        {favorites.some((b) => b.id === book.id) ? "★ Favorito" : "☆ Favorito"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default DashboardUsuario;
