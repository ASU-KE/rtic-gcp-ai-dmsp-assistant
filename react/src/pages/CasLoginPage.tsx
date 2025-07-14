import '../App.css';
import asuLogo from '../assets/arizona-state-university-logo.png';
import { LoginCard } from '../components/LoginCard';

export const CasLoginPage = () => {

  return (
    <div className="asu-login-wrapper d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <img src={asuLogo} alt="ASU Logo" className="img-fluid" style={{ maxHeight: '60px' }} />
          <h2 className="mt-3 text-center">Sign In</h2>
        </div>
        <h3>Test page for ASU CAS Login</h3>

        <LoginCard />
      </div>
    </div>
  );
};
