import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <header className="home-header">
        <button className="logo" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">precision_manufacturing</span>
          <h1>DataField</h1>
        </button>
      </header>

      <main className="home-main">
        <div className="hero">
          <h2>Bienvenido a DataField</h2>
          <p>Sistema de Gestión de Informes de Inspección</p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/login')}>
          <span>Iniciar Inspección</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <div className="features">
          <div className="feature-card">
            <span className="material-symbols-outlined">assignment_turned_in</span>
            <span>Registros</span>
          </div>
          <div className="feature-card">
            <span className="material-symbols-outlined">task_alt</span>
            <span>Informes</span>
          </div>
          <div className="feature-card">
            <span className="material-symbols-outlined">verified_user</span>
            <span>Inspecciones</span>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} DataField. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
