import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import axios from "axios";
import "./Multas.css";

const MySwal = withReactContent(Swal);

const Multas = () => {
  const { user, logout } = useAuth();
  const [fines, setFines] = useState([]);
  const [allFines, setAllFines] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const navigate = useNavigate();

  const API_FINES = "https://readhubbookv2.somee.com/api/Multas";
  const API_USERS = "https://readhub.somee.com/api/Users/usuarios";

  useEffect(() => {
    if (user) {
      fetchUserFines();
      if (user.role === "Bibliotecario") {
        fetchAllUsers();
        fetchAllFines();
      }
    }
  }, [user]);

  // ---------- MULTAS DEL USUARIO ----------
  const fetchUserFines = async () => {
    try {
      const res = await axios.get(`${API_FINES}/usuario/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFines(res.data);
    } catch (err) {
      console.error("Error fetching fines:", err);
      Swal.fire("Error", "No se pudieron cargar las multas", "error");
    }
  };

  // ---------- LISTA COMPLETA DE USUARIOS ----------
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(API_USERS, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ---------- LISTA COMPLETA DE MULTAS ----------
  const fetchAllFines = async () => {
    try {
      const res = await axios.get(API_FINES, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAllFines(res.data);
    } catch (err) {
      console.error("Error fetching admin fines:", err);
    }
  };

  const getUserNameById = (id) => {
    const u = users.find((x) => x.id === id);
    return u ? u.username || u.email : "Desconocido";
  };

  // ---------- PAGO DE MULTA ----------
  const handlePayFine = async (fine) => {
    const { value: tarjeta } = await MySwal.fire({
      title: `Pagar Multa: $${fine.amount}`,
      html: `
        <input id="cardNumber" class="swal2-input" placeholder="Número de tarjeta" maxlength="16">
        <input id="cardName" class="swal2-input" placeholder="Nombre en la tarjeta">
        <input id="expiry" class="swal2-input" placeholder="MM/AA">
        <input id="cvv" class="swal2-input" placeholder="CVV" maxlength="3">
      `,
      showCancelButton: true,
      confirmButtonText: "Pagar",
      preConfirm: () => {
        const cardNumber = document.getElementById("cardNumber").value;
        const cardName = document.getElementById("cardName").value;
        const expiry = document.getElementById("expiry").value;
        const cvv = document.getElementById("cvv").value;
        if (!cardNumber || !cardName || !expiry || !cvv) {
          Swal.showValidationMessage("Completa todos los campos de la tarjeta");
          return false;
        }
        return { cardNumber, cardName, expiry, cvv };
      },
    });

    if (!tarjeta) return;

    try {
      await axios.put(`${API_FINES}/pagar/${fine.id}`, null, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      Swal.fire("¡Pago exitoso!", "La multa ha sido pagada", "success");

      fetchUserFines();
      fetchAllFines();
    } catch (err) {
      console.error("Error paying fine:", err);
      Swal.fire("Error", "No se pudo pagar la multa", "error");
    }
  };

  // ---------- LOGOUT ----------
  const handleLogout = () =>
    Swal.fire({ title: "¿Cerrar sesión?", showCancelButton: true }).then(
      (r) => r.isConfirmed && logout()
    );

  // ---------- NAVBAR ----------
  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} className="navbar-logo-icon" />
        <div className="navbar-user-info">
          <span className="navbar-user-name">
            👤 {user?.username || user?.email}
          </span>
          <span className="navbar-user-role">{user?.role}</span>
        </div>
      </div>

      <div className="navbar-actions">
        {user?.role === "Bibliotecario" && (
          <button
            className="nav-button nav-button--secondary"
            onClick={() => setShowAdminModal(true)}
          >
            Ver Multas Admin
          </button>
        )}

        <button
          className="nav-button nav-button--text"
          onClick={() =>
            Swal.fire({
              title: `${user?.username || user?.email}`,
              html: `<p><strong>Rol:</strong> ${user?.role}</p>
                     <p><strong>Email:</strong> ${user?.email}</p>`,
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

        <button
          className="nav-button nav-button--secondary"
          onClick={() => navigate("/usuario")}
        >
          ← Dashboard
        </button>
      </div>
    </nav>
  );

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <div className="dashboard-content container-fluid py-4">
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">💰 Gestión de Multas</h2>

          {fines.length === 0 ? (
            <p>No tienes multas pendientes.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Monto</th>
                  <th>Días atraso</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {fines.map((fine, index) => (
                  <tr key={fine.id}>
                    <td>{index + 1}</td>
                    <td>${fine.amount}</td>
                    <td>{fine.daysLate}</td>
                    <td>
                      {fine.createdAt
                        ? new Date(fine.createdAt).toLocaleDateString()
                        : "Sin fecha"}
                    </td>

                    <td>{fine.isPaid ? "Pagada" : "Pendiente"}</td>

                    <td>
                      {!fine.isPaid && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handlePayFine(fine)}
                        >
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* -------- MODAL ADMIN -------- */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📋 Multas Registradas</h3>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario</th>
                  <th>Monto</th>
                  <th>Días atraso</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {allFines.map((fine, i) => (
                  <tr key={fine.id}>
                    <td>{i + 1}</td>
                    <td>{getUserNameById(fine.userId)}</td>
                    <td>${fine.amount}</td>
                    <td>{fine.daysLate}</td>
                    <td>{new Date(fine.createdAt).toLocaleDateString()}</td>
                    <td>{fine.isPaid ? "Pagada" : "Pendiente"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="btn btn-danger mt-3"
              onClick={() => setShowAdminModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Multas;
