import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import PhotoModal from '../components/PhotoModal';
import './ReviewDetail.css';

import { API_URL } from '../api';

const statusMap = {
  'open': 'Abierta',
  'closed': 'Cerrada',
  'viewed': 'Observada'
};

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 });
  const [fabOpen, setFabOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailFormat, setEmailFormat] = useState('pdf');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const res = await fetch(`${API_URL}/review/${id}`);
      if (!res.ok) throw new Error('Review not found');
      const data = await res.json();
      setReview(data);
    } catch (err) {
      console.error('Error fetching review:', err);
      toast.error('Error al cargar la inspección');
    } finally {
      setLoading(false);
    }
  };

  const openPhotoModal = (index) => {
    setPhotoModal({ open: true, index });
  };

  const closePhotoModal = () => {
    setPhotoModal({ open: false, index: 0 });
  };

  const changePhotoIndex = (newIndex) => {
    if (newIndex >= 0 && newIndex < (review.photos?.length || 0)) {
      setPhotoModal(prev => ({ ...prev, index: newIndex }));
    }
  };

  const handleDownload = async (format) => {
    setFabOpen(false);
    try {
      const response = await fetch(`${API_URL}/review/${id}/export?format=${format}`);
      if (!response.ok) throw new Error('Error downloading file');

      const blob = await response.blob();
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe-inspeccion-${id}.${extension}`;
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
    if (!email) return;

    setSendingEmail(true);

    try {
      const response = await fetch(`${API_URL}/review/${id}/send-email`, {
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

  const openEmailModal = () => {
    setFabOpen(false);
    setShowEmailModal(true);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <div className="review-detail-loading">
        <span className="material-symbols-outlined spinning">sync</span>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="review-detail-error">
        <p>Inspección no encontrada</p>
        <button onClick={() => navigate('/reviews')}>Volver a la lista</button>
      </div>
    );
  }

  return (
    <div className="review-detail">
      <Toaster position="top-center" />
      
      <header className="review-detail-header">
        <button className="back-btn" onClick={() => navigate('/reviews')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="header-title">
          <h1>Detalle de Inspección</h1>
          <span className="doc-code">Código: {review.docCode || '-'}</span>
        </div>
      </header>

      <main className="review-detail-main">
        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">business</span>
            1. Identificación del Proyecto
          </h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Proyecto</span>
              <span className="value">{review.project?.name || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Contrato</span>
              <span className="value">{review.project?.projectContract || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Cliente</span>
              <span className="value">{review.project?.clientEmail || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Fecha</span>
              <span className="value">{formatDate(review.reviewDate)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Área</span>
              <span className="value">{review.project?.area || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Ubicación</span>
              <span className="value">{review.project?.workLocation || '-'}</span>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">location_on</span>
            2. Identificación del Área
          </h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Sistema</span>
              <span className="value">{review.project?.workSystem || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Especialidad</span>
              <span className="value">{review.project?.specialty || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Subsistema</span>
              <span className="value">{review.project?.subsystem || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Responsable</span>
              <span className="value">{review.responsible || '-'}</span>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">policy</span>
            3. Referencia Normativa
          </h2>
          <div className="normativa-list">
            {review.normativaAsmeB313 && <span className="normativa-tag">ASME B31.3</span>}
            {review.normativaAsmeB314 && <span className="normativa-tag">ASME B31.4</span>}
            {review.normativaApi650 && <span className="normativa-tag">API 650</span>}
            {review.normativaApi1104 && <span className="normativa-tag">API 1104</span>}
            {review.normativaAwsD11 && <span className="normativa-tag">AWS D1.1</span>}
            {!review.normativaAsmeB313 && !review.normativaAsmeB314 && !review.normativaApi650 && !review.normativaApi1104 && !review.normativaAwsD11 && 
              <span className="value">-</span>}
          </div>
        </section>

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">description</span>
            4. Documentación Técnica
          </h2>
          <div className="detail-text">
            <div className="text-item">
              <span className="label">Especificación Técnica</span>
              <p>{review.technicalSpec || '-'}</p>
            </div>
            <div className="text-item">
              <span className="label">Planos</span>
              <p>{review.drawings || '-'}</p>
            </div>
            <div className="text-item">
              <span className="label">Descripción de la Desviación</span>
              <p>{review.deviationDescription || '-'}</p>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">build</span>
            5. Acciones Correctivas
          </h2>
          <p className="text-value">{review.correctiveActions || '-'}</p>
        </section>

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">fact_check</span>
            6. Estado de Liberación
          </h2>
          <span className="status-badge-large">
            {statusMap[review.reviewStatus] || review.reviewStatus}
          </span>
        </section>

        {review.photos && review.photos.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">
              <span className="material-symbols-outlined">photo_library</span>
              7. Registro Fotográfico
              <span className="photo-count">({review.photos.length})</span>
            </h2>
            <div className="photo-grid">
              {review.photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="photo-thumbnail"
                  onClick={() => openPhotoModal(index)}
                >
                  <img 
                    src={photo.path}
                    alt={`Foto ${index + 1}`}
                  />
                  <div className="photo-overlay">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">chat</span>
            8. Comentarios
          </h2>
          <p className="text-value">{review.comments || '-'}</p>
        </section>

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">check_circle</span>
            9. Conclusión
          </h2>
          <p className="text-value">{review.conclusion || '-'}</p>
        </section>

        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">draw</span>
            10. Firmas
          </h2>
          <div className="signatures-grid">
            <div className="sig-item">
              <span className="label">INSPECTOR</span>
              <span className="value">{review.inspectorName || '-'}</span>
            </div>
            <div className="sig-item">
              <span className="label">JT - SUP</span>
              <span className="value">{review.jtSupName || '-'}</span>
            </div>
            <div className="sig-item">
              <span className="label">ADC / ITO</span>
              <span className="value">{review.adcName || '-'}</span>
            </div>
            <div className="sig-item">
              <span className="label">CLIENTE</span>
              <span className="value">{review.clientName || '-'}</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fab-container">
        <div className={`fab-menu ${fabOpen ? 'open' : ''}`}>
          <button className="fab-option" onClick={() => handleDownload('pdf')}>
            <span className="material-symbols-outlined">picture_as_pdf</span>
            <span>Descargar PDF</span>
          </button>
          <button className="fab-option" onClick={() => handleDownload('excel')}>
            <span className="material-symbols-outlined">table_chart</span>
            <span>Descargar Excel</span>
          </button>
          <button className="fab-option" onClick={openEmailModal}>
            <span className="material-symbols-outlined">email</span>
            <span>Enviar por Email</span>
          </button>
        </div>
        <button className={`fab-main ${fabOpen ? 'open' : ''}`} onClick={() => setFabOpen(!fabOpen)}>
          <span className="material-symbols-outlined">{fabOpen ? 'close' : 'more_horiz'}</span>
        </button>
      </div>

      {showEmailModal && (
        <div className="review-email-modal" onClick={() => setShowEmailModal(false)}>
          <div className="review-email-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Enviar por Correo</h3>
            <form className="review-email-form" onSubmit={handleSendEmail}>
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
              <div className="review-email-modal-actions">
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

      {photoModal.open && (
        <PhotoModal 
          photos={review.photos}
          currentIndex={photoModal.index}
          onClose={closePhotoModal}
          onChangeIndex={changePhotoIndex}
        />
      )}
    </div>
  );
}
