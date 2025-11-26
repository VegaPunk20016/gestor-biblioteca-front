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
  const navigate = useNavigate();

  const API_BASE = "https://readhubbookv2.somee.com/api/Multas";

  useEffect(() => {
    if (user) fetchFines();
  }, [user]);

  const fetchFines = async () => {
    try {
      const res = await axios.get(`${API_BASE}/usuario/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFines(res.data);
    } catch (err) {
      console.error("Error fetching fines:", err);
      Swal.fire("Error", "No se pudieron cargar las multas", "error");
    }
  };

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
      await axios.put(`${API_BASE}/pagar/${fine.id}`, null, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Swal.fire("¡Pago exitoso!", "La multa ha sido pagada", "success");
      fetchFines();
    } catch (err) {
      console.error("Error paying fine:", err);
      Swal.fire("Error", "No se pudo pagar la multa", "error");
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
        <img src={logo} className="navbar-logo-icon" />
        <div className="navbar-user-info">
          <span className="navbar-user-name">
            👤 {user?.username || user?.email}
          </span>
          <span className="navbar-user-role">{user?.role}</span>
        </div>
      </div>
      <div className="navbar-actions">
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

  const Footer = () => (
    <footer className="landing-footer" style={{ textAlign: "center" }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
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
                  <th>Motivo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine, index) => (
                  <tr key={fine.id}>
                    <td>{index + 1}</td>
                    <td>{fine.amount}</td>
                    <td>{fine.reason}</td>
                    <td>{new Date(fine.date).toLocaleDateString()}</td>
                    <td>{fine.paid ? "Pagada" : "Pendiente"}</td>
                    <td>
                      {!fine.paid && (
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
      <Footer />
    </div>
  );
};

export default Multas;
