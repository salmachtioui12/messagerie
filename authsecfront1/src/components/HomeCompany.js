import React from 'react';
import { Link } from 'react-router-dom';

const HomeCompany = () => {
  return (
    <div>
     <Link to="/company-profile" style={{ textDecoration: 'none', color: '#1976d2' }}>
  Voir mon profil entreprise
</Link>
<Link to="/offers" style={{ textDecoration: 'none', color: '#1976d2' }}>
  Gérer mes Offres
</Link>

      {/* Contenu principal */}
      <div style={{ padding: '2rem' }}>
        <h1>🏢 Espace Entreprise</h1>
        <p>Bienvenue sur la page réservée aux utilisateurs avec le rôle <strong>MANAGER</strong>.</p>
      </div>
      
    </div>
  );
};

export default HomeCompany;