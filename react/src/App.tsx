import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context';
import { useAuthContext } from './hooks';

import { Layout } from './pages';
import { HomePage } from './pages';
import { SubmitDmpText } from './pages/dmsp';
import { SubmitDmpId } from './pages/dmsp';
import { ListUsersPage } from './pages/user';
import { LoginRedirect } from './components/LoginRedirect';
import { LogoutPage } from './pages';
import { CreateUserPage } from './pages';
import { DeleteUserPage } from './pages';
import { UpdateUserPage } from './pages';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginCallbackWrapper, LoginCallback } from './components/LoginCallback';

import '@asu/unity-bootstrap-theme/dist/css/unity-bootstrap-theme.bundle.css';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // If auth strategy is "none", allow access to child routes
  {
    import.meta.env.VITE_FRONTEND_AUTH === 'none' && children;
  }

  const { state } = useAuthContext();
  return state.isAuthenticated ? children : <Navigate to="/login" />;
};

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route
                path="/"
                element={
                  // <ProtectedRoute>
                  <HomePage />
                  // </ProtectedRoute>
                }
              />
              <Route
                path="/submit-text"
                element={
                  // <ProtectedRoute>
                  <SubmitDmpText />
                  // </ProtectedRoute>
                }
              />
              {import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID && (
                <Route
                  path="/submit-id"
                  element={
                    // <ProtectedRoute>
                    <SubmitDmpId />
                    // </ProtectedRoute>
                  }
                />
              )}

              {import.meta.env.VITE_FRONTEND_AUTH !== 'none' && (
                <>
                  <Route path="/login" element={<LoginRedirect />} />
                  <Route
                    path="/login/callback"
                    element={
                      <LoginCallbackWrapper>
                        <LoginCallback />
                      </LoginCallbackWrapper>
                    }
                  />
                  <Route path="/logout" element={<LogoutPage />} />
                </>
              )}

              <Route
                path="/user/create"
                element={
                  <ProtectedRoute>
                    <CreateUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/delete"
                element={
                  <ProtectedRoute>
                    <DeleteUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/update"
                element={
                  <ProtectedRoute>
                    <UpdateUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/all"
                element={
                  <ProtectedRoute>
                    <ListUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
