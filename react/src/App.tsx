import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context';
import { useAuthContext } from './hooks';

import {
  Layout,
  HomePage,
  NotFoundPage,
  LocalLoginPage,
  LocalLogoutPage,
  SubmitDmpText,
  SubmitDmpId,
  CreateUserPage,
  DeleteUserPage,
  ListUsersPage,
  UpdateUserPage,
} from './pages';
import { SamlLoginRedirect } from './components/samlAuth/LoginRedirect';
import { SamlLoginCallbackWrapper, SamlLoginCallback } from './components/samlAuth/LoginCallback';

import '@asu/unity-bootstrap-theme/dist/css/unity-bootstrap-theme.bundle.css';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // If auth strategy is "none", allow access to child routes
  if (import.meta.env.VITE_FRONTEND_AUTH === 'none') {
    return children;
  }

  // Otherwise, check if user is authenticated
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
                  <ProtectedRoute>
                    <SubmitDmpText />
                  </ProtectedRoute>
                }
              />
              {import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID && (
                <Route
                  path="/submit-id"
                  element={
                    <ProtectedRoute>
                      <SubmitDmpId />
                    </ProtectedRoute>
                  }
                />
              )}

              {import.meta.env.VITE_FRONTEND_AUTH === 'saml' && (
                <>
                  <Route path="/login" element={<SamlLoginRedirect />} />
                  <Route
                    path="/login/callback"
                    element={
                      <SamlLoginCallbackWrapper>
                        <SamlLoginCallback />
                      </SamlLoginCallbackWrapper>
                    }
                  />
                  {/* <Route path="/logout" element={<LogoutPage />} /> */}
                </>
              )}

              {import.meta.env.VITE_FRONTEND_AUTH === 'local' && (
                <>
                  <Route path="/login" element={<LocalLoginPage />} />
                  <Route path="/logout" element={<LocalLogoutPage />} />
                </>
              )}

              <Route
                path="/user/create"
                element={
                  // <ProtectedRoute>
                    <CreateUserPage />
                  // </ProtectedRoute>
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
