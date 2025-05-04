/*import React, { useState } from 'react';
import api from '../api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '1085338903546-fau3ggfp9ek9ebccd4qinsi9a8sppgeg.apps.googleusercontent.com';
const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await api.post(`/auth/authenticate`, formData);
      if (response?.data) {
        const { access_token: token, refresh_token: refreshToken } = response.data;
        setToken(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/home'), 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Login failed. Please try again.';
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleResponse) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await api.post(
        `/auth/google`, 
        { token: googleResponse.credential }
      );

      if (response?.data) {
        const { access_token, refresh_token, name } = response.data;
        setToken(access_token);
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        setMessage(`Welcome ${name}! Redirecting...`);
        setTimeout(() => navigate('/change-password'), 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  */


/*LA PARTIE CHAGER */

/*
import React, { useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '1085338903546-fau3ggfp9ek9ebccd4qinsi9a8sppgeg.apps.googleusercontent.com';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`http://localhost:1217/api/v1/auth/authenticate`, formData);
      if (response?.data) {
        const { access_token: token, refresh_token: refreshToken } = response.data;
        setToken(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const decoded = parseJwt(token);
        const userRole = decoded?.role;

        if (userRole === 'HR') {
          setMessage('Bienvenue Manager ! Redirection...');
          setTimeout(() => navigate('/homecompany'), 1500);
        } else if (userRole === 'STUDENT') {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => navigate('/home'), 1500);
        }else{          
          setMessage('u are admin');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Login failed. Please try again.';
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleResponse) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`http://localhost:1217/api/v1/auth/google`, { token: googleResponse.credential });

      if (response?.data) {
        const { access_token, refresh_token, name } = response.data;
        setToken(access_token);
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        const decoded = parseJwt(access_token);
        const userRole = decoded?.role;

        if (userRole === 'HR') {
          setMessage(`Bienvenue ${name} ! Redirection...`);
          setTimeout(() => navigate('/homecompany'), 1500);
        } else {
          setMessage(`Welcome ${name}! Redirecting...`);
          setTimeout(() => navigate('/change-password'), 1500);
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

 



*/

/*FIN PARTIE CHANGER */


/*

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputContainer}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={{...styles.input, ...(errors.email && styles.inputError)}}
              required
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>
          
          <div style={styles.inputContainer}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={styles.passwordInputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={{...styles.input, ...(errors.password && styles.inputError)}}
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                style={styles.showPasswordButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={styles.registerLinkContainer}>
          <p style={styles.registerText}>Don't have an account?</p>
          <button 
            onClick={() => navigate('/register')} 
            style={styles.textButton}
          >
            Register
          </button>
        </div>
        
        <div style={styles.dividerContainer}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine}></div>
        </div>
        
        <div style={styles.socialLogin}>
          <div style={styles.googleBtnContainer}>
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => setMessage("Google login failed")}
              text="continue_with"
              shape="rectangular"
              locale='en'
            />
          </div>
        </div>

        {message && (
          <p style={{
            ...styles.message,
            ...(message.toLowerCase().includes('fail') ? styles.error : styles.success)
          }}>
            {message}
          </p>
        )}
      </div>
    </GoogleOAuthProvider>
  );

};
const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  title: {
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: '1.5rem',
    fontSize: '1.75rem',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#333333',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '0.9375rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  passwordInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '0.5rem',
  },
  textButton: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0',
    textDecoration: 'underline',
  },
  registerLinkContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  registerText: {
    fontSize: '0.875rem',
    color: '#666666',
    margin: '0',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    padding: '0 1rem',
    color: '#999999',
    fontSize: '0.875rem',
  },
  socialLogin: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  googleBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  message: {
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    marginTop: '1rem',
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#f6ffed',
    color: '#52c41a',
    border: '1px solid #b7eb8f',
  },
  error: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f',
    border: '1px solid #ffccc7',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
};

export default Login;*/

