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

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

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
    console.log('🔄 Botón de registro clickeado');
    
    if (!validateForm()) {
      console.log('❌ Validación fallida', errors);
      return;
    }

    setLoading(true);
    console.log('📤 Enviando datos al servidor...', formData);
    
    // Preparar datos para la API (sin confirmPassword)
    const apiData = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    };

    try {
      const result = await register(apiData);
      console.log('📥 Respuesta del registro:', result);
      
      if (result.success) {
        alert('¡Registro exitoso! Por favor inicia sesión.');
        onSwitchToLogin();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      setErrors({ submit: 'Error inesperado en el registro' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <h2 className="register-title">Regístrate</h2>
      <form onSubmit={handleSubmit} className="register-form-content">
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
          placeholder="tu@email.com"
          error={errors.email}
          required
        />

        <Input
          label="Teléfono"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Ej: +1 234 567 8900"
          error={errors.phone}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mínimo 6 caracteres"
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
          className="register-button"
        >
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </Button>

        <div className="form-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button 
              type="button" 
              className="switch-link"
              onClick={onSwitchToLogin}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;