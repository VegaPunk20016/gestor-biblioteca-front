import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import LibrosService from "../../services/api/LibrosService";
import { authService } from "../../services/api/authService";
import Swal from "sweetalert2";
import "./Dashboard.css";

const Dashboard = ({ setCurrentView }) => {
  const { user, logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Usuario");
  const [books, setBooks] = useState([]);

  // Cargar últimos 5 libros
  useEffect(() => {
    fetchLatestBooks();
  }, []);

  const fetchLatestBooks = async () => {
    try {
      const res = await LibrosService.getAllBooks();
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBooks(sorted.slice(0, 5));
    } catch (err) {
      console.error("Error obteniendo libros:", err);
    }
  };

  // Abrir modal asignar roles
  const openRoleModal = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
      setShowRoleModal(true);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    }
  };

  // Asignar rol
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      await authService.assignRole(selectedUser, selectedRole);
      Swal.fire(
        "Éxito",
        `Rol actualizado a ${selectedRole} para ${selectedUser.username}`,
        "success"
      );
      setShowRoleModal(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo actualizar el rol", "error");
    }
  };

  return (
    <motion.div
      className="dashboard-capuchino p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* NAVBAR */}
      <nav className="navbar-capuchino mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h2 className="navbar-brand-cap mb-0">📖 Read Hub</h2>
          <span className="navbar-user">👤 {user?.username || user?.email}</span>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-light"
            onClick={() => setCurrentView("dashboard")}
          >
            Volver al panel
          </button>
          <button className="btn btn-light" onClick={() => setShowProfile(true)}>
            Ver Perfil
          </button>
          <button className="btn btn-danger" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Panel de control tipo libro */}
      <h3 className="mb-3">Panel de Control</h3>
      <div className="row g-4 mb-5">
        {/* Gestionar Libros */}
        <div className="col-sm-6 col-md-4 col-lg-3">
          <div
            className="book-card-cap"
            onClick={() => setCurrentView("libros")}
          >
            <div className="book-figure">
              <div className="book-spine-cap"></div>
              <div className="book-front-cap">
                <h5 className="book-title-cap">📚 Gestionar Libros</h5>
                <p className="book-meta-cap">
                  Agrega, edita o elimina libros del catálogo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Asignar Roles */}
        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="book-card-cap" onClick={openRoleModal}>
            <div className="book-figure">
              <div className="book-spine-cap"></div>
              <div className="book-front-cap">
                <h5 className="book-title-cap">👥 Asignar Roles</h5>
                <p className="book-meta-cap">Gestiona permisos y roles de usuarios.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reportes */}
        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="book-card-cap">
            <div className="book-figure">
              <div className="book-spine-cap"></div>
              <div className="book-front-cap">
                <h5 className="book-title-cap">📈 Reportes</h5>
                <p className="book-meta-cap">
                  Visualiza estadísticas y actividad reciente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimos libros agregados */}
      <h3 className="mb-3">Últimos Libros Agregados</h3>
      <div className="d-flex gap-3 overflow-auto pb-3">
        {books.map((book) => (
          <div
            key={book.id}
            className="book-card-cap flex-shrink-0"
            style={{ minWidth: "200px" }}
          >
            <div className="book-figure">
              <div className="book-spine-cap"></div>
              <div className="book-front-cap">
                <div>
                  <div className="book-title-cap">{book.title}</div>
                  <div className="book-author-cap">{book.author}</div>
                  <div className="book-meta-cap">{book.category}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Perfil */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content-custom"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="profile-avatar">👤</div>
                <h3>Perfil del Usuario</h3>
              </div>
              <p><b>Nombre:</b> {user?.username}</p>
              <p><b>Email:</b> {user?.email}</p>
              <p><b>Rol:</b> {user?.role}</p>
              <button
                className="btn btn-secondary mt-2"
                onClick={() => setShowProfile(false)}
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Asignar Roles */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content-custom"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Asignar Rol</h3>
                <button
                  className="btn btn-light"
                  onClick={() => setShowRoleModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-3">
                <label>Usuario:</label>
                <select
                  className="form-select"
                  onChange={(e) =>
                    setSelectedUser(
                      users.find((u) => u.id === e.target.value)
                    )
                  }
                >
                  <option value="">Selecciona un usuario</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Rol:</label>
                <select
                  className="form-select"
                  onChange={(e) => setSelectedRole(e.target.value)}
                  value={selectedRole}
                >
                  <option value="Usuario">Usuario</option>
                  <option value="Bibliotecario">Bibliotecario</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleAssignRole}>
                  Asignar Rol
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
