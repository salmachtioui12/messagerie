import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:1217/api/search";
const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const NvprofileCompany = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);

  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role") || "manager";

  // Fonction pour récupérer le token et vérifier l'authentification
  const getAuthToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  const fetchCompanyProfile = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/profile/${userId}?role=${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCompany(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement du profil entreprise :", err);
      setError("Erreur lors du chargement du profil entreprise.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogo = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/image?userId=${userId}&role=${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(res.data);
      setLogoUrl(imageUrl);
    } catch (err) {
      console.warn("Logo entreprise introuvable.", err);
      setLogoUrl(DEFAULT_LOGO);
    }
  };

  useEffect(() => {
    if (!userId || !role) {
      setError("Paramètres invalides.");
      setLoading(false);
      return;
    }

    fetchCompanyProfile();
    fetchLogo();
  }, [userId, role]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!company) return <div>Aucune entreprise trouvée.</div>;

  const handleGoToChat = () => {
    // Redirige l'utilisateur vers la page de messagerie
    navigate(`/ChatPage?receiverId=${userId}&role=MANAGER`);

  };

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh", padding: "30px 0" }}>
      <div
        style={{
          backgroundColor: "#fff",
          maxWidth: "900px",
          margin: "auto",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          gap: "30px",
        }}
      >
        <img
          src={logoUrl}
          alt="Logo entreprise"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "16px",
            objectFit: "cover",
            border: "1px solid #ccc",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        />
        <div>
          <h2 style={{ margin: "0 0 10px" }}>{company.name}</h2>
          {company.sector && <p><strong>Secteur :</strong> {company.sector}</p>}
          {company.website && (
            <p>
              <strong>Site Web :</strong>{" "}
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.website}
              </a>
            </p>
          )}
          {company.description && (
            <div style={{ marginTop: "20px" }}>
              <strong>Description :</strong>
              <p>{company.description}</p>
            </div>
          )}
          {/* Petit bouton pour rediriger vers la page de messagerie */}
          <button 
            style={{ 
              backgroundColor: "#007BFF", 
              color: "#fff", 
              border: "none", 
              padding: "10px 15px", 
              borderRadius: "5px", 
              cursor: "pointer",
              fontSize: "14px",
              marginTop: "20px"
            }} 
            onClick={handleGoToChat}
          >
            Envoyer un message
          </button>
        </div>
      </div>
    </div>
  );
};

export default NvprofileCompany;
