import React from 'react';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import './Login.css';
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

const Login = ({ onSwitchToRegister, onBackToLanding }) => {
  return (
    <div className="login-page-wrapper">
      <Navbar onBackToLanding={onBackToLanding} />
      <main className="login-main-content">
      <div className="login-container">
        <LoginForm onSwitchToRegister={onSwitchToRegister} />
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;