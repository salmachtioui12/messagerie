import React from 'react';

const Logout = ({ setToken }) => {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
