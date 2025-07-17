import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuthContext } from './contexts/AuthContext';
import { Layout } from './pages/Layout';
import { HomePage } from './pages/HomePage';
import { CasLoginPage } from './pages/CasLoginPage';
import { SubmitDmpText } from './pages/SubmitDmpText';
import { SubmitDmpId } from './pages/SubmitDmpId';
import { ListUsersPage } from './pages/ListUsersPage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { CreateUserModalPage } from './components/CreateUserModalPage';
import { DeleteUserModalPage } from './components/DeleteUserModalPage';
import { UpdateUserModalPage } from './components/UpdateUserModalPage';

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
        <Route path="/submit-text" element={<SubmitDmpText />} />
        {import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID === 'true' && (
          <Route path="/submit-id" element={<SubmitDmpId />} />
        )}

        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />

        <Route path="/user/create" element={<CreateUserModalPage />} />
        <Route path="/user/delete" element={<DeleteUserModalPage />} />
        <Route path="/user/update" element={<UpdateUserModalPage />} />
        <Route path="/user/all" element={<ListUsersPage />} />

        {/* <Route
          path="/protected"
          element={
            <ProtectedRoute>
              For testing auth: Protect a test page or Submit DMP Text
              <TestPage />
            </ProtectedRoute>
          }
        /> */}
      </Route>
    </Routes>
  );
};

export default App;
