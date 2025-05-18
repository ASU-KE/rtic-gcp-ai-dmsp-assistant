import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ViewUsers } from './ViewUsers';

export const ViewUsersModalPage = () => {
  const navigate = useNavigate();

  return (
    <Modal show onHide={() => navigate(-1)} size="lg" centered>
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title className="custom-modal-title">All Users</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ViewUsers />
      </Modal.Body>
    </Modal>
  );
};
