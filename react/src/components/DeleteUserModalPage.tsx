import { Modal } from 'react-bootstrap';
import { DeleteUserPage } from '../pages/DeleteUserPage';
import { useNavigate } from 'react-router-dom';

export const DeleteUserModalPage = () => {
  const navigate = useNavigate();

  return (
    <Modal show onHide={() => navigate(-1)} centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title className="custom-modal-title">Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DeleteUserPage onSuccess={() => navigate(-1)} />
      </Modal.Body>
    </Modal>
  );
};
