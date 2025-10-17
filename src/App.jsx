import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Loading from './components/common/Loading/Loading';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'register'
  const [showLanding, setShowLanding] = useState(true);

  // Si está cargando, mostrar loading
  if (loading) {
    return <Loading size="large" />;
  }

  // Si el usuario está autenticado, mostrar dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // Si estamos en la landing page
  if (showLanding) {
    return (
      <Landing onGetStarted={() => setShowLanding(false)} />
    );
  }

  // Mostrar login o registro
  return (
    <div className="app">
      {currentView === 'login' ? (
        <Login 
          onSwitchToRegister={() => setCurrentView('register')}
          onBackToLanding={() => setShowLanding(true)}
        />
      ) : (
        <Register 
          onSwitchToLogin={() => setCurrentView('login')}
          onBackToLanding={() => setShowLanding(true)}
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