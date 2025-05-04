import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from 'axios';
import './Layout.css';

const MainLayout = ({ children }) => {
  const [searchValue, setSearchValue] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);

  const token = localStorage.getItem('accessToken');

  const fetchFavorites = useCallback(() => {

    if (token) {
      axios.get('http://localhost:1217/api/v1/student/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setFavoritesCount(res.data.length))
        .catch(err => console.error('Erreur favoris:', err));
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  

  const handleAddFavorite = () => {
    fetchFavorites();
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-section">
        <Header onSearchChange={setSearchValue} favoritesCount={favoritesCount} />
        <main className="page-content">
          {React.cloneElement(children, {
            searchLocation: searchValue,
            setSearchLocation: setSearchValue,
            onAddFavorite: handleAddFavorite,
          })}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;