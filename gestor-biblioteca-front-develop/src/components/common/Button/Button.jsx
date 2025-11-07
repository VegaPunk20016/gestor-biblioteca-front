import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
};

export default Button;