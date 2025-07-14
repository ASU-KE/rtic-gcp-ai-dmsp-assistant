import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuthContext } from './contexts/AuthContext';
import { Layout } from './pages/Layout';
import { HomePage } from './pages/HomePage';
import { CasLoginPage } from './pages/CasLoginPage';
import { SubmitDmpText } from './pages/SubmitDmpText';

import '@asu/unity-bootstrap-theme/dist/css/unity-bootstrap-theme.bundle.css';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuthContext();
  // Check if the user is authenticated
  // If authenticated, render the children (protected content)
  // If not authenticated, redirect to the login page
  return user ? children : <Navigate to="/login" />;
};

const App = (): JSX.Element => {
  const { user } = useAuthContext();
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <CasLoginPage />} />
        <Route
          path="/submit-text"
          element={
            <ProtectedRoute>
              {/* For testing auth: Protect just the Submit DMP page */}
              <SubmitDmpText />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
