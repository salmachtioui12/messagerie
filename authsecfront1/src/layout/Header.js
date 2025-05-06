// Header.js
import React, { useState, useEffect } from 'react';
import './Layout.css';
import { useNavigate } from 'react-router-dom'; // <-- Import de useNavigate

const Header = ({ onSearchChange, favoritesCount }) => {
  const navigate = useNavigate(); // <-- Hook pour navigation
  const token = localStorage.getItem('accessToken');
  const [fullName, setFullName] = useState("Utilisateur");

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setFullName(`${payload.firstname} ${payload.lastname}`);
      } catch (e) {
        console.error("Erreur de décodage du token", e);
      }
    }
  }, [token]);

  const handleInputChange = (e) => {
    onSearchChange(e.target.value);
  };

  const handleFavoritesClick = () => {
    navigate('/favorites'); // <-- Redirection vers la page des favoris
  };

  return (
    <header className="header">
      <input
        className="search"
        type="text"
        placeholder="Search by location"
        onChange={handleInputChange}
      />
      <button className="notif-btn">🔔</button>
      <span className="user">{fullName}</span>
      <button className="favorites-btn" onClick={handleFavoritesClick}>
        Favorites ({favoritesCount})
      </button>
    </header>
  );
};

export default Header;