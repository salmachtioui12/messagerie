/*import React, { useState } from 'react';
import axios from 'axios';
import './OfferCard.css';

const OfferCard = ({ title, sector, type, duration, details }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // Pour savoir si l'offre est déjà dans les favoris





  const handleSeeMoreClick = () => {
    setShowDetails(!showDetails); // Toggle l'affichage des détails
  };

  const handleAddToFavorites = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.post(`/api/v1/student/favorites/${details.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(response => {
          setIsFavorite(true); // Marquer comme favori après ajout
          alert("Offre ajoutée aux favoris");
        })
        .catch(error => {
          console.error("Erreur lors de l'ajout aux favoris:", error);
        });
    }
  };


  return (
    <div className="offer-card">
    <div className="offer-image">
        <img alt="Company" className="company-logo" />
    </div>
      <div className="offer-info">
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Type:</strong> {type}</p>
        <p><strong>Duration:</strong> {duration}</p>

        {showDetails && (
          <div className="offer-details">
            <p><strong>Description:</strong> {details.description}</p>
            <p><strong>Location:</strong> {details.location}</p>
          </div>
        )}
      </div>
      <button className="see-more" onClick={handleSeeMoreClick}>
        {showDetails ? "Show less" : "See more"}
      </button>
      
      {showDetails && !isFavorite && (
        <button className="favorite-btn" onClick={handleAddToFavorites}>
          Add to favorites
        </button>
      )}
      {showDetails && isFavorite && (
        <span className="favorite-tag">Favorited</span>
      )}
    </div>
  );
};

export default OfferCard;*/

import React, { useState } from 'react';
import './OfferCard.css';
import axios from 'axios';

const OfferCard = ({ offer, onAddFavorite }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // Pour savoir si l'offre est déjà dans les favoris

  if (!offer || !offer.company) {
    return <div>Loading...</div>; // Affiche un message pendant que les données sont en chargement
  }

  const handleSeeMoreClick = () => {
    setShowDetails(!showDetails); // Toggle l'affichage des détails
  };

  const handleAddToFavorites = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.post(`http://localhost:1217/api/v1/student/favorites/${offer.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(response => {
          setIsFavorite(true); // Marquer comme favori après ajout
          alert("Offre ajoutée aux favoris");
        })
        .catch(error => {
          console.error("Erreur lors de l'ajout aux favoris:", error);
        });
    }
  };

  const imageUrl = `http://localhost:1217/images/${offer.company.picture}`;

  return (
    <div className="offer-card">
      <div className="offer-image">
        <img src={imageUrl} alt={offer.company.name} className="company-logo" />
      </div>
      <div className="offer-info">
        <p><strong>Title:</strong> {offer.title}</p>
        <p><strong>Type:</strong> {offer.stageType}</p>
        <p><strong>Duration:</strong> {offer.duration}</p>
        <p><strong>Sector:</strong> {offer.company.sector}</p>

        {showDetails && (
          <div className="offer-details">
            <p><strong>Description:</strong> {offer.description}</p>
            <p><strong>Location:</strong> {offer.location}</p>
          </div>
        )}
      </div>
      <button className="see-more" onClick={handleSeeMoreClick}>
        {showDetails ? "Show less" : "See more"}
      </button>
      
      {/* Affichage du bouton "Ajouter aux favoris" uniquement si l'offre est visible */}
      {showDetails && !isFavorite && (
        <button className="favorite-btn" onClick={handleAddToFavorites}>
          Add to favorites
        </button>
      )}
      {showDetails && isFavorite && (
        <span className="favorite-tag">Favorited</span>
      )}
    </div>
  );
};

export default OfferCard;
