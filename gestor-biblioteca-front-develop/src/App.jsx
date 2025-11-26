// App.jsx
import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardUsuario from './components/DashboardUsuario/DashboardUsuario';
import LibrosCRUD from './components/Libros/Libros';
import Prestamos from './pages/Prestamos/Prestamos';
import Multas from './pages/Multas/Multas';
import Loading from './components/common/Loading/Loading';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Wrapper para rutas públicas (Landing, Login, Register)
const PublicRouteWrapper = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loading size="large" />;

  if (isAuthenticated) {
    return user?.role === 'Usuario' ? <Navigate to="/usuario" /> : <Navigate to="/dashboard" />;
  }

  return children({ navigate });
};

// Rutas principales
const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Loading size="large" />;

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <PublicRouteWrapper>
              {({ navigate }) => <Landing onGetStarted={() => navigate('/login')} />}
            </PublicRouteWrapper>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRouteWrapper>
              {({ navigate }) => (
                <Login
                  onSwitchToRegister={() => navigate('/register')}
                  onBackToLanding={() => navigate('/')}
                />
              )}
            </PublicRouteWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRouteWrapper>
              {({ navigate }) => (
                <Register
                  onSwitchToLogin={() => navigate('/login')}
                  onBackToLanding={() => navigate('/')}
                />
              )}
            </PublicRouteWrapper>
          }
        />

        {/* Rutas autenticadas */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated && user?.role !== 'Usuario' ? <Dashboard /> : <Navigate to="/" />
          }
        />
        <Route
          path="/usuario"
          element={
            isAuthenticated && user?.role === 'Usuario' ? <DashboardUsuario /> : <Navigate to="/" />
          }
        />
        <Route
          path="/libros"
          element={
            isAuthenticated && user?.role !== 'Usuario' ? <LibrosCRUD /> : <Navigate to="/" />
          }
        />

        {/* Préstamos accesible para todos los usuarios autenticados */}
        <Route
          path="/prestamos"
          element={isAuthenticated ? <Prestamos /> : <Navigate to="/" />}
        />

        {/* Multas: tanto Usuario como Admin */}
        <Route
          path="/multas"
          element={
            isAuthenticated && (user?.role === 'Usuario' || user?.role === 'Bibliotecario')
              ? <Multas />
              : <Navigate to="/" />
          }
        />

        {/* Ruta comodín */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// Componente principal
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
