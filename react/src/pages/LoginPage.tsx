import { useState } from 'react';
import axios from 'axios';
import '../App.css';
import asuLogo from '../assets/arizona-state-university-logo.png';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import eyeIcon from '../assets/hide.png';
import eyeOffIcon from '../assets/unhide.png';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        import.meta.env.PROD
          ? `https://${import.meta.env.VITE_BACKEND_DOMAIN}/login`
          : `http://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/login`,
        {
          username,
          password,
        }
      );
      const { token, refreshToken } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      navigate('/');
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Login failed');
      setTimeout(() => {
        setErrorMsg('');
      }, 5000);
    }
  };

  return (
    <div className="asu-login-wrapper d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img src={asuLogo} alt="ASU Logo" className="img-fluid" style={{ maxHeight: '60px' }} />
          <h2 className="mt-3 text-center">Sign In</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              User Name
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="User Name"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control pe-5"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img
                src={showPassword ? eyeIcon : eyeOffIcon}
                alt="Toggle visibility"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
              />
            </div>
          </div>

          {errorMsg && (
            <Alert variant="danger" onClose={() => setErrorMsg('')} dismissible>
              {errorMsg}
            </Alert>
          )}

          <button type="submit" className="btn-custom-medium w-100 text-center">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
