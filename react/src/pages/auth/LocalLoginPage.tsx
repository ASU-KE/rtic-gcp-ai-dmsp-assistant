import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Col, Container, Row } from 'react-bootstrap';

import { useAuthContext } from '../../hooks';
import { login } from '../../context';

import '../../App.css';
import eyeIcon from '../../assets/hide.png';
import eyeOffIcon from '../../assets/unhide.png';

export const LocalLoginPage = () => {
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const { dispatch, state } = useAuthContext();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  const setError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => {
      setErrorMsg('');
    }, 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/${import.meta.env.VITE_BACKEND_PATH_PREFIX}/auth/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data || !response.data.user) {
        throw new Error('Login failed: No user data returned');
      }

      const { user } = response.data;
      dispatch(login(user));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <Container className="mt-4 mb-4">
      <Row className="mb-3">
        <h2 className="mt-2">Login</h2>
        <Col md={8}>
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
        </Col>
      </Row>
    </Container>
  );
};
