import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import './LoginForm.css';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Preparar datos para la API
    const loginData = {
      email: formData.email,
      password: formData.password
    };

    const result = await login(loginData);
    setLoading(false);

    if (!result.success) {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="login-form">
      <h2 className="form-title">Inicia Sesion</h2>
      <form onSubmit={handleSubmit} className="login-form-content">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          error={errors.email}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Tu contraseña"
          error={errors.password}
          required
        />

        {errors.submit && (
          <div className="form-error">{errors.submit}</div>
        )}

        <Button 
          type="submit" 
          loading={loading}
          disabled={loading}
          className="login-button"
        >
          Iniciar Sesión
        </Button>

        <div className="form-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <button 
              type="button" 
              className="switch-link"
              onClick={onSwitchToRegister}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;