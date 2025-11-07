import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardUsuario from './components/DashboardUsuario/DashboardUsuario'; // 🆕
import LibrosCRUD from './components/Libros/Libros';
import Loading from './components/common/Loading/Loading';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [currentView, setCurrentView] = useState('landing');

  if (loading) return <Loading size="large" />;

  if (isAuthenticated) {
    // 🔹 Si el usuario es normal (rol Usuario)
    if (user?.role === 'Usuario') {
      return <DashboardUsuario />;
    }

    // 🔹 Si es admin o bibliotecario
    if (currentView === 'libros') {
      return <LibrosCRUD onBack={() => setCurrentView('dashboard')} />;
    }

    return <Dashboard setCurrentView={setCurrentView} />;
  }

  if (currentView === 'landing') {
    return <Landing onGetStarted={() => setCurrentView('login')} />;
  }

  return (
    <div className="app">
      {currentView === 'login' ? (
        <Login 
          onSwitchToRegister={() => setCurrentView('register')}
          onBackToLanding={() => setCurrentView('landing')}
        />
      ) : (
        <Register 
          onSwitchToLogin={() => setCurrentView('login')}
          onBackToLanding={() => setCurrentView('landing')}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
