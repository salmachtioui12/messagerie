import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1/offers';

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stageType: 'PFE',
    location: '',
    startDate: '',
    duration: '',
    skillsRequired: '',
    responsibilities: '',
    benefits: '',
    isSponsored: false,
    isActive: true
  });
  const [error, setError] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/list`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOffers(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement des offres');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOffers();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (offer) => {
    setCurrentOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      stageType: offer.stageType,
      location: offer.location,
      startDate: offer.startDate.split('T')[0],
      duration: offer.duration,
      skillsRequired: offer.skillsRequired,
      responsibilities: offer.responsibilities,
      benefits: offer.benefits || '',
      isSponsored: offer.isSponsored,
      isActive: offer.isActive
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        startDate: formData.startDate || null
      };

      const response = await axios({
        method: currentOffer ? 'PUT' : 'POST',
        url: `${API_BASE_URL}/${currentOffer ? `update/${currentOffer.id}` : 'create'}`,
        data: data,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCurrentOffer(null);
      setIsEditing(false);
      fetchOffers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await axios.delete(`${API_BASE_URL}/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchOffers();
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      stageType: 'PFE',
      location: '',
      startDate: '',
      duration: '',
      skillsRequired: '',
      responsibilities: '',
      benefits: '',
      isSponsored: false,
      isActive: true
    });
    setCurrentOffer(null);
    setIsEditing(false);
  };

  const OfferDetailsModal = ({ offer, onClose }) => {
    if (!offer) return null;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>{offer.title}</h2>
            <button onClick={onClose} style={styles.modalCloseButton}>×</button>
          </div>
          
          <div style={styles.modalBody}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Type de stage:</span>
              <span style={styles.detailValue}>{offer.stageType}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Localisation:</span>
              <span style={styles.detailValue}>{offer.location}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Date de début:</span>
              <span style={styles.detailValue}>{new Date(offer.startDate).toLocaleDateString()}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Durée:</span>
              <span style={styles.detailValue}>{offer.duration}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Statut:</span>
              <span style={offer.isActive ? styles.statusActive : styles.statusInactive}>
                {offer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {offer.isSponsored && (
              <div style={styles.detailRow}>
                <span style={styles.sponsoredBadge}>Sponsorisée</span>
              </div>
            )}
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Description</h3>
              <p style={styles.sectionText}>{offer.description}</p>
            </div>
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Compétences requises</h3>
              <p style={styles.sectionText}>{offer.skillsRequired}</p>
            </div>
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Responsabilités</h3>
              <p style={styles.sectionText}>{offer.responsibilities}</p>
            </div>
            
            {offer.benefits && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Avantages</h3>
                <p style={styles.sectionText}>{offer.benefits}</p>
              </div>
            )}
          </div>
          
          <div style={styles.modalFooter}>
            <button onClick={onClose} style={styles.primaryButton}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOfferCard = (offer) => (
    <div key={offer.id} style={styles.offerCard}>
      <div style={styles.offerHeader}>
        <h3 style={styles.offerTitle}>{offer.title}</h3>
        <span style={styles.offerType}>{offer.stageType}</span>
      </div>
      
      <div style={styles.offerMeta}>
        <span style={styles.offerLocation}>{offer.location}</span>
        <span style={styles.offerDate}>
          {new Date(offer.startDate).toLocaleDateString()} • {offer.duration}
        </span>
      </div>
      
      <p style={styles.offerDescription}>
        {offer.description.length > 100 
          ? `${offer.description.substring(0, 100)}...` 
          : offer.description}
      </p>
      
      <div style={styles.offerStatus}>
        <span style={offer.isActive ? styles.statusActive : styles.statusInactive}>
          {offer.isActive ? 'Active' : 'Inactive'}
        </span>
        {offer.isSponsored && (
          <span style={styles.sponsoredBadge}>Sponsorisée</span>
        )}
      </div>
      
      <div style={styles.offerActions}>
        <button
          onClick={() => handleViewDetails(offer)}
          style={styles.viewButton}
        >
          Voir plus
        </button>
        <button
          onClick={() => handleEdit(offer)}
          style={styles.editButton}
        >
          Modifier
        </button>
        <button
          onClick={() => handleDelete(offer.id)}
          style={styles.deleteButton}
        >
          Supprimer
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>Chargement en cours...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestion des Offres de Stage</h1>
      
      {error && (
        <div style={styles.errorAlert}>
          {error}
          <button onClick={() => setError('')} style={styles.closeButton}>×</button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Type de stage *</label>
              <select
                name="stageType"
                value={formData.stageType}
                onChange={handleInputChange}
                required
                style={styles.input}
              >
                <option value="PFE">PFE</option>
                <option value="Stage d'été">Stage d'été</option>
                <option value="Stage professionnel">Stage professionnel</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Localisation *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date de début *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Durée *</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isSponsored"
                  checked={formData.isSponsored}
                  onChange={handleInputChange}
                  style={styles.checkbox}
                />
                Offre sponsorisée
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  style={styles.checkbox}
                />
                Offre active
              </label>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Compétences requises *</label>
            <textarea
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleInputChange}
              required
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Responsabilités *</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              required
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Avantages</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.primaryButton}>
              {currentOffer ? 'Mettre à jour' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={styles.secondaryButton}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div style={styles.headerActions}>
            <button
              onClick={() => setIsEditing(true)}
              style={styles.primaryButton}
            >
              + Créer une nouvelle offre
            </button>
          </div>

          {offers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Aucune offre disponible</p>
            </div>
          ) : (
            <div style={styles.offersGrid}>
              {offers.map(renderOfferCard)}
            </div>
          )}
        </div>
      )}
      
      {showDetailsModal && (
        <OfferDetailsModal 
          offer={selectedOffer} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Inter', sans-serif"
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1a1a1a',
    textAlign: 'center'
  },
  errorAlert: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#c62828',
    fontSize: '20px',
    cursor: 'pointer'
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  checkbox: {
    marginRight: '8px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  primaryButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px'
  },
  emptyState: {
    backgroundColor: '#f5f5f5',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '8px',
    color: '#666'
  },
  offersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  offerCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  offerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  offerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0
  },
  offerType: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  offerMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '14px',
    color: '#666'
  },
  offerDescription: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#333',
    margin: '10px 0'
  },
  offerStatus: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto'
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  statusInactive: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  sponsoredBadge: {
    backgroundColor: '#fff8e1',
    color: '#ff8f00',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  offerActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  viewButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    marginRight: '8px'
  },
  editButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  deleteButton: {
    backgroundColor: '#f5f5f5',
    color: '#d32f2f',
    border: '1px solid #d32f2f',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '700px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600'
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    padding: '20px'
  },
  detailRow: {
    display: 'flex',
    marginBottom: '12px',
    alignItems: 'center'
  },
  detailLabel: {
    fontWeight: '600',
    width: '150px',
    color: '#555'
  },
  detailValue: {
    flex: 1
  },
  section: {
    marginTop: '20px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#333'
  },
  sectionText: {
    lineHeight: '1.6',
    color: '#555'
  },
  modalFooter: {
    padding: '15px 20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end'
  }
};

export default OffersManagement;