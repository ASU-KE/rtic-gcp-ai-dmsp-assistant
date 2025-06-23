import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CreateUserPage } from '../pages/CreateUserPage';

export const CreateUserModalPage = () => {
  const navigate = useNavigate();

  return <CreateUserPage show={true} onClose={() => navigate(-1)} />;
};
