import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import './Dashboard.css';

const Dashboard = ({ setCurrentView }) => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Read Hub</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.username || user?.email}</span>
          <Button variant="secondary" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="profile-card">
          <h2>Tu Perfil</h2>
          <div className="profile-info">
            <div className="profile-field">
              <label>ID:</label>
              <span>{user?.id}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="profile-field">
              <label>Usuario:</label>
              <span>{user?.username}</span>
            </div>
            <div className="profile-field">
              <label>Estado:</label>
              <span className="status-badge">Conectado</span>
            </div>
          </div>

          <div className="dashboard-button-container">
            <Button variant="primary" onClick={() => setCurrentView('libros')}>
              Gestionar Libros
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
