import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import LibrosService from "../../services/api/LibrosService";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Dashboard.css";
import "../Landing/Landing.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestBooks();
  }, []);

  const fetchLatestBooks = async () => {
    try {
      const res = await LibrosService.getAllBooks();
      const allBooks = res.data || [];
      const sorted = allBooks.sort(
        (a, b) =>
          a.createdAt && b.createdAt
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : (b.id || 0) - (a.id || 0)
      );
      setBooks(sorted.slice(0, 5));
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const handleLogout = () => {
    Swal.fire({ title: "¿Cerrar sesión?", showCancelButton: true }).then(
      (r) => r.isConfirmed && logout()
    );
  };

  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} className="navbar-logo-icon" alt="logo" />
        <div className="navbar-user-info">
          <span className="navbar-user-name">👤 {user?.username || user?.email}</span>
          <span className="navbar-user-role">{user?.role}</span>
        </div>
      </div>
      <div className="navbar-actions">
        <button
          className="nav-button nav-button--text"
          onClick={() =>
            Swal.fire({
              title: `${user?.username || user?.email}`,
              html: `
                <p><strong>Rol:</strong> ${user?.role}</p>
                <p><strong>Email:</strong> ${user?.email}</p>
              `,
              icon: "info",
              confirmButtonText: "Cerrar",
            })
          }
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
    <footer className="landing-footer" style={{ textAlign: "center" }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
  );

  // Cards del panel de control con descripción
  const cards = [
    {
      title: "📚 Gestionar Libros",
      desc: "Agregar, editar y eliminar libros del catálogo.",
      route: "/libros",
    },
    {
      title: "📖 Gestionar Préstamos",
      desc: "Ver y aprobar solicitudes de préstamo de libros.",
      route: "/prestamos",
    },
    {
      title: "💰 Gestionar Multas",
      desc: "Visualizar y registrar pagos de multas de todos los usuarios.",
      route: "/multas",
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <motion.div
        className="dashboard-content container-fluid py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Panel de Control */}
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Panel de Control</h2>
          <div className="row g-4 mb-5">
            {cards.map((card, index) => (
              <div className="col-sm-6 col-md-4 col-lg-3" key={index}>
                <motion.div
                  className="book-card-cap dashboard-card"
                  onClick={() => navigate(card.route)}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="book-figure">
                    <div className="book-spine-cap"></div>
                    <div className="book-front-cap">
                      <h5 className="book-title-cap">{card.title}</h5>
                      <p className="book-desc-cap">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos libros */}
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Últimos Libros</h2>
          <div className="books-scroll-container">
            {books.map((book) => (
              <motion.div
                key={book.id}
                className="book-card-cap flex-shrink-0"
                style={{ minWidth: 200 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="book-figure">
                  <div className="book-spine-cap"></div>
                  <div className="book-front-cap">
                    <div className="book-title-cap">{book.title}</div>
                    <div className="book-author-cap">{book.author}</div>
                    <div className="book-meta-cap">{book.category}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Dashboard;
