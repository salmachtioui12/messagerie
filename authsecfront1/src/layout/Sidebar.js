import React from 'react';
import './Layout.css';

const Sidebar = () => (
  <aside className="sidebar">
    <h2 className="logo">E<span>InternMatch</span></h2>
    <nav className="nav">
      <p>🏠 HOME</p>
      <p>👤 Profil</p>
      <p>📄 Candidature</p>
      <p>🔔 Notifications</p>
      <p>ℹ️ About</p>
    </nav>
  </aside>
);

export default Sidebar;
