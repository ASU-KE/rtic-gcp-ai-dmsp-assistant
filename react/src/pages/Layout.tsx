import { Container, Col, Row } from 'react-bootstrap';
import { ASUHeader, ASUFooter, HeaderProps, Button, Logo } from '@asu/component-header-footer';

import vertAsuLogo from '../assets/arizona-state-university-logo-vertical.png';
import horizAsuLogo from '../assets/arizona-state-university-logo.png';
import { Outlet } from 'react-router-dom';

// Override HeaderProps to fix Typescript typing requirements
export interface TsHeaderProps extends Omit<HeaderProps, 'buttons' | 'partnerLogo'> {
  buttons?: Button[];
  partnerLogo?: Logo;
}

const header: TsHeaderProps = {
  title: 'DMSP AI Assistant',
  loggedIn: false,
  logoutLink: '#',
  loginLink: '#',
  userName: '',
  navTree: [
    {
      id: 1,
      href: '/',
      text: 'Home',
      type: 'icon-home',
      class: 'test-class',
    },
    {
      id: 2,
      href: '/submit-text',
      text: 'Submit text',
    },
  ],
  mobileNavTree: [
    {
      id: 1,
      href: '/',
      text: 'Home',
      type: 'icon-home',
      class: 'test-class',
    },
    {
      id: 2,
      href: '/submit-text',
      text: 'Submit text',
    },
  ],
  logo: {
    alt: 'Arizona State University',
    src: vertAsuLogo,
    mobileSrc: horizAsuLogo,
  },
  parentOrg: 'KE Research Technology Office',
  parentOrgUrl: 'https://rto.asu.edu',
  breakpoint: 'Lg',
  searchUrl: 'https://search.asu.edu/search',
  site: 'subdomain',
  isPartner: false,
  animateTitle: true,
  expandOnHover: true,
}

const footer = {};

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
      <Container className="mt-2" style={{ minHeight: '400px' }}>
        <Outlet />
      </Container>
      <ASUFooter {...footer} />
    </>
  );
};
