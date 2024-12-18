import { Container, Col, Row } from 'react-bootstrap';
import { ASUHeader } from "@asu/component-header";
import { ASUFooter } from "@asu/component-footer";

import vertAsuLogo from '../assets/arizona-state-university-logo-vertical.png';
import horizAsuLogo from '../assets/arizona-state-university-logo.png';
import { Outlet } from 'react-router-dom';

const header = {
  title: 'DMSP AI Assistant',
  loggedIn: false,
  logoutLink: "#",
  loginLink: "#",
  userName: "",
  navTree: [
    {
      "href": "/",
      "text": "Home",
      "type": "icon-home",
      "selected": true,
      "class": "test-class"
    },
    {
      "text": "Submit text",
      "href": "/submit-text"
    },
  ],
  logo: {
    alt: 'Arizona State University',
    title: "Arizona State University",
    src: vertAsuLogo,
    mobileSrc: horizAsuLogo,
    // brandLink: PropTypes.string,
  },
  parentOrg: "KE Research Technology Office",
  parentOrgUrl: "https://rto.asu.edu",
  breakpoint: "Lg",
  searchUrl: "https://search.asu.edu/search",
  site: "subdomain",
}

const footer = {}

export const Layout = () => {
  return (
    <>
    <ASUHeader {...header} />
    <Container className="mt-16">
      <Row>
        <Col md={12}>
          <h1 className="mt-4">DMSP AI Assistant: Proof-of-Concept</h1>
        </Col>
      </Row>
    </Container>
    <Container className="mt-2" style={{"minHeight": "400px"}}>
      <Outlet />
    </Container>
    <ASUFooter {...footer} />
    </>
  );
};
