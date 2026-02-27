import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store token
      localStorage.setItem('token', token);

      // Fetch user data
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          login(user, token);
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          navigate('/login');
        });
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '1.5rem'
    }}>
      Authenticating...
    </div>
  );
};

export default AuthCallback;
