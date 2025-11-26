import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import './LoginForm.css';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email demasiado largo';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // limpiar errores previos

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setErrors({ submit: result.error || 'Credenciales incorrectas' });
      }

    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setErrors({ submit: 'Error al iniciar sesión. Inténtalo de nuevo.' });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <div className="login-header">
        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">Ingresa tus credenciales para acceder a tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form-content">
        <div className="form-section">

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

        </div>

        {errors.submit && (
          <div className="form-error">{errors.submit}</div>
        )}

        <div className="form-actions">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>

          <Button
            type="button"
            className="switch-login-button"
            onClick={onSwitchToRegister}
          >
            ¿No tienes cuenta? Regístrate aquí
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
