import React from 'react';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import './Login.css';

const Login = ({ onSwitchToRegister }) => {
  return (
    <div className="login-page">
      <div className="login-container">
        <LoginForm onSwitchToRegister={onSwitchToRegister} />
      </div>
    </div>
  );
};

export default Login;