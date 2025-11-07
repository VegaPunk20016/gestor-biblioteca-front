// Register.js

import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm/RegisterForm';
import './Register.css';

const Register = ({ onSwitchToLogin }) => {
  return (
    // CAMBIO CLAVE: Usamos una clase para centrar el formulario en la página
    <div className="auth-page-centered"> 
      <div className="register-container">
        {/* El título grande "Regístrate" se renderiza DENTRO del RegisterForm */}
        <RegisterForm onSwitchToLogin={onSwitchToLogin} />
      </div>
    </div>
  );
};

export default Register;