// Register.js

import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm/RegisterForm';
import './Register.css';
import '../Landing/Landing.css';
import logo from '../../assets/logo.png';

const Navbar = ({ onBackToLanding }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="ReadHub Logo" className="navbar-logo-icon" />
      </div>
      <div className="navbar-actions">
        <button 
          className="nav-button nav-button--text"
          onClick={onBackToLanding}
        >
          ← Volver al Inicio
        </button>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="landing-footer" style={{ textAlign: 'center', padding: '1rem', color: '#5b3b2e', fontWeight: 500 }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
  );
};

const Register = ({ onSwitchToLogin, onBackToLanding }) => {
  return (
    <div className="register-page-wrapper">
      <Navbar onBackToLanding={onBackToLanding} />
      <main className="register-main-content">
      <div className="register-container">
        <RegisterForm onSwitchToLogin={onSwitchToLogin} />
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;