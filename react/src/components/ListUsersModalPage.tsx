import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ListUsersPage } from '../pages/ListUsersPage';

export const ListUsersModalPage = () => {
  const navigate = useNavigate();

  return (
    <Modal show onHide={() => navigate(-1)} size="lg" centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title className="custom-modal-title">All Users</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListUsersPage />
      </Modal.Body>
    </Modal>
  );
};
