import React from 'react';
import './Layout.css';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/chatPage'); // Assurez-vous que cette route est bien définie
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">E<span>InternMatch</span></h2>
      <nav className="nav">
        <p>🏠 HOME</p>
        <p>👤 Profil</p>
        <p>📄 Candidature</p>
        <p>🔔 Notifications</p>
        <p>ℹ️ About</p>
        <p onClick={handleChatClick} style={{ cursor: 'pointer' }}>💬 Messagerie</p>
      </nav>
    </aside>
  );
};

export default Sidebar;
