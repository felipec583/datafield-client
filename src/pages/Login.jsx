import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import './Login.css';

const INSPECTOR_EMAIL = import.meta.env.VITE_INSPECTOR_EMAIL || 'inspector@test.com';
const INSPECTOR_PASSWORD = import.meta.env.VITE_INSPECTOR_PASSWORD;

export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/reviews', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === INSPECTOR_EMAIL && password === INSPECTOR_PASSWORD) {
      login();
      navigate('/reviews');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="login">
      <header className="login-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>

      <main className="login-main">
        <button className="login-logo" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">precision_manufacturing</span>
          <h1>DataField</h1>
        </button>

        <form className="login-form" onSubmit={handleLogin}>
          <h2>Iniciar Sesión</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            <span>Entrar</span>
            <span className="material-symbols-outlined">login</span>
          </button>

          <p className="demo-hint">
            Demo: {INSPECTOR_EMAIL}
          </p>
        </form>
      </main>
    </div>
  );
}
