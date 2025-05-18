import { Modal } from 'react-bootstrap';
import { DeleteUserModalContent } from './DeleteUserModalContent';
import { useNavigate } from 'react-router-dom';

export const DeleteUserModalPage = () => {
  const navigate = useNavigate();

  return (
    <Modal show onHide={() => navigate(-1)} centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title className="custom-modal-title">Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DeleteUserModalContent onSuccess={() => navigate(-1)} />
      </Modal.Body>
    </Modal>
  );
};
