import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import LibrosCRUD from './components/Libros/Libros';
import Loading from './components/common/Loading/Loading';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'register', 'dashboard', 'libros'
  const [showLanding, setShowLanding] = useState(true);

  if (loading) return <Loading size="large" />;

  if (isAuthenticated) {
    // Mostrar dashboard o CRUD
    if (currentView === 'libros') {
      return <LibrosCRUD onBack={() => setCurrentView('dashboard')} />;
    }

    return <Dashboard setCurrentView={setCurrentView} />;
  }

  if (showLanding) {
    return <Landing onGetStarted={() => setShowLanding(false)} />;
  }

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