//#########################################################################################
import React, { useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'VOTRE_CLIENT_ID_GOOGLE';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const storeTokens = (token, refreshToken) => {
    setToken(token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const redirectUser = async (decoded, name = '') => {
    const role = decoded?.role;
    const email = decoded?.sub;

    if (email) {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/by-email?email=${email}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        const userId = res.data.id;
        localStorage.setItem('userId', userId);
      } catch (err) {
        console.error("❌ Impossible de récupérer l'userId depuis l'email", err);
      }
    }

    if (role === 'MANAGER') {
      setMessage(`Bienvenue ${name || 'Manager'} ! Redirection...`);
      setTimeout(() => navigate('/homecompany'), 1500);
    } else {
      setMessage(`Bienvenue ${name || 'User'} ! Redirection...`);
      setTimeout(() => navigate('/home'), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/authenticate`, formData);
      const { access_token, refresh_token } = response.data;
      storeTokens(access_token, refresh_token);
      const decoded = parseJwt(access_token);
      await redirectUser(decoded);
    } catch (error) {
      const err = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      setMessage(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleResponse) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        token: googleResponse.credential,
      });
      const { access_token, refresh_token, name } = response.data;
      storeTokens(access_token, refresh_token);
      const decoded = parseJwt(access_token);
      await redirectUser(decoded, name);
    } catch (error) {
      const err = error.response?.data?.message || 'Google login failed.';
      setMessage(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange(e)}
              style={{ ...styles.input, ...(errors.email && styles.inputError) }}
              required
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordInputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={(e) => handleChange(e)}
                style={{ ...styles.input, ...(errors.password && styles.inputError) }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.registerLinkContainer}>
          <p style={styles.registerText}>Don't have an account?</p>
          <button onClick={() => navigate('/register')} style={styles.textButton}>
            Register
          </button>
        </div>

        <div style={styles.dividerContainer}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR</span>
          <div style={styles.dividerLine}></div>
        </div>

        <div style={styles.googleBtnContainer}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMessage("Google login failed")} />
        </div>

        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.toLowerCase().includes('fail') || message.toLowerCase().includes('invalid')
                ? styles.error
                : styles.success),
            }}
          >
            {message}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '0.9375rem',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  registerLinkContainer: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  registerText: {
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
  },
  textButton: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '0.875rem',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    padding: '0 1rem',
    fontSize: '0.875rem',
    color: '#999999',
  },
  googleBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  message: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  success: {
    backgroundColor: '#f6ffed',
    color: '#52c41a',
    border: '1px solid #b7eb8f',
  },
  error: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f',
    border: '1px solid #ffccc7',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: '0.75rem',
  },
};

export default Login;


////
/*
import React, { useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '1085338903546-fau3ggfp9ek9ebccd4qinsi9a8sppgeg.apps.googleusercontent.com';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/authenticate`, formData);
      if (response?.data) {
        const { access_token: token, refresh_token: refreshToken } = response.data;
        setToken(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const decoded = parseJwt(token);
        if (decoded?.sub) {
          localStorage.setItem('email', decoded.sub);
        }
        

        const userRoles = decoded?.roles;
        const userRole = userRoles ? userRoles[0] : null;

        if (userRole === 'MANAGER') {
          setMessage('Bienvenue Manager ! Redirection...');
          setTimeout(() => navigate('/homecompany'), 1500);
        } else if (userRole === 'ROLE_USER') {
          setMessage('Bienvenue sur E-InternMatch ! Redirection...');
          setTimeout(() => navigate('/student'), 1500);
        } else {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => navigate('/change-password'), 1500);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please try again.';
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleResponse) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/google`,
        { token: googleResponse.credential }
      );

      if (response?.data) {
        const { access_token, refresh_token, name } = response.data;
        setToken(access_token);
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        const decoded = parseJwt(access_token);
        if (decoded?.sub) {
          localStorage.setItem('email', decoded.sub);
        }
        

        const userRoles = decoded?.roles;
        const userRole = userRoles ? userRoles[0] : null;

        if (userRole === 'MANAGER') {
          setMessage(`Bienvenue ${name} ! Redirection...`);
          setTimeout(() => navigate('/homecompany'), 1500);
        } else if (userRole === 'ROLE_USER') {
          setMessage(`Bienvenue ${name} ! Redirection...`);
          setTimeout(() => navigate('/student'), 1500);
        } else {
          setMessage(`Welcome ${name}! Redirecting...`);
          setTimeout(() => navigate('/change-password'), 1500);
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>Email</label>
            <input
              style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordInputWrapper}>
              <input
                style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={styles.showPasswordButton}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{ ...styles.button, backgroundColor: '#4caf50', marginTop: '0.5rem' }}
          >
            Register
          </button>
        </form>

        <div style={styles.dividerContainer}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine}></div>
        </div>

        <div style={styles.googleBtnContainer}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMessage("Google login failed")} />
        </div>

        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.includes('fail') || message.includes('invalide')
                ? styles.error
                : styles.success),
            }}
          >
            {message}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  title: {
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: '1.5rem',
    fontSize: '1.75rem',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#333333',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '0.9375rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  passwordInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '0.5rem',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    padding: '0 1rem',
    color: '#999999',
    fontSize: '0.875rem',
  },
  googleBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  message: {
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    marginTop: '1rem',
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#f6ffed',
    color: '#52c41a',
    border: '1px solid #b7eb8f',
  },
  error: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f',
    border: '1px solid #ffccc7',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
};

export default Login;
*/