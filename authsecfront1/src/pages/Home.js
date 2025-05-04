/*import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OfferCard from '../components/Offre/OfferCard';
import './styles/Home.css';
import { useNavigate } from 'react-router-dom';

const Home = ({ searchLocation, setSearchLocation, onAddFavorite }) => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login'); // <-- redirige vers /login si pas de token
    }
  }, []);

  const fetchOffers = (location = '') => {
    const token = localStorage.getItem('accessToken');
    console.log("TOKEN:", token);
    const endpoint = location
      ? `/api/v1/student/offers?location=${location}`
      : `/api/v1/student/offers`;

    axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then(response => setOffers(response.data))
      .catch(error => console.error('Erreur lors de la récupération des offres:', error));
};
  

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (!searchLocation || searchLocation.trim() === '') {
      fetchOffers();
    } else {
      fetchOffers(searchLocation);
    }
  }, [searchLocation]);

  return (
    <div className="home-container">
      <p className="offers-header">{`You have ${offers.length} offers`}</p>
      {offers.map((offer, index) => (
        <OfferCard
          key={index}
          title={offer.title}
          sector={offer.sector}
          type={offer.stage_type}
          duration={offer.duration}
          details={offer}
          onAddFavorite={onAddFavorite}
        />
      ))}
    </div>
  );
};

*/

//###############################################################################################""
/*
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OfferCard from '../components/Offre/OfferCard';
import './styles/Home.css';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer'; 

const Home = ({ searchLocation, searchStageType, setSearchLocation, onAddFavorite }) => {
    const [offers, setOffers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login'); // <-- Redirige vers /login si pas de token
    } else {
        setIsReady(true); // <-- on confirme que c'est prêt
      }
  }, [navigate]);

  const fetchOffers = (location = '', stageType = '') => {
    const token = localStorage.getItem('accessToken');
    let endpoint = 'http://localhost:1217/api/v1/student/offers';
  
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (stageType) params.append('stageType', stageType);
  
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
  
    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
    .then(response => setOffers(response.data))
    .catch(error => console.error('Erreur lors de la récupération des offres:', error));
  };
  
  

  useEffect(() => {
    if (isReady) { // <-- seulement si prêt
      fetchOffers();
    }
  }, [isReady]); // <-- dépend de isReady

  useEffect(() => {
    if (isReady) {
      fetchOffers(searchLocation, searchStageType);
    }
  }, [searchLocation, searchStageType, isReady]);
  

 

  return (
    <div className="home-container">
      <p className="offers-header">{`You have ${offers.length} offers`}</p>
      {offers.map((offer, index) => (
        <OfferCard
          key={index}
          offer={offer} // Passez l'objet complet `offer`
          onAddFavorite={onAddFavorite}
        />
      ))}
      {/* Affiche le Footer seulement si showFooter est true */
    //        }
     /* <Footer />
    
    </div>
  );
};



export default Home;
*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OfferCard from '../components/Offre/OfferCard';
import './styles/Home.css';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';

const DEFAULT_PROFILE_PICTURE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const Home = ({ searchLocation, searchStageType, setSearchLocation, onAddFavorite }) => {
  const [offers, setOffers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate = useNavigate();

  // Vérifie l'authentification
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    } else {
      setIsReady(true);
    }
  }, [navigate]);

  // Récupère les offres
  const fetchOffers = (location = '', stageType = '') => {
    const token = localStorage.getItem('accessToken');
    let endpoint = 'http://localhost:1217/api/v1/student/offers';

    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (stageType) params.append('stageType', stageType);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then(response => setOffers(response.data))
    .catch(error => console.error('Erreur lors de la récupération des offres:', error));
  };

  // Chargement initial des offres
  useEffect(() => {
    if (isReady) {
      fetchOffers();
    }
  }, [isReady]);

  // Rafraîchit les offres en fonction des filtres
  useEffect(() => {
    if (isReady) {
      fetchOffers(searchLocation, searchStageType);
    }
  }, [searchLocation, searchStageType, isReady]);

  // Récupération du profil et photo de profil
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profileResponse = await axios.get("http://localhost:1217/api/v1/profiles/my-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userProfile = profileResponse.data;
        setProfile(userProfile);

        try {
          const pictureResponse = await axios.get("http://localhost:1217/api/v1/profiles/profile-picture", {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          setProfilePictureUrl(imageUrl);
        } catch (error) {
          console.warn("Aucune photo trouvée, utilisation image par défaut.");
          setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
        }

      } catch (error) {
        console.error("Erreur de chargement du profil:", error);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleImageClick = () => {
    if (profile) {
      navigate("/profile/view");
    } else {
      navigate("/profile/create");
    }
  };

  return (
    <div className="home-container">
      {!loadingProfile && (
        <div onClick={handleImageClick} style={{ cursor: "pointer", textAlign: "center", marginBottom: "30px" }}>
          <img
            src={profilePictureUrl}
            alt="Avatar utilisateur"
            style={{
              borderRadius: "50%",
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "2px solid #ccc"
            }}
          />
          <p style={{ marginTop: "10px" }}>
            {profile ? "Bienvenue dans votre espace étudiant !" : "Créez votre profil pour commencer"}
          </p>
        </div>
      )}

      <p className="offers-header">{`You have ${offers.length} offers`}</p>

      {offers.map((offer, index) => (
        <OfferCard
          key={index}
          offer={offer}
          onAddFavorite={onAddFavorite}
        />
      ))}

      <Footer />
    </div>
  );
};

export default Home;
