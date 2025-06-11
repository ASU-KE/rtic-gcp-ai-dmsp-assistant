import { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';

interface Props {
  onSuccess: () => void;
}

export const UpdateUserPage = ({ onSuccess }: Props) => {
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const response = await axios.patch(
        import.meta.env.PROD
          ? `https://${import.meta.env.VITE_BACKEND_DOMAIN}/user/update/${userId}`
          : `http://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/user/update/${userId}`,
        { firstName, lastName, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = response.data?.data;

      if (!updatedUser) {
        setErrorMsg('User not found or not updated.');
        setSuccessMsg('');
        setTimeout(() => setErrorMsg(''), 3000);
      } else {
        setSuccessMsg('User updated successfully.');
        setErrorMsg('');
        setTimeout(() => {
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err: any) {
      console.log('err.response?.data:', err.response?.data);
      setErrorMsg(err.response?.data?.error?.message || 'Update failed');
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <Form onSubmit={handleUpdate}>
      <Form.Group className="mb-3">
        <Form.Label>User ID</Form.Label>
        <Form.Control
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter last name"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Role</Form.Label>
        <Form.Select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="" disabled>
            Select a role
          </option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Form.Select>
      </Form.Group>


      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <div className="d-flex justify-content-end">
        <Button type="submit" className="btn-custom-medium" variant="primary">
          Update User
        </Button>
      </div>
    </Form>
  );
};
