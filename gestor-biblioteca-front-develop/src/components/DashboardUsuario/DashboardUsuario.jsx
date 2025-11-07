import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LibrosService from "../../services/api/LibrosService";
import Loading from "../common/Loading/Loading";
import { useAuth } from "../../hooks/useAuth";
import "./DashboardUsuario.css";

const MySwal = withReactContent(Swal);
const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '1rem', color: '#5b3b2e', fontWeight: 500 }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
  );
};
const DashboardUsuario = () => {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [viewFavorites, setViewFavorites] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // modal detalle
  const [hoverPreview, setHoverPreview] = useState(null); // preview on hover
  const hoverTimeout = useRef(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [author, setAuthor] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const Footer = () => {
  return (
    <footer className="footer-capuchino mt-5">
      <p className="m-0">
        Todos los Derechos Reservados © <b>ReadHub 2025 Byte Bugs</b>
      </p>
    </footer>
  );
};
  // load books & favorites
  useEffect(() => {
    if (!user) {
      MySwal.fire({
        icon: "warning",
        title: "Necesitas iniciar sesión",
      }).then(() => logout?.());
      return;
    }
    fetchBooks();
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await LibrosService.getAllBooks();
      setBooks(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error("Error al obtener libros:", err);
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
    // evita que el click en el corazón abra el modal
    if (e && e.stopPropagation) e.stopPropagation();

    const exists = favorites.some((b) => b.id === book.id);
    let updated;
    if (exists) {
      updated = favorites.filter((b) => b.id !== book.id);
      MySwal.fire({
        icon: "info",
        title: "Removido de favoritos",
        text: book.title,
        timer: 1100,
        showConfirmButton: false,
      });
    } else {
      updated = [...favorites, book];
      MySwal.fire({
        icon: "success",
        title: "Añadido a favoritos",
        text: book.title,
        timer: 1100,
        showConfirmButton: false,
      });
    }
    saveFavorites(updated);
  };

  // filtros reactivos
  useEffect(() => {
    let list = [...books];
    if (search)
      list = list.filter((b) =>
        (b.title ?? "").toLowerCase().includes(search.toLowerCase())
      );
    if (category !== "Todos") list = list.filter((b) => b.category === category);
    if (author !== "Todos") list = list.filter((b) => b.author === author);
    setFiltered(list);
  }, [search, category, author, books]);

  const handlePrestamo = () => {
    MySwal.fire({
      title: "Realizar préstamo",
      html:
        "<p>Aquí se abriría el formulario para solicitar préstamo (demo).</p>" +
        "<p>Se tomarían los favoritos o el carrito, fechas y usuario.</p>",
      confirmButtonColor: "#8B4513",
    });
  };

  // hover preview helpers: show on enter, hide after small delay on leave
  const onCardMouseEnter = (book) => {
    clearTimeout(hoverTimeout.current);
    setHoverPreview(book);
  };
  const onCardMouseLeave = () => {
    // delay to avoid flicker al mover el mouse a modal
    hoverTimeout.current = setTimeout(() => setHoverPreview(null), 220);
  };

  if (loading) return <Loading size="large" />;

  const displayBooks = viewFavorites ? favorites : filtered;

  return (
    <motion.div
      className="usuario-dashboard container-fluid py-3 dashboard-capuchino"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* NAV */}
      <nav className="navbar navbar-expand-lg navbar-capuchino rounded-3 mb-4 shadow">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
              <h2 className="mb-0 navbar-brand-cap"> 📚READHUB</h2>
               <h2 className="mb-0 navbar-brand-cap">Panel Principal</h2>
      <span className="navbar-user ms-3">👤 {user?.username ?? "Usuario"}</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn ${viewFavorites ? "btn-light" : "btn-outline-light"}`}
              onClick={() => setViewFavorites(!viewFavorites)}
            >
              {viewFavorites ? "Ver Catálogo" : "Mis Favoritos ❤️"}
            </button>

            <button className="btn btn-warning" onClick={handlePrestamo}>
              Realizar Préstamo
            </button>

            <button
              className="btn btn-info"
              onClick={() =>
                MySwal.fire({
                  title: "👤 Perfil de Usuario",
                  html: `<b>Nombre:</b> ${user?.username ?? user?.email ?? "Sin nombre"}<br/>
                         <b>Email:</b> ${user?.email ?? "—"}<br/>
                         <b>Favoritos:</b> ${favorites.length}`,
                  confirmButtonColor: "#8B4513",
                })
              }
            >
              Ver Perfil
            </button>

            <button
              className="btn btn-danger"
              onClick={() =>
                MySwal.fire({
                  title: "¿Cerrar sesión?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Sí, salir",
                  confirmButtonColor: "#8B4513",
                }).then((r) => r.isConfirmed && logout())
              }
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* FILTROS */}
      {!viewFavorites && (
        <div className="filters mb-4 p-3 bg-cream rounded shadow-sm">
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Todos</option>
                {[...new Set(books.map((b) => b.category).filter(Boolean))].map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select className="form-select" value={author} onChange={(e) => setAuthor(e.target.value)}>
                <option>Todos</option>
                {[...new Set(books.map((b) => b.author).filter(Boolean))].map((auth) => (
                  <option key={auth}>{auth}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2 d-flex justify-content-end">
              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  setSearch("");
                  setCategory("Todos");
                  setAuthor("Todos");
                }}
                title="Limpiar filtros"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRID LIBROS */}
      <div className="row g-4">
        {displayBooks.length === 0 ? (
          <div className="col-12 text-center text-muted py-6">
            <p>No se encontraron libros 😔</p>
          </div>
        ) : (
          displayBooks.map((book) => {
            const isFav = favorites.some((b) => b.id === book.id);
            return (
              <motion.div
                key={book.id}
                className="col-sm-6 col-md-4 col-lg-3"
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className="book-card-cap"
                  onMouseEnter={() => onCardMouseEnter(book)}
                  onMouseLeave={onCardMouseLeave}
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="book-figure">
                    <div className="book-spine-cap" />
                    <div className="book-front-cap">
                      <div className="book-title-cap">{book.title}</div>
                      <div className="book-author-cap">{book.author}</div>
                      <div className="book-meta-cap">{book.category}</div>

                      <div className="book-actions-cap">
                        <button
                          className="btn btn-sm btn-outline-light me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBook(book); // ver detalle por botón
                          }}
                        >
                          Ver detalle
                        </button>

                        <button
                          className={`fav-btn ${isFav ? "fav" : ""}`}
                          onClick={(e) => toggleFavorite(book, e)}
                          aria-label={isFav ? "Quitar favorito" : "Agregar a favoritos"}
                          title={isFav ? "Quitar favorito" : "Agregar a favoritos"}
                        >
                          <motion.span whileTap={{ scale: 0.85 }} className="heart-txt">
                            ♥
                          </motion.span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* PREVIEW SMALL al hacer hover */}
      <AnimatePresence>
        {hoverPreview && !selectedBook && (
          <motion.div
            className="hover-preview"
            key={hoverPreview.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <h5 className="mb-1">{hoverPreview.title}</h5>
            <p className="small mb-1"><b>Autor:</b> {hoverPreview.author}</p>
            {hoverPreview.editorial && <p className="small mb-1"><b>Editorial:</b> {hoverPreview.editorial}</p>}
            <p className="small text-muted mb-0"><b>Stock:</b> {hoverPreview.stock ?? "—"}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETALLE */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="modal-detail-cap"
              initial={{ scale: 0.9, y: -8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -8 }}
            >
              <h3>{selectedBook.title}</h3>
              <p><b>Autor:</b> {selectedBook.author}</p>
              <p><b>Categoría:</b> {selectedBook.category}</p>
              {selectedBook.editorial && <p><b>Editorial:</b> {selectedBook.editorial}</p>}
              {selectedBook.year && <p><b>Año:</b> {selectedBook.year}</p>}
              {selectedBook.isbn && <p><b>ISBN:</b> {selectedBook.isbn}</p>}
              <p><b>Stock:</b> {selectedBook.stock ?? "—"}</p>

              <div className="d-flex gap-2 justify-content-end mt-3">
                <button className="btn btn-secondary" onClick={() => setSelectedBook(null)}>Cerrar</button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    toggleFavorite(selectedBook);
                    setSelectedBook(null);
                  }}
                >
                  {favorites.some((b) => b.id === selectedBook.id) ? "Quitar favorito" : "Marcar favorito"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </motion.div>
    
  );
};

export default DashboardUsuario;
