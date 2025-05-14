import { createBrowserRouter } from 'react-router-dom';
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

export const routers = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/logout',
    element: <LogoutPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <SubmitDmpId />,
          },
          {
            path: 'submit-text',
            element: <SubmitDmpText />,
          },
          {
            path: '/signup',
            element: <SignUpModalPage />,
          },
          {
            path: '/user/delete',
            element: <DeleteUserModalPage />
          },
          {
            path: '/user/update',
            element: <UpdateUserModalPage />
          },
          {
            path: '/user/all',
            element: <ViewUsersModalPage />
          },
          {
            path: '/user/change-role',
            element: <ChangeUserRoleModalPage />
          }
        ],
      },
    ],
  },
]);
