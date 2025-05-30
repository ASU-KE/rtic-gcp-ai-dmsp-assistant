import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { SubmitDmpId } from './pages/SubmitDmpId';
import { SubmitDmpText } from './pages/SubmitDmpText';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { RequireAuth } from './components/RequireAuth';
import { DeleteUserModalPage } from './pages/DeleteUserModalPage';
import { SignupModalPage } from './pages/SignupModalPage';
import { ChangeUserRoleModalPage } from './pages/ChangeUserRoleModalPage';
import { UpdateUserModalPage } from './pages/UpdateUserModalPage';
import { ViewUsersModalPage } from './pages/ViewUsersModalPage';

const isAuthEnabled = `${import.meta.env.VITE_FRONTEND_AUTH}` === 'local';

export const routers = createBrowserRouter(
  !isAuthEnabled
    ? [
        {
          path: '/',
          element: <Layout />,
          children: [
            { index: true, element: <SubmitDmpText /> },
            import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID === 'true'
              ? { path: 'submit-id', element: <SubmitDmpId /> }
              : {},
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
                { path: '/signup', element: <SignupModalPage /> },
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
