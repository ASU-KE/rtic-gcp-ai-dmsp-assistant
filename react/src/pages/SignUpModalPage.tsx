import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Signup } from './Signup';

export const SignupModalPage = () => {
  const navigate = useNavigate();

  return <Signup show={true} onClose={() => navigate(-1)} />;
};
