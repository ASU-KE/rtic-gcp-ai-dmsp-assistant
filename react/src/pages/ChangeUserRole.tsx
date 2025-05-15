import { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';

interface Props {
  onSuccess: () => void;
}

export const ChangeUserRole = ({ onSuccess }: Props) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:3001/user/change-role/${userId}`,
        { role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = response.data?.data;

      if (!updatedUser) {
        setErrorMsg('User not found or role not updated.');
        setSuccessMsg('');
        setTimeout(() => setErrorMsg(''), 3000);
      } else {
        setSuccessMsg('User role updated successfully.');
        setErrorMsg('');
        setTimeout(() => {
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Role update failed');
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <Form onSubmit={handleChangeRole}>
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
          Change Role
        </Button>
      </div>
    </Form>
  );
};
