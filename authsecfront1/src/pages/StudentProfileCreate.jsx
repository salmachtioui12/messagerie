import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './StudentProfileForm.css'; // <-- Ton CSS importé ici

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1/profiles';

const StudentProfileCreate = () => {
  const [profile, setProfile] = useState({
    headline: '',
    summary: '',
    location: '',
    phone: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [letterFile, setLetterFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Nettoyer les URLs créées pour éviter fuite mémoire
  useEffect(() => {
    return () => {
      if (coverPhoto) URL.revokeObjectURL(coverPhoto);
      if (profilePicture) URL.revokeObjectURL(profilePicture);
    };
  }, [coverPhoto, profilePicture]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "cv") setCvFile(files[0]);
    if (name === "letter") setLetterFile(files[0]);
    if (name === "profilePicture") setProfilePicture(files[0]);
    if (name === "coverPhoto") setCoverPhoto(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("profile", JSON.stringify(profile));
    if (cvFile) formData.append("cv", cvFile);
    if (letterFile) formData.append("letter", letterFile);
    if (profilePicture) formData.append("profilePicture", profilePicture);
    if (coverPhoto) formData.append("coverPhoto", coverPhoto);

    try {
      await axios.post(`${API_BASE_URL}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Profil créé avec succès !");
      navigate("/profile/view");
    } catch (error) {
      console.error("Erreur création profil:", error);
      setError("Erreur lors de la création du profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <div className="cover-photo-container">
          {/* Cover Photo */}
          <div className="cover-photo-wrapper">
            {coverPhoto ? (
              <img src={URL.createObjectURL(coverPhoto)} alt="Cover" className="cover-photo" />
            ) : (
              <div className="cover-photo-placeholder" />
            )}
            <label className="edit-cover-button">
              Edit cover
              <input
                type="file"
                name="coverPhoto"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Profile Picture */}
          <div className="profile-picture-wrapper">
            <div className="profile-picture-container">
              {profilePicture ? (
                <img src={URL.createObjectURL(profilePicture)} alt="Profile" />
              ) : (
                <div className="profile-picture-placeholder" />
              )}
            </div>
            <label className="edit-profile-button">
              Edit profile
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Error */}
        {error && <p className="error-message">{error}</p>}

        {/* Inputs */}
        <input
          type="text"
          name="headline"
          value={profile.headline}
          onChange={handleChange}
          placeholder="Titre"
          required
        />
        <textarea
          name="summary"
          value={profile.summary}
          onChange={handleChange}
          placeholder="Résumé"
          required
        />
        <input
          type="text"
          name="location"
          value={profile.location}
          onChange={handleChange}
          placeholder="Localisation"
        />
        <input
          type="text"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          placeholder="Téléphone"
        />

        {/* Uploads */}
        <label>Upload CV</label>
        <input
          type="file"
          name="cv"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        <label>Upload Lettre de Motivation</label>
        <input
          type="file"
          name="letter"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        {/* Submit */}
        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer le profil"}
        </button>
      </form>
    </div>
  );
};

export default StudentProfileCreate;
