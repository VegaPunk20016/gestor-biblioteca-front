import React from 'react';
import './Landing.css';

// Componente simple para la barra de navegación (se podría extraer a un archivo separado)
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo-icon">📖</span>
        <span className="navbar-logo-text">ReadHub</span>
      </div>
    </nav>
  );
};

// Componente simple para el pie de página (se podría extraer a un archivo separado)
const Footer = () => {
  return (
    <footer className="landing-footer">
      <img src="src/assets/readhub-footer-logo.svg" alt="Administrar biblioteca" className="landing-illustration" />
    </footer>
  );
};

const Landing = ({ onGetStarted }) => {
  return (
    <div className="landing-page-wrapper"> {/* Nuevo wrapper principal */}
      
      {/* FRAME 1: La Barra de Navegación */}
      <Navbar />

      {/* FRAME 2: El Cuerpo Principal (Texto e Imagen) */}
      <main className="landing-main-content"> {/* Cambiado a <main> semántico */}
        <div className="landing-container">
          <div className="landing-content"> {/* Esto es tu grid de 1fr 1fr */}
            <div className="landing-text">
              <h1 className="landing-title">
                Una biblioteca nunca fue tan fácil de administrar
              </h1>
              <p className="landing-subtitle">
                Gestiona tu colección de libros, organiza préstamos y descubre nuevas lecturas 
                con nuestra plataforma intuitiva y poderosa.
              </p>
              {/* Mantener el botón de 'Comenzar' o eliminarlo si la imagen no lo muestra */}
              <button 
                className="landing-button"
                onClick={onGetStarted}
              >
                Comenzar
              </button>
            </div>
            <div className="landing-image">
              {/* Aquí podrías poner tu ilustración o una imagen */}
              <img src="src/assets/filling-survey.svg" alt="Administrar biblioteca" className="landing-illustration" />
              {/* Si no tienes una imagen aún, usa el placeholder original, pero la imagen parece ser un SVG lineal */}
              {/* <div className="image-placeholder">📚</div> */}
            </div>
          </div>
        </div>
      </main>

      {/* FRAME 3: El Pie de Página */}
      <Footer />

    </div>
  );
};

export default Landing;