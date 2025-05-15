import { Outlet, useLocation } from 'react-router-dom';

export const RequireAuth = ({ children }: { children?: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  const location = useLocation();

  return isLoggedIn ? <Outlet /> : (
    <div className="container mt-4 alert alert-success" role="alert">
      <div>
        <h4 className="alert-heading" >Unauthorized Access!</h4>
        <p>
          You must be logged in to access this page. Please log in to continue.
        </p>
        <hr className="mb-2 mt-2" />
        <p className="mb-0">
          <a href="/login" className="alert-link">Click here to log in</a>
        </p>
      </div>
    </div>
  );
};
