import { useState } from 'react';
import { authorizedRequest } from '../utils/authAxios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, Modal, Container, Row, Col } from 'react-bootstrap';
import horizAsuLogo from '../assets/arizona-state-university-logo.png';
import '../App.css';
import eyeIcon from '../assets/hide.png';
import eyeOffIcon from '../assets/unhide.png';

export const CreateUserPage = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authorizedRequest('POST', '/auth/create-user', form);
      setSuccessMsg('User created successfully!');
      setErrorMsg('');
      setForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user',
      });
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'User not created. Please try again.');
      setSuccessMsg('');
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
    }
  };

  return (
    <Container className="mt-4 mb-4">
      <Row className="mb-3">
        <h2 className="mt-2">Create a New User Account</h2>
        <Col md={8}>
          <Card className="p-4 shadow rounded border-0">
            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  name="username"
                  value={form.username}
                  placeholder="Enter username"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  name="email"
                  placeholder="Enter email"
                  onChange={handleChange}
                  required
                  pattern="^[a-zA-Z0-9._%+-]+@asu\.edu$"
                  title="Please enter a valid ASU email (e.g., user@asu.edu)"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    name="password"
                    onChange={handleChange}
                    required
                    value={form.password}
                    className="pe-5"
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
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  value={form.firstName}
                  placeholder="Enter first name"
                  name="firstName"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  value={form.lastName}
                  placeholder="Enter last name"
                  name="lastName"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select name="role" onChange={handleChange} value={form.role}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>

              {successMsg && <Alert variant="success">{successMsg}</Alert>}
              {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

              <div className="d-flex justify-content-between mt-3">
                <Button
                  className="btn-custom-medium"
                  type="reset"
                  onClick={() =>
                    setForm({
                      username: '',
                      email: '',
                      password: '',
                      firstName: '',
                      lastName: '',
                      role: 'user',
                    })
                  }
                >
                  Reset
                </Button>
                <Button type="submit" className="btn-custom-medium">
                  Create
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
