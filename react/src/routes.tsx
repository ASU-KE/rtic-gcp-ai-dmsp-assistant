import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { SubmitDmpId } from './pages/SubmitDmpId';
import { SubmitDmpText } from './pages/SubmitDmpText';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { RequireAuth } from './components/RequireAuth';
import { DeleteUserModalPage } from './components/DeleteUserModalPage';
import { CreateUserModalPage } from './components/CreateUserModalPage';
import { UpdateUserModalPage } from './components/UpdateUserModalPage';
import { ListUsersModalPage } from './components/ListUsersModalPage';
import { HomePage } from './pages/HomePage';
import { CasAutoRedirect } from './components/CasAutoRedirect';
import { CasLoginPage } from './pages/CasLoginPage';

const authMode = import.meta.env.VITE_FRONTEND_AUTH; // 'none' | 'local' | 'cas'
console.log('Auth Mode:', authMode);
const enableDmpId = import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID === 'true';

export const routers = createBrowserRouter(
  authMode === 'none'
    ? [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'submit-text', element: <SubmitDmpText /> },
          ...(enableDmpId ? [{ path: 'submit-id', element: <SubmitDmpId /> }] : []),
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ]
    : authMode === 'local' ?
    [
        { path: '/login', element: <LoginPage /> },
        { path: '/logout', element: <LogoutPage /> },
        {
          element: <RequireAuth />,
          children: [
            {
              path: '/',
              element: <Layout />,
              children: [
                { index: true, element: <HomePage /> },
                { path: 'submit-text', element: <SubmitDmpText /> },
                ...(enableDmpId ? [{ path: 'submit-id', element: <SubmitDmpId /> }] : []),
                { path: '/create-user', element: <CreateUserModalPage /> },
                { path: '/user/delete', element: <DeleteUserModalPage /> },
                { path: '/user/update', element: <UpdateUserModalPage /> },
                { path: '/user/all', element: <ListUsersModalPage /> },
              ],
            },
          ],
        },
      ]
      : [
        // CAS Mode
        { path: '/login', element: <CasLoginPage /> }, // 👈 Add this route
        {
          path: '/',
          element: <CasAutoRedirect />,
          children: [
            { index: true, element: <HomePage /> },
            { path: 'submit-text', element: <SubmitDmpText /> },
            ...(enableDmpId ? [{ path: 'submit-id', element: <SubmitDmpId /> }] : []),
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ]
);
