import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Form.css';

import { API_URL, UPLOADS_URL } from '../api';

const generateDocCode = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `DF-${year}-${random}`;
};

const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export default function Form() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState(null);
  
  const [docCode] = useState(generateDocCode());
  
  const [photos, setPhotos] = useState([]);
  const [photoDescriptions, setPhotoDescriptions] = useState({});
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  const [formData, setFormData] = useState({
    docCode: docCode,
    reviewDate: new Date().toISOString().split('T')[0],
    responsible: '',
    normativaAsmeB313: false,
    normativaAsmeB314: false,
    normativaApi650: false,
    normativaApi1104: false,
    normativaAwsD11: false,
    technicalSpec: '',
    drawings: '',
    deviationDescription: '',
    correctiveActions: '',
    reviewStatus: 'abierta',
    comments: '',
    conclusion: '',
    inspectorName: '',
    jtSupName: '',
    adcName: '',
    clientName: '',
  });

  useEffect(() => {
    fetch(`${API_URL}/project`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching project:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > MAX_PHOTOS) {
      toast.error(`Máximo ${MAX_PHOTOS} fotos permitidas`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_PHOTO_SIZE) {
        toast.error(`La foto "${file.name}" excede 5MB`);
        return false;
      }
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        toast.error(`La foto "${file.name}" debe ser JPEG, JPG, PNG o WebP`);
        return false;
      }
      return true;
    });

    setPhotos(prev => [...prev, ...validFiles]);
  };

  const handlePhotoDescChange = (index, value) => {
    setPhotoDescriptions(prev => ({ ...prev, [index]: value }));
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    const newDescs = { ...photoDescriptions };
    delete newDescs[index];
    Object.keys(newDescs).forEach(key => {
      if (parseInt(key) > index) {
        newDescs[parseInt(key) - 1] = newDescs[key];
        delete newDescs[key];
      }
    });
    setPhotoDescriptions(newDescs);
  };

  const uploadPhotos = async (reviewId) => {
    if (photos.length === 0) return;

    setUploadingPhotos(true);
    const formDataUpload = new FormData();
    
    photos.forEach((file) => {
      formDataUpload.append('photos', file);
    });

    Object.values(photoDescriptions).forEach((desc) => {
      formDataUpload.append('descriptions', desc);
    });

    try {
      const response = await fetch(`${API_URL}/review/${reviewId}/photos`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Error uploading photos:', err);
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const reviewId = data.reviewId;
        
        localStorage.setItem('reviewId', reviewId);
        
        if (photos.length > 0) {
          await uploadPhotos(reviewId);
        }
        
        navigate('/completion', { state: { reviewId, docCode } });
      } else {
        toast.error('Error al enviar el formulario');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Error al enviar el formulario');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-loading">
        <span className="material-symbols-outlined spinning">sync</span>
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  return (
    <div className="form">
      <header className="form-header">
        <button className="back-btn" onClick={() => navigate('/login')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="header-title">
          <h1>Informe de Inspección</h1>
          <span className="doc-code">Código: {docCode}</span>
        </div>
      </header>

      <form className="form-content" onSubmit={handleSubmit}>
        {/* Section 1: Identificación del Proyecto */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">business</span>
            1. Identificación del Proyecto
          </h2>
          <div className="form-grid">
            <div className="form-field">
              <label>Proyecto</label>
              <input type="text" value={project?.name || ''} disabled />
            </div>
            <div className="form-field">
              <label>Contrato</label>
              <input type="text" value={project?.projectContract || ''} disabled />
            </div>
            <div className="form-field">
              <label>Cliente</label>
              <input type="text" value={project?.clientEmail || ''} disabled />
            </div>
            <div className="form-field">
              <label>Fecha</label>
              <input
                type="date"
                name="reviewDate"
                value={formData.reviewDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Área</label>
              <input type="text" value={project?.area || ''} disabled />
            </div>
            <div className="form-field">
              <label>Ubicación</label>
              <input type="text" value={project?.workLocation || ''} disabled />
            </div>
          </div>
        </section>

        {/* Section 2: Identificación de la Área */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">location_on</span>
            2. Identificación de la Área
          </h2>
          <div className="form-grid">
            <div className="form-field">
              <label>Sistema</label>
              <input type="text" value={project?.workSystem || ''} disabled />
            </div>
            <div className="form-field">
              <label>Especialidad</label>
              <input type="text" value={project?.specialty || ''} disabled />
            </div>
            <div className="form-field">
              <label>Subsistema</label>
              <input type="text" value={project?.subsystem || ''} disabled />
            </div>
            <div className="form-field">
              <label>Responsable</label>
              <input
                type="text"
                name="responsible"
                value={formData.responsible}
                onChange={handleChange}
                placeholder="Nombre del responsable"
                required
              />
            </div>
          </div>
        </section>

        {/* Section 3: Referencia Normativa */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">policy</span>
            3. Referencia Normativa
          </h2>
          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="normativaAsmeB313"
                checked={formData.normativaAsmeB313}
                onChange={handleChange}
              />
              <span>ASME B31.3</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="normativaAsmeB314"
                checked={formData.normativaAsmeB314}
                onChange={handleChange}
              />
              <span>ASME B31.4</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="normativaApi650"
                checked={formData.normativaApi650}
                onChange={handleChange}
              />
              <span>API 650</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="normativaApi1104"
                checked={formData.normativaApi1104}
                onChange={handleChange}
              />
              <span>API 1104</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="normativaAwsD11"
                checked={formData.normativaAwsD11}
                onChange={handleChange}
              />
              <span>AWS D1.1</span>
            </label>
          </div>
        </section>

        {/* Section 4: Documentación Técnica */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">description</span>
            4. Documentación Técnica
          </h2>
          <div className="form-field full-width">
            <label>Especificación Técnica</label>
            <textarea
              name="technicalSpec"
              value={formData.technicalSpec}
              onChange={handleChange}
              placeholder="Describa la especificación técnica..."
              rows={2}
            />
          </div>
          <div className="form-field full-width">
            <label>Planos</label>
            <textarea
              name="drawings"
              value={formData.drawings}
              onChange={handleChange}
              placeholder="Describa los planos..."
              rows={2}
            />
          </div>
          <div className="form-field full-width">
            <label>Descripción de la Desviación</label>
            <textarea
              name="deviationDescription"
              value={formData.deviationDescription}
              onChange={handleChange}
              placeholder="Describa la deviación encontrada..."
              rows={3}
            />
          </div>
        </section>

        {/* Section 5: Acciones Correctivas */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">build</span>
            5. Acciones Correctivas
          </h2>
          <div className="form-field full-width">
            <label>Acciones Correctivas</label>
            <textarea
              name="correctiveActions"
              value={formData.correctiveActions}
              onChange={handleChange}
              placeholder="Describa las acciones correctivas a tomar..."
              rows={3}
            />
          </div>
        </section>

        {/* Section 6: Estado de Liberación */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">fact_check</span>
            6. Estado de Liberación
          </h2>
          <div className="form-field full-width">
            <label>Estado</label>
            <select
              name="reviewStatus"
              value={formData.reviewStatus}
              onChange={handleChange}
            >
              <option value="abierta">Abierta</option>
              <option value="cerrada">Cerrada</option>
              <option value="observada">Observada</option>
            </select>
          </div>
        </section>

        {/* Section 7: Registro Fotográfico */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">photo_library</span>
            7. Registro Fotográfico
            <span className="section-hint">(Opcional)</span>
          </h2>
          
          <div className="photo-upload-area">
            <input
              type="file"
              id="photo-input"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handlePhotoChange}
              className="photo-input"
              disabled={photos.length >= MAX_PHOTOS}
            />
            
            <label htmlFor="photo-input" className="photo-upload-label">
              <span className="material-symbols-outlined">add_a_photo</span>
              <span>Agregar fotos ({photos.length}/{MAX_PHOTOS})</span>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="photo-grid">
              {photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <div className="photo-preview">
                    <img src={URL.createObjectURL(photo)} alt={`Foto ${index + 1}`} />
                    <button
                      type="button"
                      className="photo-remove"
                      onClick={() => removePhoto(index)}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={photoDescriptions[index] || ''}
                    onChange={(e) => handlePhotoDescChange(index, e.target.value)}
                    className="photo-description-input"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 8: Comentarios */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">chat</span>
            8. Comentarios
          </h2>
          <div className="form-field full-width">
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Comentarios adicionales..."
              rows={3}
            />
          </div>
        </section>

        {/* Section 9: Conclusión */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">check_circle</span>
            9. Conclusión
          </h2>
          <div className="form-field full-width">
            <textarea
              name="conclusion"
              value={formData.conclusion}
              onChange={handleChange}
              placeholder="Conclusión del informe..."
              rows={3}
            />
          </div>
        </section>

        {/* Section 10: Firmas */}
        <section className="form-section">
          <h2 className="section-title">
            <span className="material-symbols-outlined">draw</span>
            10. Firmas
          </h2>
          <div className="signature-table">
            <div className="sig-row">
              <span className="sig-label">INSPECTOR</span>
              <input
                type="text"
                name="inspectorName"
                value={formData.inspectorName}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </div>
            <div className="sig-row">
              <span className="sig-label">JT - SUP</span>
              <input
                type="text"
                name="jtSupName"
                value={formData.jtSupName}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </div>
            <div className="sig-row">
              <span className="sig-label">ADC / ITO</span>
              <input
                type="text"
                name="adcName"
                value={formData.adcName}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </div>
            <div className="sig-row">
              <span className="sig-label">CLIENTE</span>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </div>
            <div className="sig-row date-row">
              <span className="sig-label">FECHA</span>
              <span className="sig-date">{new Date().toLocaleDateString('es-CL')}</span>
            </div>
          </div>
        </section>

        <button type="submit" className="btn-submit" disabled={submitting || uploadingPhotos}>
          {submitting || uploadingPhotos ? (
            <>
              <span className="material-symbols-outlined spinning">sync</span>
              {uploadingPhotos ? 'Subiendo fotos...' : 'Enviando...'}
            </>
          ) : (
            <>
              <span>Enviar Informe</span>
              <span className="material-symbols-outlined">send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
