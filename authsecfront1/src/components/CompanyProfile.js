import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1/companies';

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    description: '',
    website: '',
    picture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/profile/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCompany(response.data);
      setFormData({
        name: response.data.name || '',
        sector: response.data.sector || '',
        description: response.data.description || '',
        website: response.data.website || '',
        picture: null
      });

      if (response.data.picture) {
        fetchCompanyPicture();
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCompany(null);
      } else if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyPicture = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/picture`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setPreviewImage(imageUrl);
    } catch (err) {
      console.error("Erreur lors du chargement de l'image:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCompanyProfile();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    document.getElementById('company-picture-input').click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, picture: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('sector', formData.sector);
    data.append('description', formData.description);
    data.append('website', formData.website);
    if (formData.picture) {
      data.append('picture', formData.picture);
    }

    try {
      const response = await axios({
        method: company ? 'PUT' : 'POST',
        url: `${API_BASE_URL}/profile/${company ? 'update' : 'create'}`,
        data: data,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCompany(response.data);
      setIsEditing(false);
      if (formData.picture) {
        fetchCompanyPicture();
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre profil entreprise ?')) {
      try {
        await axios.delete(`${API_BASE_URL}/profile/delete`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCompany(null);
        setFormData({
          name: '',
          sector: '',
          description: '',
          website: '',
          picture: null
        });
        setPreviewImage(null);
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>Chargement en cours...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Profil Entreprise</h1>
      
      {!company && !isEditing ? (
        <div style={styles.emptyProfile}>
          <p>Vous n'avez pas encore créé votre profil entreprise.</p>
          <button 
            onClick={() => setIsEditing(true)}
            style={styles.primaryButton}
          >
            Créer votre profil
          </button>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formHeader}>
            <input
              type="file"
              id="company-picture-input"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <div 
              onClick={handleImageClick}
              style={styles.editableLogoContainer}
            >
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Logo entreprise" 
                  style={styles.editableLogo}
                />
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <svg style={styles.uploadIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,13V17H10V13H7L12,8L17,13M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z" />
                  </svg>
                  <p style={styles.uploadText}>Ajouter un logo</p>
                </div>
              )}
              <div style={styles.editOverlay}>
                <svg style={styles.editIcon} viewBox="0 0 24 24">
                  <path fill="white" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                </svg>
              </div>
            </div>
          </div>

          <div style={styles.formBody}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom de l'entreprise *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Entrez le nom de votre entreprise"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Secteur d'activité</label>
              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Quel est votre secteur d'activité ?"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Site web</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="https://votre-entreprise.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                style={styles.textarea}
                placeholder="Décrivez votre entreprise en quelques mots..."
              />
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={styles.primaryButton}
              >
                {company ? 'Enregistrer les modifications' : 'Créer le profil'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={styles.secondaryButton}
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={styles.profileContainer}>
          <div style={styles.profileHeader}>
            {previewImage && (
              <div style={styles.logoContainer}>
                <img 
                  src={previewImage} 
                  alt="Logo entreprise" 
                  style={styles.logo}
                />
              </div>
            )}
            
            <div style={styles.companyInfo}>
              <h2 style={styles.companyName}>{company.name}</h2>
              {company.sector && <p style={styles.sector}>{company.sector}</p>}
            </div>
          </div>

          {company.website && (
            <a 
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.website}
            >
              {company.website}
            </a>
          )}

          {company.description && (
            <p style={styles.description}>{company.description}</p>
          )}

          <div style={styles.actionButtons}>
            <button
              onClick={() => setIsEditing(true)}
              style={styles.primaryButton}
            >
              Modifier
            </button>
            <button
              onClick={handleDelete}
              style={styles.dangerButton}
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Inter', sans-serif"
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '30px',
    color: '#1a1a1a',
    textAlign: 'center'
  },
  emptyProfile: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'center'
  },
  editableLogoContainer: {
    width: '150px',
    height: '150px',
    borderRadius: '25px',
    backgroundColor: '#f5f5f5',
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'scale(1.02)'
    }
  },
  editableLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666'
  },
  uploadIcon: {
    width: '48px',
    height: '48px',
    marginBottom: '10px'
  },
  uploadText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '500'
  },
  editOverlay: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editIcon: {
    width: '20px',
    height: '20px'
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    marginBottom: '0'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    fontSize: '15px',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'border 0.3s',
    ':focus': {
      borderColor: '#1976d2',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    }
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'border 0.3s',
    ':focus': {
      borderColor: '#1976d2',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    }
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px'
  },
  primaryButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#1565c0'
    }
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  dangerButton: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#b71c1c'
    }
  },
  profileContainer: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  profileHeader: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start'
  },
  logoContainer: {
    width: '150px',
    height: '150px',
    flexShrink: '0'
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: '25px',
    objectFit: 'cover',
    border: '1px solid #eee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  companyInfo: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  companyName: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
    color: '#1a1a1a'
  },
  sector: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
    fontStyle: 'italic'
  },
  website: {
    fontSize: '16px',
    color: '#1976d2',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'color 0.3s',
    ':hover': {
      color: '#0d47a1',
      textDecoration: 'underline'
    }
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    margin: '0',
    padding: '15px 0',
    borderTop: '1px solid #eee',
    borderBottom: '1px solid #eee'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px'
  }
};

export default CompanyProfile;