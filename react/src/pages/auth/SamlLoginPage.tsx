import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Col, Container, Row } from 'react-bootstrap';

import { useAuthContext } from '../../hooks';
import { login } from "../../context";

import '../../App.css';

export const SamlLoginPage = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const { dispatch, state } = useAuthContext();

  if (import.meta.env.NODE_ENV !== 'production') {
    console.log('LoginPage user:', state.user);
    console.log('LoginPage isAuthenticated:', state.isAuthenticated);
  }

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <Container className="mt-4 mb-4">
      <Row className="mb-3">
        <h2 className="mt-2">Login</h2>
        <Col md={8}>
          <a href="https://dmsp.local.asu.edu/api/sso/login" className="btn btn-primary mb-3">Login with SAML</a>
          {/* <Link to="https://dmsp.local.asu.edu/api/sso/login" className="btn btn-primary mb-3">Login with SAML</Link> */}
        </Col>
      </Row>
    </Container>
  );
};
