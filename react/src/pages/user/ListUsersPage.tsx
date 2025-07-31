import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Alert, Container, Row, Col } from 'react-bootstrap';
import { useAuthContext } from '../../hooks';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export const ListUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

    const { state } = useAuthContext();

    if (import.meta.env.NODE_ENV !== 'production') {
      console.log('ListUsersPage user:', state.user);
      console.log('ListUsersPage isAuthenticated:', state.isAuthenticated);
    }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/user/all`, {
          withCredentials: true
        });

        console.log('Fetched response:', response.data.data);

        setUsers(response.data.data);
      } catch (err: any) {
        setErrorMsg(
          typeof err.response?.data?.error === 'string'
            ? err.response.data.error
            : err.response?.data?.error?.message || 'Failed to load users'
        );
        setTimeout(() => setErrorMsg(''), 3000);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <Container className="mt-4 mb-4">
        <Row className="mb-3">
          <h2 className="mt-2">All User Accounts</h2>
          <Col md={8}>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            <div style={{ maxHeight: '390px', overflowY: 'auto' }}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.firstName ?? '-'}</td>
                        <td>{user.lastName ?? '-'}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};
