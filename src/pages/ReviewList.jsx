import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import './ReviewList.css';

import { API_URL } from '../api';

const statusMap = {
  'open': 'Abierta',
  'closed': 'Cerrada',
  'viewed': 'Observada'
};

const statusClass = {
  'open': 'status-open',
  'closed': 'status-closed',
  'viewed': 'status-viewed'
};

export default function ReviewList() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    fetchReviews();
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Error al cargar las inspecciones');
    } finally {
      setLoading(false);
    }
  };

  const handleNewInspection = () => {
    navigate('/form');
  };

  const handleRowClick = (id) => {
    navigate(`/reviews/${id}`);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete;
    setConfirmDelete(null);
    setDeleting(id);

    try {
      const res = await fetch(`${API_URL}/review/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Inspección eliminada');
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        toast.error('Error al eliminar inspección');
      }
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Error al eliminar inspección');
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <div className="review-list-loading">
        <Toaster position="top-center" />
        <span className="material-symbols-outlined spinning">sync</span>
        <p>Cargando inspecciones...</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      <Toaster position="top-center" />
      
      <header className="review-list-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div className="header-title">
          <h1>{isMobile ? 'Inspecciones' : 'Lista de Inspecciones'}</h1>
          <span className="count">({reviews.length})</span>
        </div>

        <button className="btn-new" onClick={handleNewInspection}>
          <span className="material-symbols-outlined">add</span>
          <span>Nueva</span>
        </button>
      </header>

      <main className="review-list-main">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined">folder_open</span>
            <p>No hay inspecciones</p>
            <button onClick={handleNewInspection}>
              Crear primera
            </button>
          </div>
        ) : (
          <>
            {isMobile && (
              <div className="legend">
                <span><span className="legend-dot open"></span> Abierta</span>
                <span><span className="legend-dot closed"></span> Cerrada</span>
                <span><span className="legend-dot viewed"></span> Observada</span>
              </div>
            )}
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="review-card"
                  onClick={() => handleRowClick(review.id)}
                >
                  <div className="card-header">
                    <span className="card-id">#{review.id}</span>
                    <button 
                      className="btn-delete"
                      onClick={(e) => handleDeleteClick(e, review.id)}
                      disabled={deleting === review.id}
                    >
                      {deleting === review.id ? (
                        <span className="material-symbols-outlined spinning">sync</span>
                      ) : (
                        <span className="material-symbols-outlined">delete</span>
                      )}
                    </button>
                  </div>
                  
                  <div className="card-code">{review.docCode || '-'}</div>
                  
                  <div className="card-body">
                    <span className="card-date">{formatDate(review.reviewDate)}</span>
                    <span className={`status-badge ${statusClass[review.reviewStatus]}`}>
                      {statusMap[review.reviewStatus] || review.reviewStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmDelete !== null}
        title="Eliminar Inspección"
        message="¿Estás seguro de eliminar esta inspección? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
    </div>
  );
}
