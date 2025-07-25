import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/provider';

import { Layout } from './pages/Layout';
import { HomePage } from './pages/HomePage';
import { SubmitDmpText } from './pages/SubmitDmpText';
import { SubmitDmpId } from './pages/SubmitDmpId';
import { ListUsersPage } from './pages/ListUsersPage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { DeleteUserPage } from './pages/DeleteUserPage';
import { UpdateUserPage } from './pages/UpdateUserPage';

import '@asu/unity-bootstrap-theme/dist/css/unity-bootstrap-theme.bundle.css';

// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   const { user } = useAuthContext();
//   // Check if the user is authenticated
//   // If authenticated, render the children (protected content)
//   // If not authenticated, redirect to the login page
//   return user ? children : <Navigate to="/login" />;
// };

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  // const { user } = useAuthContext();
  return (
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/submit-text" element={<SubmitDmpText />} />
              {import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID && <Route path="/submit-id" element={<SubmitDmpId />} />}

              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<LogoutPage />} />

              <Route path="/user/create" element={<CreateUserPage />} />
              <Route path="/user/delete" element={<DeleteUserPage />} />
              <Route path="/user/update" element={<UpdateUserPage />} />
              <Route path="/user/all" element={<ListUsersPage />} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
