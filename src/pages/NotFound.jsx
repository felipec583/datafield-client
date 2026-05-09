import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <main className="not-found-main">
        <span className="not-found-icon material-symbols-outlined">search_off</span>
        <h1>404</h1>
        <p>Página no encontrada</p>
        <span className="not-found-desc">
          La ruta a la que intentas acceder no existe.
        </span>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">home</span>
          Volver al inicio
        </button>
      </main>
    </div>
  );
}
