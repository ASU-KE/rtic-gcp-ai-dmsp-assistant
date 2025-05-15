import { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal } from 'react-bootstrap';

interface Props {
  onSuccess: () => void;
}

export const DeleteUserModalContent = ({ onSuccess }: Props) => {
  const [userId, setUserId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const submitDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3001/user/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const deletedCount = response.data?.data?.numberOfUsersDeleted ?? 0;

      if (deletedCount === 0) {
        setErrorMsg('No user found with the given ID.');
        setSuccessMsg('');
        setTimeout(() => setErrorMsg(''), 3000);
      } else {
        setSuccessMsg('User deleted successfully.');
        setErrorMsg('');
        setUserId('');
        setTimeout(() => {
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Deletion failed');
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  return (
    <>
      <Form onSubmit={handleDelete}>
        <Form.Group className="mb-3">
          <Form.Label>User ID to Delete</Form.Label>
          <Form.Control
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
            required
          />
        </Form.Group>

        {successMsg && <Alert variant="success">{successMsg}</Alert>}
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        <div className="d-flex justify-content-end">
          <Button type="submit" className="btn-custom-medium" variant="danger">
            Delete
          </Button>
        </div>
      </Form>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="custom-modal-title">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          Are you sure you want to delete user ID <strong>{userId}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn-custom-medium" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="btn-custom-medium" onClick={submitDelete}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
