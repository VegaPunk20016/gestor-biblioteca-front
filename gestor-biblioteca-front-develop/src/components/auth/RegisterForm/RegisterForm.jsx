import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import './RegisterForm.css';

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
    
    // Para el teléfono, solo permitir números y limitar a 10 dígitos
    if (name === 'phone') {
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: phoneDigits }));
      }
    } else {
    setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    // Validación de nombre de usuario
    if (!formData.username.trim()) {
      newErrors.username = 'Nombre de usuario requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Máximo 20 caracteres';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Solo letras, números y guiones bajos';
    } else if (formData.username.includes(' ')) {
      newErrors.username = 'No se permiten espacios';
    }

    // Validación de email
    if (!formData.email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email demasiado largo';
    }

    // Validación de teléfono - solo números, máximo 10 dígitos
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Teléfono requerido';
    } else if (phoneDigits.length === 0) {
      newErrors.phone = 'El teléfono debe contener solo números';
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'El teléfono debe tener exactamente 10 dígitos';
    } else if (phoneDigits.length > 10) {
      newErrors.phone = 'El teléfono no puede tener más de 10 dígitos';
    }

    // Validación de contraseña
    if (!formData.password) {
      newErrors.password = 'Contraseña requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    } else if (formData.password.length > 50) {
      newErrors.password = 'Máximo 50 caracteres';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Debe contener mayúscula, minúscula y número';
    } else if (formData.password.includes(' ')) {
      newErrors.password = 'No se permiten espacios';
    }

    // Validación de confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

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
      <div className="register-header">
        <h2 className="register-title">Crear Cuenta</h2>
        <p className="register-subtitle">Completa los siguientes datos para registrarte</p>
      </div>
      
      <form onSubmit={handleSubmit} className="register-form-content">
        <div className="form-section">
          <h3 className="form-section-title">Información Personal</h3>
          <Input 
            label="Nombre de Usuario" 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            placeholder="Ej: juanperez" 
            error={errors.username} 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="ejemplo@email.com" 
            error={errors.email} 
            required 
          />
          <Input 
            label="Teléfono" 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="1234567890 (10 dígitos)" 
            error={errors.phone} 
            required 
          />
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Seguridad</h3>
          <Input 
            label="Contraseña" 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Mín. 6 caracteres, mayúscula, minúscula y número" 
            error={errors.password} 
            required 
          />
          <Input 
            label="Confirmar Contraseña" 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            placeholder="Repite tu contraseña" 
            error={errors.confirmPassword} 
            required 
          />
        </div>

        {errors.submit && <div className="form-error">{errors.submit}</div>}

        <div className="form-actions">
        <Button type="submit" loading={loading} disabled={loading} className="register-button">
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </Button>

        <Button type="button" className="switch-login-button" onClick={onSwitchToLogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
