import { Modal } from 'react-bootstrap';
import { UpdateUserPage } from '../pages/UpdateUserPage';
import { useNavigate } from 'react-router-dom';

export const UpdateUserModalPage = () => {
  const navigate = useNavigate();

  return (
    <Modal show onHide={() => navigate(-1)} centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title className="custom-modal-title">Update User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <UpdateUserPage onSuccess={() => navigate(-1)} />
      </Modal.Body>
    </Modal>
  );
};
