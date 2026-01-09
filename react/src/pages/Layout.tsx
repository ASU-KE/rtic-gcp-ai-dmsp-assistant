import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { TailwindHeader } from '../components/TailwindHeader';
import { TailwindFooter } from '../components/TailwindFooter';

export const Layout = () => {
  return (
    <>
      <TailwindHeader />
      <Container className="mt-16" style={{ minHeight: '400px' }}>
        <Outlet />
      </Container>
      <TailwindFooter />
    </>
  );
};
