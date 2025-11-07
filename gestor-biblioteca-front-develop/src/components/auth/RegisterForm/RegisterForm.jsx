import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import './RegisterForm.css';
const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '1rem', color: '#5b3b2e', fontWeight: 500 }}>
      Todos los Derechos Reservados © ReadHub 2025 Byte Bugs
    </footer>
  );
};
const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;

    if (!formData.username.trim()) newErrors.username = 'Nombre de usuario requerido';
    else if (formData.username.length < 3) newErrors.username = 'Mínimo 3 caracteres';
    if (!formData.email) newErrors.email = 'Email requerido';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone) newErrors.phone = 'Teléfono requerido';
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Teléfono inválido';
    if (!formData.password) newErrors.password = 'Contraseña requerida';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const apiData = { ...formData, password: formData.password };
    try {
      const result = await register(apiData);
      if (result.success) onSwitchToLogin();
      else setErrors({ submit: result.error });
    } catch {
      setErrors({ submit: 'Error inesperado en el registro' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <h2 className="register-title">Regístrate</h2>
      <form onSubmit={handleSubmit} className="register-form-content">
        <Input label="Nombre de Usuario" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Ej: juanperez" error={errors.username} required />
        <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ejemplo@email.com" error={errors.email} required />
        <Input label="Teléfono" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" error={errors.phone} required />
        <Input label="Contraseña" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" error={errors.password} required />
        <Input label="Confirmar Contraseña" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" error={errors.confirmPassword} required />

        {errors.submit && <div className="form-error">{errors.submit}</div>}

        <Button type="submit" loading={loading} disabled={loading} className="register-button">
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </Button>

        <Button type="button" className="switch-login-button" onClick={onSwitchToLogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
                    <Footer />
      </form>
    </div>
  );
};

export default RegisterForm;
