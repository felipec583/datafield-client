import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import PhotoModal from '../components/PhotoModal';
import './ReviewDetail.css';

import { API_URL, UPLOADS_URL } from '../api';

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
        {/* Section 1: Proyecto */}
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

        {/* Section 2: Área */}
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

        {/* Section 3: Normativa */}
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

        {/* Section 4: Documentación */}
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

        {/* Section 5: Acciones */}
        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">build</span>
            5. Acciones Correctivas
          </h2>
          <p className="text-value">{review.correctiveActions || '-'}</p>
        </section>

        {/* Section 6: Estado */}
        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">fact_check</span>
            6. Estado de Liberación
          </h2>
          <span className="status-badge-large">
            {statusMap[review.reviewStatus] || review.reviewStatus}
          </span>
        </section>

        {/* Section 7: Fotos */}
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
                    src={`${UPLOADS_URL}/${photo.path}`} 
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

        {/* Section 8: Comentarios */}
        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">chat</span>
            8. Comentarios
          </h2>
          <p className="text-value">{review.comments || '-'}</p>
        </section>

        {/* Section 9: Conclusión */}
        <section className="detail-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">check_circle</span>
            9. Conclusión
          </h2>
          <p className="text-value">{review.conclusion || '-'}</p>
        </section>

        {/* Section 10: Firmas */}
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
