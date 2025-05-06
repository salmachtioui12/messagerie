import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/search';
const DEFAULT_PROFILE_PICTURE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
const DEFAULT_COVER_PHOTO = "https://via.placeholder.com/1200x300.png?text=Cover+Photo";

const NvprofileStudent = () => {
  const [profile, setProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(DEFAULT_COVER_PHOTO);
  const [cvUrl, setCvUrl] = useState(null);
  const [motivationLetterUrl, setMotivationLetterUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContacts, setShowContacts] = useState(false);

  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role");

  const currentUserId = localStorage.getItem("userId");

  const getAuthToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  const fetchProfilePicture = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(
        `${API_BASE_URL}/image?userId=${userId}&role=${role}`,
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } }
      );
      const imageUrl = URL.createObjectURL(res.data);
      setProfilePictureUrl(imageUrl);
    } catch {
      setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
    }
  };

  const fetchCoverPhoto = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(
        `${API_BASE_URL}/cover-photo?userId=${userId}&role=${role}`,
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } }
      );
      const imageUrl = URL.createObjectURL(res.data);
      setCoverPhotoUrl(imageUrl);
    } catch {
      setCoverPhotoUrl(DEFAULT_COVER_PHOTO);
    }
  };

  const fetchCv = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(
        `${API_BASE_URL}/cv?userId=${userId}&role=${role}`,
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } }
      );
      setCvUrl(URL.createObjectURL(res.data));
    } catch {
      setCvUrl(null);
    }
  };

  const fetchMotivationLetter = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await axios.get(
        `${API_BASE_URL}/letter?userId=${userId}&role=${role}`,
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } }
      );
      setMotivationLetterUrl(URL.createObjectURL(res.data));
    } catch {
      setMotivationLetterUrl(null);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;
      const timestamp = new Date().getTime();
      const roleToSend = role === "STUDENT" ? "user" : role;
      const res = await axios.get(
        `${API_BASE_URL}/profile/${userId}?role=${roleToSend}&timestamp=${timestamp}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data;
      if (!data) {
        setError("Aucun profil trouvé.");
        return;
      }
      setProfile(data);
      await Promise.all([
        fetchProfilePicture(),
        fetchCoverPhoto(),
        fetchCv(),
        fetchMotivationLetter()
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement du profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId || !role) {
      setError("Paramètres invalides.");
      setLoading(false);
      return;
    }
    fetchProfile();
    return () => {
      [profilePictureUrl, coverPhotoUrl, cvUrl, motivationLetterUrl].forEach(url => {
        if (url && url !== DEFAULT_PROFILE_PICTURE && url !== DEFAULT_COVER_PHOTO) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [userId, role]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Aucun profil trouvé.</div>;

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh", padding: "30px 0" }}>
      <div style={{
        backgroundColor: "#ffffff",
        width: "90%",
        maxWidth: "1000px",
        margin: "auto",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}>
        <div style={{ position: "relative", height: "250px", backgroundColor: "#ccc" }}>
          <img src={coverPhotoUrl} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <img src={profilePictureUrl} alt="Profile" style={{
            width: "140px", height: "140px", objectFit: "cover", borderRadius: "50%",
            border: "5px solid white", position: "absolute", bottom: "-70px", left: "40px"
          }} />
        </div>

        <div style={{ padding: "90px 40px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: "0", fontSize: "28px" }}>{profile.firstName} {profile.lastName}</h2>
            {profile.headline && <p style={{ marginTop: "5px", color: "#666" }}>{profile.headline}</p>}
          </div>

          <div>
            {/* ✅ Affiche le bouton uniquement si ce n’est PAS le profil de l'utilisateur connecté */}
            {String(currentUserId) !== String(userId) && (
              <div style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => navigate(`/ChatPage?receiverId=${userId}&role=STUDENT`)}
                  style={{
                    backgroundColor: "#007BFF", color: "#fff", border: "none", padding: "10px 20px",
                    borderRadius: "5px", cursor: "pointer", fontSize: "16px"
                  }}
                >
                  Envoyer un message
                </button>
              </div>
            )}

            <button
              onClick={() => setShowContacts(!showContacts)}
              style={{
                padding: "8px 16px", borderRadius: "20px", backgroundColor: showContacts ? "#e0e0e0" : "#f0f0f0",
                border: "1px solid #ccc", cursor: "pointer", fontWeight: "bold"
              }}
            >
              {showContacts ? "Masquer contacts" : "Afficher contacts"}
            </button>

            {showContacts && (
              <div style={{ textAlign: "right", marginTop: "10px", fontSize: "14px" }}>
                {profile.phone && <p><strong>Téléphone:</strong> {profile.phone}</p>}
                {profile.email && <p><strong>Email:</strong> {profile.email}</p>}
                {profile.location && <p><strong>Localisation:</strong> {profile.location}</p>}
              </div>
            )}
          </div>
        </div>

       {/* About Section */}
       {profile.summary && (
          <div style={{ padding: "20px 40px" }}>
            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>À propos</h3>
            <p style={{ marginTop: "10px", color: "#555", lineHeight: "1.6" }}>{profile.summary}</p>
          </div>
        )}

        {/* Experiences Section */}
        {profile.experiences?.length > 0 && (
          <div style={{ padding: "20px 40px" }}>
            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Expériences</h3>
            {profile.experiences.map((exp, index) => (
              <div key={index} style={{
                backgroundColor: "#fafafa",
                padding: "15px",
                borderRadius: "10px",
                margin: "15px 0",
                border: "1px solid #eee"
              }}>
                <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>{exp.title}</p>
                <p style={{ margin: "0 0 5px", color: "#666" }}>
                  {exp.startDate} - {exp.endDate || "Présent"} | {exp.location}
                </p>
                {exp.description && (
                  <p style={{ margin: "10px 0 0", color: "#555" }}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {profile.educations?.length > 0 && (
          <div style={{ padding: "20px 40px" }}>
            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Formations</h3>
            {profile.educations.map((edu, index) => (
              <div key={index} style={{
                backgroundColor: "#fafafa",
                padding: "15px",
                borderRadius: "10px",
                margin: "15px 0",
                border: "1px solid #eee"
              }}>
                <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>{edu.degree}</p>
                <p style={{ margin: "0 0 5px", color: "#666" }}>
                  {edu.startDate} - {edu.endDate || "Présent"} | {edu.school}
                </p>
                {edu.fieldOfStudy && (
                  <p style={{ margin: "0 0 5px", color: "#666" }}>Domaine: {edu.fieldOfStudy}</p>
                )}
                {edu.description && (
                  <p style={{ margin: "10px 0 0", color: "#555" }}>{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {profile.skills?.length > 0 && (
          <div style={{ padding: "20px 40px" }}>
            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Compétences</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {profile.skills.map((skill, index) => (
                <span 
                  key={index} 
                  style={{
                    backgroundColor: "#e0e0e0",
                    padding: "5px 10px",
                    borderRadius: "15px",
                    fontSize: "14px"
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {profile.certifications?.length > 0 && (
          <div style={{ padding: "20px 40px" }}>
            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Certifications</h3>
            {profile.certifications.map((cert, index) => (
              <div key={index} style={{
                backgroundColor: "#fafafa",
                padding: "15px",
                borderRadius: "10px",
                margin: "15px 0",
                border: "1px solid #eee"
              }}>
                <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>{cert.name}</p>
                <p style={{ margin: "0 0 5px", color: "#666" }}>
                  Émis par: {cert.issuedBy} | {cert.issueDate}
                </p>
                {cert.url && (
                  <a 
                    href={cert.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      display: "inline-block", 
                      marginTop: "10px", 
                      color: "#5c9ead",
                      textDecoration: "none",
                      fontWeight: "bold"
                    }}
                  >
                    Voir certification →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {(cvUrl || motivationLetterUrl) && (
          <div style={{ padding: "20px 40px" }}>
            <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Documents</h3>
            <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{
                  color: "#007bff", padding: "8px 15px", border: "1px solid #007bff",
                  borderRadius: "5px", textDecoration: "none", fontWeight: "bold"
                }}>📄 Voir CV</a>
              )}
              {motivationLetterUrl && (
                <a href={motivationLetterUrl} target="_blank" rel="noopener noreferrer" style={{
                  color: "#007bff", padding: "8px 15px", border: "1px solid #007bff",
                  borderRadius: "5px", textDecoration: "none", fontWeight: "bold"
                }}>📄 Lettre de motivation</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NvprofileStudent;
