import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './Completion.css';

import { API_URL } from '../api';

export default function Completion() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reviewId, setReviewId] = useState(location.state?.reviewId || null);
  const [docCode] = useState(location.state?.docCode);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFormat, setEmailFormat] = useState('pdf');

  useEffect(() => {
    const storedReviewId = localStorage.getItem('reviewId');
    if (!reviewId && storedReviewId) {
      setReviewId(parseInt(storedReviewId, 10));
    }
  }, [reviewId]);

  const handleDownload = async (format) => {
    if (!reviewId) return;

    try {
      const response = await fetch(`${API_URL}/review/${reviewId}/export?format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error downloading file');
      }

      const blob = await response.blob();
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe-inspeccion-${reviewId}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Error al descargar el archivo');
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!reviewId || !email) return;

    setSendingEmail(true);

    try {
      const response = await fetch(`${API_URL}/review/${reviewId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, format: emailFormat }),
      });

      if (response.ok) {
        toast.success('Correo enviado exitosamente');
        setShowEmailModal(false);
        setEmail('');
      } else {
        toast.error('Error al enviar el correo');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error('Error al enviar el correo');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleNewInspection = () => {
    localStorage.removeItem('reviewId');
    navigate('/form');
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="completion">
        <header className="completion-header">
          <button className="logo" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined">precision_manufacturing</span>
            <h1>DataField</h1>
          </button>
        </header>

        <main className="completion-main">
          <div className="success-icon">
            <span className="material-symbols-outlined">check_circle</span>
          </div>

          <h2>¡Informe Guardado!</h2>
          <p className="success-message">
            Tu informe de inspección ha sido guardado en el sistema.
          </p>

          <div className="completion-details">
            <div className="detail-row">
              <span className="detail-label">ID de Registro</span>
              <span className="detail-value">#{reviewId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Código de Documento</span>
              <span className="detail-value">{docCode}</span>
            </div>
          </div>

          <div className="actions-section">
            <h3>Acciones</h3>
            
            <button className="action-btn" onClick={() => handleDownload('pdf')}>
              <span className="material-symbols-outlined">picture_as_pdf</span>
              <span>Descargar PDF</span>
            </button>

            <button className="action-btn" onClick={() => handleDownload('excel')}>
              <span className="material-symbols-outlined">table_chart</span>
              <span>Descargar Excel</span>
            </button>

            <button className="action-btn" onClick={() => setShowEmailModal(true)}>
              <span className="material-symbols-outlined">email</span>
              <span>Enviar por Correo</span>
            </button>

            <button className="action-btn" onClick={handleNewInspection}>
              <span className="material-symbols-outlined">add</span>
              <span>Nueva Inspección</span>
            </button>

            <button className="action-btn" onClick={() => navigate('/reviews')}>
              <span className="material-symbols-outlined">folder</span>
              <span>Ver Inspecciones</span>
            </button>
          </div>
        </main>

        {showEmailModal && (
          <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Enviar por Correo</h3>
              
              <form onSubmit={handleSendEmail}>
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
                  <label>Formato</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        checked={emailFormat === 'pdf'}
                        onChange={(e) => setEmailFormat(e.target.value)}
                      />
                      <span>PDF</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="format"
                        value="excel"
                        checked={emailFormat === 'excel'}
                        onChange={(e) => setEmailFormat(e.target.value)}
                      />
                      <span>Excel</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEmailModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-send" disabled={sendingEmail}>
                    {sendingEmail ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
