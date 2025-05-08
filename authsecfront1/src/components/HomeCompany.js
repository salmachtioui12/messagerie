import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const HomeCompany = () => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/chatPage'); // Assurez-vous que cette route est bien définie
  };
  return (
    <div>
     <Link to="/company-profile" style={{ textDecoration: 'none', color: '#1976d2' }}>
  Voir mon profil entreprise
</Link>
<Link to="/offers" style={{ textDecoration: 'none', color: '#1976d2' }}>
  Gérer mes Offres
</Link>
<p onClick={handleChatClick} style={{ cursor: 'pointer' }}>💬 Messagerie</p>

      {/* Contenu principal */}
      <div style={{ padding: '2rem' }}>
        <h1>🏢 Espace Entreprise</h1>
        <p>Bienvenue sur la page réservée aux utilisateurs avec le rôle <strong>MANAGER</strong>.</p>
      </div>
      
    </div>
  );
};

export default HomeCompany;