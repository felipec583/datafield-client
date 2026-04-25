import { useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './PhotoModal.css';

import { API_URL, UPLOADS_URL } from '../api';

export default function PhotoModal({ photos, currentIndex, onClose, onChangeIndex }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onChangeIndex(currentIndex - 1);
    if (e.key === 'ArrowRight') onChangeIndex(currentIndex + 1);
  }, [currentIndex, onClose, onChangeIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handlePrev = () => onChangeIndex(currentIndex - 1);
  const handleNext = () => onChangeIndex(currentIndex + 1);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <>
      <Toaster position="top-center" />
      <div className="photo-modal-overlay" onClick={onClose}>
        <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="photo-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="photo-modal-main">
            {currentIndex > 0 && (
              <button className="photo-modal-nav photo-modal-prev" onClick={handlePrev}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}

            <div className="photo-modal-image-container">
              <img
                src={`${UPLOADS_URL}/${currentPhoto.path}`}
                alt={`Foto ${currentIndex + 1}`}
                className="photo-modal-image"
              />
            </div>

            {currentIndex < photos.length - 1 && (
              <button className="photo-modal-nav photo-modal-next" onClick={handleNext}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}
          </div>

          <div className="photo-modal-footer">
            <p className="photo-modal-description">
              {currentPhoto.description || `Foto ${currentIndex + 1} de ${photos.length}`}
            </p>
            <span className="photo-modal-counter">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
