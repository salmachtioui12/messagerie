import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './StudentProfileForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1/profiles';
const DEFAULT_PROFILE_PICTURE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
const DEFAULT_COVER_PHOTO = "https://via.placeholder.com/1200x300?text=Cover+Photo";

const StudentProfileEdit = () => {
  const [profile, setProfile] = useState({
    id: null,
    headline: '',
    email: '',
    summary: '',
    location: '',
    phone: '',
    certifications: [{ name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' }],
    educations: [{ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }],
    experiences: [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
    skills: [{ name: '' }],
  });

  const [cvFile, setCvFile] = useState(null);
  const [letterFile, setLetterFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(DEFAULT_PROFILE_PICTURE);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(DEFAULT_COVER_PHOTO);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setProfile(response.data);
        setProfileExists(true);

        try {
          const pictureResponse = await axios.get(`${API_BASE_URL}/profile-picture`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          setProfilePicture(imageUrl);
        } catch (pictureError) {
          if (pictureError.response?.status === 404) {
            setProfilePicture(DEFAULT_PROFILE_PICTURE);
          } else {
            console.error("Erreur chargement photo de profil:", pictureError);
          }
        }

        try {
          const coverResponse = await axios.get(`${API_BASE_URL}/cover-photo`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });
          const coverUrl = URL.createObjectURL(coverResponse.data);
          setCoverPhoto(coverUrl);
        } catch (coverError) {
          if (coverError.response?.status === 404) {
            setCoverPhoto(DEFAULT_COVER_PHOTO);
          } else {
            console.error("Erreur chargement cover photo:", coverError);
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileExists(false);
      } else {
        setError('Erreur lors du chargement du profil.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfileField = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (section, index, e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const updatedArray = [...prev[section]];
      updatedArray[index][name] = value;
      return { ...prev, [section]: updatedArray };
    });
  };

  const addArrayItem = (section, newItem) => {
    setProfile(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setProfile(prev => {
      const updatedArray = prev[section].filter((_, idx) => idx !== index);
      return { ...prev, [section]: updatedArray };
    });
  };

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(URL.createObjectURL(file));
      setCoverFile(file);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
      setProfilePictureFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append('profile', JSON.stringify(profile));

    if (cvFile) formData.append('cv', cvFile);
    if (letterFile) formData.append('letter', letterFile);
    if (profilePictureFile) formData.append('profilePicture', profilePictureFile);
    if (coverFile) formData.append('coverPhoto', coverFile);

    setLoading(true);

    try {
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }
      if (profileExists && profile.id) {
        await axios.put(`${API_BASE_URL}/${profile.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });
        alert('Profil mis à jour avec succès !');
      } else {
        const response = await axios.post(`${API_BASE_URL}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });
        setProfile(response.data);
        setProfileExists(true);
        alert('Profil créé avec succès !');
      }
      navigate('/profile/view');
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Accès refusé. Vérifiez votre connexion.");
      } else if (err.response?.status === 500) {
        setError("Erreur serveur. Vérifiez vos données.");
      } else {
        setError("Erreur inconnue.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!profile.id) {
      setError("Impossible de supprimer : ID introuvable.");
      return;
    }

    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer votre profil ?");
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/${profile.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profil supprimé avec succès.');
      localStorage.removeItem('accessToken');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Accès refusé. Vous n'avez pas les droits pour supprimer ce profil.");
      } else {
        setError("Erreur lors de la suppression du profil.");
      }
    }
  };

  return (
    <div className="form-wrapper">
      {loading ? <p>Chargement...</p> : (
        <form onSubmit={handleSubmit}>
  
          <div className="cover-photo-container">
            <div className="cover-photo-wrapper">
              {coverPhoto ? (
                <img src={coverPhoto} alt="Cover" className="cover-photo" />
              ) : (
                <div className="cover-photo-placeholder" />
              )}
              <label className="edit-cover-button">
                Modifier cover
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleCoverChange}
                />
              </label>
            </div>
  
            <div className="profile-picture-wrapper">
              <div className="profile-picture-container">
                <img src={profilePicture} alt="Profile" />
              </div>
              <label className="edit-profile-button">
                Modifier photo
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleProfilePictureChange}
                />
              </label>
            </div>
          </div>
  
          {error && <p className="error-message">{error}</p>}
  
          <label>Headline
            <input name="headline" value={profile.headline} onChange={handleChangeProfileField} />
          </label>
  
          <label>Résumé
            <textarea name="summary" value={profile.summary} onChange={handleChangeProfileField} />
          </label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ marginLeft: "30px" }}>
          <h2>{profile.firstName} {profile.lastName}</h2>
        </div>
        <div style={{ marginRight: "30px" }}>
          <button onClick={() => setShowContacts(!showContacts)} style={{
            padding: "8px 12px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            cursor: "pointer"
          }}>
            Contacts
          </button>
          {showContacts && (
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <p><strong>Téléphone:</strong> {profile.phone}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Localisation:</strong> {profile.location}</p>
            </div>
          )}
        </div>
      </div>
  
          <h3>Certifications</h3>
          {profile.certifications.map((cert, index) => (
            <div key={index}>
              <input name="name" placeholder="Nom" value={cert.name} onChange={(e) => handleArrayChange('certifications', index, e)} />
              <input name="issuingOrganization" placeholder="Organisme" value={cert.issuingOrganization} onChange={(e) => handleArrayChange('certifications', index, e)} />
              <input name="issueDate" placeholder="Date d'obtention" value={cert.issueDate} onChange={(e) => handleArrayChange('certifications', index, e)} />
              <input name="expirationDate" placeholder="Date d'expiration" value={cert.expirationDate} onChange={(e) => handleArrayChange('certifications', index, e)} />
              <input name="credentialId" placeholder="ID" value={cert.credentialId} onChange={(e) => handleArrayChange('certifications', index, e)} />
              <input name="credentialUrl" placeholder="URL" value={cert.credentialUrl} onChange={(e) => handleArrayChange('certifications', index, e)} />
              <button type="button" onClick={() => removeArrayItem('certifications', index)}>Supprimer</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('certifications', { name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' })}>Ajouter Certification</button>
  
          <h3>Formations</h3>
          {profile.educations.map((edu, index) => (
            <div key={index}>
              <input name="school" placeholder="École" value={edu.school} onChange={(e) => handleArrayChange('educations', index, e)} />
              <input name="degree" placeholder="Diplôme" value={edu.degree} onChange={(e) => handleArrayChange('educations', index, e)} />
              <input name="fieldOfStudy" placeholder="Domaine" value={edu.fieldOfStudy} onChange={(e) => handleArrayChange('educations', index, e)} />
              <input name="startDate" placeholder="Début" value={edu.startDate} onChange={(e) => handleArrayChange('educations', index, e)} />
              <input name="endDate" placeholder="Fin" value={edu.endDate} onChange={(e) => handleArrayChange('educations', index, e)} />
              <textarea name="description" placeholder="Description" value={edu.description} onChange={(e) => handleArrayChange('educations', index, e)} />
              <button type="button" onClick={() => removeArrayItem('educations', index)}>Supprimer</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('educations', { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' })}>Ajouter Formation</button>
  
          <h3>Expériences</h3>
          {profile.experiences.map((exp, index) => (
            <div key={index}>
              <input name="title" placeholder="Poste" value={exp.title} onChange={(e) => handleArrayChange('experiences', index, e)} />
              <input name="company" placeholder="Entreprise" value={exp.company} onChange={(e) => handleArrayChange('experiences', index, e)} />
              <input name="location" placeholder="Lieu" value={exp.location} onChange={(e) => handleArrayChange('experiences', index, e)} />
              <input name="startDate" placeholder="Début" value={exp.startDate} onChange={(e) => handleArrayChange('experiences', index, e)} />
              <input name="endDate" placeholder="Fin" value={exp.endDate} onChange={(e) => handleArrayChange('experiences', index, e)} />
              <textarea name="description" placeholder="Description" value={exp.description} onChange={(e) => handleArrayChange('experiences', index, e)} />
              <button type="button" onClick={() => removeArrayItem('experiences', index)}>Supprimer</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('experiences', { title: '', company: '', location: '', startDate: '', endDate: '', description: '' })}>Ajouter Expérience</button>
  
          <h3>Compétences</h3>
          {profile.skills.map((skill, index) => (
            <div key={index}>
              <input name="name" placeholder="Compétence" value={skill.name} onChange={(e) => handleArrayChange('skills', index, e)} />
              <button type="button" onClick={() => removeArrayItem('skills', index)}>Supprimer</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('skills', { name: '' })}>Ajouter Compétence</button>
  
          <label>CV (PDF)
            <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setCvFile)} />
          </label>
  
          <label>Lettre de motivation (PDF)
            <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setLetterFile)} />
          </label>
  
          <button type="submit">{profileExists ? 'Mettre à jour' : 'Créer Profil'}</button>
          {profileExists && <button type="button" onClick={handleDeleteProfile}>Supprimer Profil</button>}
        </form>
      )}
    </div>
  );
  
};

export default StudentProfileEdit;
