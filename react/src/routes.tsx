import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { SubmitDmpId } from './pages/SubmitDmpId';
import { SubmitDmpText } from './pages/SubmitDmpText';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { RequireAuth } from './components/RequireAuth';
import { DeleteUserModalPage } from './pages/DeleteUserModalPage';
import { SignUpModalPage } from './pages/SignUpModalPage';
import { ChangeUserRoleModalPage } from './pages/ChangeUserRoleModalPage';
import { UpdateUserModalPage } from './pages/UpdateUserModalPage';
import { ViewUsersModalPage } from './pages/ViewUsersModalPage';

const isAuthEnabled = `${import.meta.env.VITE_BACKEND_AUTH}` === 'local';

export const routers = createBrowserRouter(
  !isAuthEnabled
    ? [
        {
          path: '/',
          element: <Layout />,
          children: [
            { index: true, element: <SubmitDmpId /> },
            { path: 'submit-text', element: <SubmitDmpText /> },
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ]
    : [
        { path: '/login', element: <LoginPage /> },
        { path: '/logout', element: <LogoutPage /> },
        {
          element: <RequireAuth />,
          children: [
            {
              path: '/',
              element: <Layout />,
              children: [
                { index: true, element: <SubmitDmpId /> },
                { path: 'submit-text', element: <SubmitDmpText /> },
                { path: '/signup', element: <SignUpModalPage /> },
                { path: '/user/delete', element: <DeleteUserModalPage /> },
                { path: '/user/update', element: <UpdateUserModalPage /> },
                { path: '/user/all', element: <ViewUsersModalPage /> },
                { path: '/user/change-role', element: <ChangeUserRoleModalPage /> },
              ],
            },
          ],
        },
      ]
);
