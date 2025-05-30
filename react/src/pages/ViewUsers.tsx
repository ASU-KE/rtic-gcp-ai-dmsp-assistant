import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Alert } from 'react-bootstrap';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export const ViewUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://${import.meta.env.VITE_BACKEND_DOMAIN}:${import.meta.env.VITE_BACKEND_PORT}/user/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.data);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || 'Failed to load users');
        setTimeout(() => setErrorMsg(''), 3000);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
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
    </>
  );
};
