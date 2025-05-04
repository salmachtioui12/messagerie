import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1/profiles';
const DEFAULT_PROFILE_PICTURE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
const DEFAULT_COVER_PHOTO = "https://via.placeholder.com/1200x300.png?text=Cover+Photo";

const StudentProfileView = () => {
  

  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(DEFAULT_COVER_PHOTO);
  const [cvUrl, setCvUrl] = useState(null);
  const [motivationLetterUrl, setMotivationLetterUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const navigate = useNavigate();

  const reloadProfile = async () => {
    const token = localStorage.getItem("accessToken");
    const headers = { Authorization: `Bearer ${token}` };
    const accessToken = localStorage.getItem("accessToken");

if (accessToken) {
  const base64Url = accessToken.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = JSON.parse(window.atob(base64));
  const emailFromToken = decoded.sub; // L'email est dans "sub" dans le JWT
  console.log("Email récupéré depuis le token:", emailFromToken);
}


    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/my-profile`, { headers });
      const userProfile = profileResponse.data;
      setProfile(userProfile);

      try {
        const pictureResponse = await axios.get(`${API_BASE_URL}/profile-picture`, { headers, responseType: 'blob' });
        setProfilePictureUrl(URL.createObjectURL(pictureResponse.data));
      } catch {
        setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
      }

      try {
        const coverResponse = await axios.get(`${API_BASE_URL}/cover-photo`, { headers, responseType: 'blob' });
        setCoverPhotoUrl(URL.createObjectURL(coverResponse.data));
      } catch {
        setCoverPhotoUrl(DEFAULT_COVER_PHOTO);
      }

      try {
        const cvResponse = await axios.get(`${API_BASE_URL}/cv`, { headers, responseType: 'blob' });
        setCvUrl(URL.createObjectURL(cvResponse.data));
      } catch {
        setCvUrl(null);
      }

      try {
        const motivationResponse = await axios.get(`${API_BASE_URL}/letter`, { headers, responseType: 'blob' });
        setMotivationLetterUrl(URL.createObjectURL(motivationResponse.data));
      } catch {
        setMotivationLetterUrl(null);
      }

    } catch (profileError) {
      console.error('Erreur de rechargement du profil:', profileError);
      setError("Impossible de charger votre profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
if (storedEmail) {
  setEmail(storedEmail);
}
    reloadProfile();
  }, [navigate]);

  const handleDeleteFile = async (fileType) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Vous devez être connecté.");
      navigate("/login");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/file/${fileType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      switch (fileType) {
        case "cover-photo":
          setCoverPhotoUrl(DEFAULT_COVER_PHOTO);
          alert("Photo de couverture supprimée !");
          break;
        case "profile-picture":
          setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
          alert("Photo de profil supprimée !");
          break;
        case "cv":
          setCvUrl(null);
          alert("CV supprimé !");
          break;
        case "letter":
          setMotivationLetterUrl(null);
          alert("Lettre de motivation supprimée !");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du fichier.");
    }
  };

  const handleDeleteCover = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre photo de couverture ?")) {
      handleDeleteFile("cover-photo");
    }
  };

  const handleDeleteProfilePicture = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
      handleDeleteFile("profile-picture");
    }
  };

  const handleDeleteCv = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre CV ?")) {
      handleDeleteFile("cv");
    }
  };

  const handleDeleteLetter = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre lettre de motivation ?")) {
      handleDeleteFile("letter");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>Aucun profil trouvé.</p>;

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
          <img
            src={profilePictureUrl}
            alt="Profile"
            style={{
              width: "140px",
              height: "140px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "5px solid white",
              position: "absolute",
              bottom: "-70px",
              left: "40px",
              backgroundColor: "#fff"
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          <button onClick={handleDeleteCover} style={{
            padding: "8px 12px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Supprimer la Cover
          </button>
        </div>

        <div style={{ padding: "90px 40px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: "0", fontSize: "28px" }}>{profile.firstName} {profile.lastName}</h2>
          </div>
          <div>
            <button onClick={() => setShowContacts(!showContacts)} style={{
              padding: "8px 16px",
              borderRadius: "20px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              cursor: "pointer",
              fontWeight: "bold",
            }}>
              Contacts
            </button>
            {showContacts && (
              <div style={{ textAlign: "right", marginTop: "10px", fontSize: "14px" }}>
                <p><strong>Téléphone:</strong> {profile.phone}</p>
                <p><strong>Email:</strong> {email}</p>

                
                <p><strong>Localisation:</strong> {profile.location}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "20px 40px" }}>
          <h3>À propos</h3>
          <p style={{ marginTop: "10px", color: "#555" }}>{profile.summary}</p>
        </div>

        <div style={{ padding: "20px 40px" }}>
          <h3>Expériences</h3>
          {profile.experiences?.map((exp, index) => (
            <div key={index} style={{
              backgroundColor: "#fafafa",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "10px",
              border: "1px solid #eee"
            }}>
              <p><strong>{exp.title}</strong> | {exp.startDate} - {exp.endDate}</p>
              <p>{exp.location}</p>
              <p style={{ color: "#666" }}>{exp.description}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 40px" }}>
          <h3>Formations</h3>
          {profile.educations?.map((edu, index) => (
            <div key={index} style={{
              backgroundColor: "#fafafa",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "10px",
              border: "1px solid #eee"
            }}>
              <p><strong>{edu.degree}</strong> | {edu.startDate} - {edu.endDate}</p>
              <p>{edu.fieldOfStudy} - {edu.school}</p>
              <p style={{ color: "#666" }}>{edu.description}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 40px" }}>
          <h3>Compétences</h3>
          <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
            {profile.skills?.map((skill, index) => (
              <li key={index} style={{ marginBottom: "5px", color: "#555" }}>{skill.name}</li>
            ))}
          </ul>
        </div>

        <div style={{ padding: "20px 40px" }}>
          <h3>Certifications</h3>
          {profile.certifications?.map((cert, index) => (
            <div key={index} style={{
              backgroundColor: "#fafafa",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "10px",
              border: "1px solid #eee"
            }}>
              <p><strong>{cert.name}</strong> | {cert.issueDate}</p>
              <p>{cert.issuedBy}</p>
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ color: "#5c9ead" }}>
                  Voir certification
                </a>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 40px" }}>
          <h3>Documents</h3>
          {cvUrl && (
            <p>
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff" }}>
                📄 Voir CV
              </a>{" "}
              <button onClick={handleDeleteCv} style={{ marginLeft: "10px", color: "#e74c3c", background: "none", border: "none", cursor: "pointer" }}>
                Supprimer
              </button>
            </p>
          )}
          {motivationLetterUrl && (
            <p>
              <a href={motivationLetterUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff" }}>
                📄 Voir lettre de motivation
              </a>{" "}
              <button onClick={handleDeleteLetter} style={{ marginLeft: "10px", color: "#e74c3c", background: "none", border: "none", cursor: "pointer" }}>
                Supprimer
              </button>
            </p>
          )}
        </div>

        <div style={{ textAlign: "center", padding: "30px 40px" }}>
          <button
            onClick={() => navigate(`/profile/edit/${profile.id}`)}
            style={{
              padding: "10px 30px",
              backgroundColor: "#5c9ead",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)"
            }}
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;
