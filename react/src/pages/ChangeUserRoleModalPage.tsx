import { Modal } from 'react-bootstrap';
import { ChangeUserRole } from './ChangeUserRole';
import { useNavigate } from 'react-router-dom';

export const ChangeUserRoleModalPage = () => {
  const navigate = useNavigate();

  return (
    <Modal show onHide={() => navigate(-1)} centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title className="custom-modal-title">Change User Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ChangeUserRole onSuccess={() => navigate(-1)} />
      </Modal.Body>
    </Modal>
  );
};
