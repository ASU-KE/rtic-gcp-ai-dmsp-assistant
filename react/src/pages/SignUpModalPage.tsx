import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { SignUp } from './Signup';

export const SignUpModalPage = () => {
  const navigate = useNavigate();

  return <SignUp show={true} onClose={() => navigate(-1)} />;
};
