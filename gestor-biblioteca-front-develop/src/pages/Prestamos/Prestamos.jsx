import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";
import "./Prestamos.css";

const Prestamos = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = user?.token;

  const [solicitudes, setSolicitudes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [solicitudesRenovacion, setSolicitudesRenovacion] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [selectedRenovacion, setSelectedRenovacion] = useState(null);

  const cargarDatos = async () => {
    if (!token) return;

    // Solicitudes de préstamo: Bibliotecario/Administrador
    if (user?.role === "Bibliotecario" || user?.role === "Administrador") {
      try {
        const res = await fetch("https://readhubbookv2.somee.com/api/SolicitudPrestamos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar solicitudes");
        const data = await res.json();
        setSolicitudes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("No se pudieron cargar las solicitudes:", err);
        setSolicitudes([]);
      }
    }

    // Solicitudes de renovación: Bibliotecario/Administrador
    if (user?.role === "Bibliotecario" || user?.role === "Administrador") {
      try {
        const res = await fetch("https://readhubbookv2.somee.com/api/Renovaciones/RenovPendientes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar solicitudes de renovación");
        const data = await res.json();
        setSolicitudesRenovacion(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("No se pudieron cargar las solicitudes de renovación:", err);
        setSolicitudesRenovacion([]);
      }
    }

    // Préstamos vencidos del usuario (solo para usuario normal)
    try {
      const res = await fetch(
        `https://readhubbookv2.somee.com/api/Prestamos/Usuario/${user.id}/Vencidos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Error al cargar préstamos");
      const data = await res.json();
      setPrestamos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("No se pudieron cargar los préstamos:", err);
      setPrestamos([]);
      // De momento evitamos alert para no molestar al usuario
    }
  };

  useEffect(() => {
    if (!token) navigate("/dashboard");
    else cargarDatos();
  }, [token]);

  // ================== USUARIO ================== //

  const devolverItem = async (loanId, itemIndex) => {
    try {
      Swal.fire({ title: "Procesando...", didOpen: () => Swal.showLoading() });
      const item = prestamos.find((p) => p.loanId === loanId)?.items[itemIndex];
      if (!item) return;
      const res = await fetch(
        `https://readhubbookv2.somee.com/api/Prestamos/return-item/${item.loanItemId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: item.quantity }),
        }
      );
      if (!res.ok) throw new Error();
      Swal.fire("Devuelto", `El libro "${item.bookTitle}" fue devuelto.`, "success");
      cargarDatos();
    } catch {
      Swal.fire("Error", "No se pudo marcar como devuelto.", "error");
    }
  };

  const renovarPrestamo = async (loanId, extraDays = 30) => {
    try {
      Swal.fire({ title: "Procesando renovación...", didOpen: () => Swal.showLoading() });
      const res = await fetch(
        `https://readhubbookv2.somee.com/api/Renovaciones/solicitar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ loanId, extraDays }),
        }
      );
      if (!res.ok) throw new Error();
      Swal.fire("Renovado", "La solicitud de renovación se envió correctamente.", "success");
      cargarDatos();
    } catch {
      Swal.fire("Error", "No se pudo solicitar la renovación.", "error");
    }
  };

  // ================== BIBLIOTECARIO/ADMIN ================== //

  const aprobarSolicitud = async () => {
    try {
      Swal.fire({ title: "Procesando...", didOpen: () => Swal.showLoading() });
      const res = await fetch(
        "https://readhubbookv2.somee.com/api/SolicitudPrestamos/Aprobar",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            pendingLoanId: selectedSolicitud.id,
            approvedQuantity: selectedSolicitud.requestedQuantity,
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      Swal.fire("Aprobado", "La solicitud fue aprobada.", "success");
      setSelectedSolicitud(null);
      cargarDatos();
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo aprobar.", "error");
    }
  };

  const rechazarSolicitud = async () => {
    Swal.fire({ title: "¿Rechazar?", icon: "warning", showCancelButton: true, confirmButtonText: "Sí" })
      .then(async (res) => {
        if (!res.isConfirmed) return;
        try {
          const response = await fetch(
            `https://readhubbookv2.somee.com/api/SolicitudPrestamos/Rechazar/${selectedSolicitud.id}`,
            { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
          );
          if (!response.ok) throw new Error();
          Swal.fire("Rechazada", "La solicitud fue rechazada.", "success");
          setSelectedSolicitud(null);
          cargarDatos();
        } catch {
          Swal.fire("Error", "No se pudo rechazar.", "error");
        }
      });
  };

  const aprobarRenovacion = async (renovId) => {
    try {
      await fetch(`https://readhubbookv2.somee.com/api/Renovaciones/aprobar/${renovId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Aprobado", "La renovación fue aprobada.", "success");
      cargarDatos();
    } catch {
      Swal.fire("Error", "No se pudo aprobar la renovación.", "error");
    }
  };

  const rechazarRenovacion = async (renovId) => {
    try {
      await fetch(`https://readhubbookv2.somee.com/api/Renovaciones/rechazar/${renovId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Rechazada", "La renovación fue rechazada.", "success");
      cargarDatos();
    } catch {
      Swal.fire("Error", "No se pudo rechazar la renovación.", "error");
    }
  };

  const traducirEstado = (sol) =>
    sol.isApproved ? "Aprobado" : sol.isRejected ? "Rechazado" : "Pendiente";
  const colorEstado = (sol) =>
    sol.isApproved ? "green" : sol.isRejected ? "red" : "orange";

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
        <button className="nav-button nav-button--text" onClick={() => navigate("/dashboard")}>
          ← Volver al Dashboard
        </button>
        <button className="nav-button nav-button--filled" onClick={() => logout()}>
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

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <div className="container mt-3">
        {/* Solicitudes de préstamo: Bibliotecario */}
        {(user?.role === "Bibliotecario" || user?.role === "Administrador") && (
          <>
            <h2 className="dashboard-section-title mb-4">📖 Solicitudes de Préstamos</h2>
            <div className="row g-4">
              {solicitudes.map((sol) => (
                <div key={sol.id} className="col-md-4">
                  <motion.div
                    className="book-card-cap dashboard-card"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedSolicitud(sol)}
                  >
                    <div className="book-figure">
                      <div className="book-spine-cap"></div>
                      <div className="book-front-cap">
                        <h5 className="book-title-cap">📘 Solicitud</h5>
                        <p>
                          Usuario: <b>{sol.userId}</b>
                        </p>
                        <p>Cantidad: {sol.requestedQuantity}</p>
                        <p>
                          Estado:{" "}
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              color: "white",
                              backgroundColor: colorEstado(sol),
                            }}
                          >
                            {traducirEstado(sol)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Solicitudes de renovación: Bibliotecario */}
        {(user?.role === "Bibliotecario" || user?.role === "Administrador") && (
          <>
            <h2 className="dashboard-section-title mt-5">🔄 Solicitudes de Renovación</h2>
            <div className="row g-4">
              {solicitudesRenovacion.map((renov) => (
                <div key={renov.id} className="col-md-4">
                  <div className="book-card-cap dashboard-card">
                    <p>
                      Usuario: <b>{renov.userId}</b>
                    </p>
                    <p>Préstamo: {renov.loanId}</p>
                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-success" onClick={() => aprobarRenovacion(renov.id)}>
                        ✔ Aprobar
                      </button>
                      <button className="btn btn-danger" onClick={() => rechazarRenovacion(renov.id)}>
                        ✖ Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Préstamos del usuario */}
        <h2 className="dashboard-section-title mt-5">📌 Mis Préstamos</h2>
        {prestamos.length === 0 && <p>No hay préstamos vencidos.</p>}
        {prestamos.map((loan) => (
          <div key={loan.loanId} className="mb-3 p-2 border rounded">
            <p>
              <b>Usuario:</b> {loan.userId}
            </p>
            <p>
              <b>Préstamo:</b> {new Date(loan.loanDate).toLocaleDateString()} →{" "}
              {new Date(loan.returnDate).toLocaleDateString()}
            </p>
            <ul>
              {loan.items.map((item, idx) => (
                <li key={idx}>
                  {item.bookTitle} ({item.quantity}) -{" "}
                  <b style={{ color: item.isReturned ? "green" : "red" }}>
                    {item.isReturned ? "Devuelto" : "Pendiente"}
                  </b>
                  {!item.isReturned && (
                    <>
                      <button className="btn btn-sm btn-success ms-2" onClick={() => devolverItem(loan.loanId, idx)}>
                        Devolver
                      </button>
                      <button className="btn btn-sm btn-warning ms-1" onClick={() => renovarPrestamo(loan.loanId, 7)}>
                        Renovar 7 días
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Modal de solicitudes */}
        <AnimatePresence>
          {selectedSolicitud && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedSolicitud(null)}
            >
              <motion.div
                className="modal-content-custom"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Detalle de Solicitud</h3>
                <p>
                  <b>ID:</b> {selectedSolicitud.id}
                </p>
                <p>
                  <b>Usuario:</b> {selectedSolicitud.userId}
                </p>
                <p>
                  <b>Cantidad solicitada:</b> {selectedSolicitud.requestedQuantity}
                </p>
                <p>
                  <b>Estado:</b> {traducirEstado(selectedSolicitud)}
                </p>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-success w-50" onClick={aprobarSolicitud}>
                    ✔ Aprobar
                  </button>
                  <button className="btn btn-danger w-50" onClick={rechazarSolicitud}>
                    ✖ Rechazar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default Prestamos;
