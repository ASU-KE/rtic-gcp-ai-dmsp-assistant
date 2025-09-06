import '../App.css';
import { Accordion, Col, Row, Button } from 'react-bootstrap';
import 'github-markdown-css/github-markdown-light.css';

import { useAuthContext } from '../hooks';

export const NotFoundPage = () => {
  return (
    <Row className="mb-4">
      <Col md={8}>
        <h2 className="mt-2">Page Not Found</h2>
        <p className="mt-2">We're sorry, but the page you are looking for does not exist.</p>
      </Col>
    </Row>
  );
};
