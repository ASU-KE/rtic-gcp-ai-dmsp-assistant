import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Alert } from 'react-bootstrap';
import { authorizedGet } from '../utils/authAxios';

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authorizedGet('/user/all');
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
