import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import './LoginForm.css';
// Footer simple para login
const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '1rem', color: '#5b3b2e', fontWeight: 500 }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
  );
};

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

    // Limpiar errores específicos del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validar formulario antes de enviar
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

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setErrors({ submit: result.error || 'Credenciales inválidas' });
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      setErrors({ submit: 'Error en el inicio de sesión. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2 className="form-title">Inicia Sesión</h2>

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
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
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
            <Footer />
      </form>
    </div>
  );
};

export default LoginForm;
