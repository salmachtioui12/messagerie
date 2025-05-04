import React, { useState, useEffect } from 'react';
import OfferCard from '../components/Offre/OfferCard';
import axios from 'axios';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.get('/api/v1/student/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          setFavorites(response.data);
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des favoris:", error);
        });
    }
  }, []);

  return (
    <div className="favorites-container">
      <h2>Your Favorites</h2>
      {favorites.map((offer, index) => (
        <OfferCard
          key={index}
          title={offer.title}
          sector={offer.sector}
          type={offer.stage_type}
          duration={offer.duration}
          details={offer}
          offer={offer}
        />
      ))}
    </div>
  );
};

export default Favorites;
