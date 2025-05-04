/*import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validation des mots de passe
    if (newPassword !== confirmationPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    if (newPassword === currentPassword) {
      setMessage("Le nouveau mot de passe doit être différent de l'actuel");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.patch(
        'http://localhost:1217/api/v1/users/change-password',
        {
          currentPassword,
          newPassword,
          confirmationPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true // Important pour les cookies/sessions
        }
      );

      setMessage(response.data?.message || "Mot de passe changé avec succès !");
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Échec du changement de mot de passe";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  // Styles séparés pour les états hover
  const buttonHoverStyles = {
    logoutButton: {
      backgroundColor: '#d32f2f'
    },
    submitButton: {
      backgroundColor: '#1565c0'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Changer le mot de passe</h2>
        <button 
          onClick={handleLogout}
          style={styles.logoutButton}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverStyles.logoutButton.backgroundColor}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.logoutButton.backgroundColor}
        >
          Déconnexion
        </button>
      </div>
      
      <form style={styles.form} onSubmit={handleChangePassword}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Mot de passe actuel</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
            required
            minLength="8"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            value={confirmationPassword}
            onChange={(e) => setConfirmationPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        
        <button 
          type="submit" 
          style={styles.submitButton}
          disabled={!currentPassword || !newPassword || !confirmationPassword || isLoading}
          onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = buttonHoverStyles.submitButton.backgroundColor)}
          onMouseOut={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = styles.submitButton.backgroundColor)}
        >
          {isLoading ? 'Chargement...' : 'Changer le mot de passe'}
        </button>
      </form>
      
      {message && (
        <p style={message.includes('succès') ? styles.successMessage : styles.errorMessage}>
          {message}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  title: {
    fontSize: '1.5rem',
    color: '#333',
    margin: 0
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.3s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    color: '#555',
    fontWeight: '500'
  },
  input: {
    padding: '0.8rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    ':focus': {
      outline: 'none',
      borderColor: '#1976d2',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    }
  },
  submitButton: {
    padding: '0.8rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  successMessage: {
    color: '#2e7d32',
    backgroundColor: '#edf7ed',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
    textAlign: 'center',
    border: '1px solid #c8e6c9'
  },
  errorMessage: {
    color: '#d32f2f',
    backgroundColor: '#fdecea',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
    textAlign: 'center',
    border: '1px solid #ffcdd2'
  }
};

export default ChangePassword;
*/

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePassword = ({ token }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validation des mots de passe
    if (newPassword !== confirmationPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    if (newPassword === currentPassword) {
      setMessage("Le nouveau mot de passe doit être différent de l'actuel");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.patch(
        'http://localhost:1217/api/v1/users',
        {
          currentPassword,
          newPassword,
          confirmationPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setMessage(response.data?.message || "Mot de passe changé avec succès !");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Échec du changement de mot de passe";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  // Styles séparés pour les états hover
  const buttonHoverStyles = {
    logoutButton: {
      backgroundColor: '#d32f2f'
    },
    submitButton: {
      backgroundColor: '#1565c0'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Changer le mot de passe</h2>
        <button 
          onClick={handleLogout}
          style={styles.logoutButton}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverStyles.logoutButton.backgroundColor}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.logoutButton.backgroundColor}
        >
          Déconnexion
        </button>
      </div>
      
      <form style={styles.form} onSubmit={handleChangePassword}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Mot de passe actuel</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
            required
            minLength="8"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            value={confirmationPassword}
            onChange={(e) => setConfirmationPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        
        <button 
          type="submit" 
          style={styles.submitButton}
          disabled={!currentPassword || !newPassword || !confirmationPassword || isLoading}
          onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = buttonHoverStyles.submitButton.backgroundColor)}
          onMouseOut={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = styles.submitButton.backgroundColor)}
        >
          {isLoading ? 'Chargement...' : 'Changer le mot de passe'}
        </button>
      </form>
      
      {message && (
        <p style={message.includes('succès') ? styles.successMessage : styles.errorMessage}>
          {message}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  title: {
    fontSize: '1.5rem',
    color: '#333',
    margin: 0
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.3s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    color: '#555',
    fontWeight: '500'
  },
  input: {
    padding: '0.8rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    ':focus': {
      outline: 'none',
      borderColor: '#1976d2',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    }
  },
  submitButton: {
    padding: '0.8rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  successMessage: {
    color: '#2e7d32',
    backgroundColor: '#edf7ed',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
    textAlign: 'center',
    border: '1px solid #c8e6c9'
  },
  errorMessage: {
    color: '#d32f2f',
    backgroundColor: '#fdecea',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
    textAlign: 'center',
    border: '1px solid #ffcdd2'
  }
};

export default ChangePassword;