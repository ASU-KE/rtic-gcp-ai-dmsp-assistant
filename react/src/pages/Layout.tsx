import { Container, Col, Row } from 'react-bootstrap';
import { ASUHeader, ASUFooter, HeaderProps, Button, Logo, NavTreeProps } from '@asu/component-header-footer';

import vertAsuLogo from '../assets/arizona-state-university-logo-vertical.png';
import horizAsuLogo from '../assets/arizona-state-university-logo.png';
import { Outlet } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { useState } from 'react';
import { getUserInfo } from '../utils/auth';

// Override HeaderProps to fix Typescript typing requirements
export interface TsHeaderProps extends Omit<HeaderProps, 'buttons' | 'partnerLogo' | 'navTree'> {
  buttons?: any[];
  partnerLogo?: Logo;
  navTree?: any[];
}
const userInfo = getUserInfo() ?? { role: '', username: '' };
const { role, username } = userInfo;

const isAuthEnabled = `${import.meta.env.VITE_FRONTEND_AUTH}` === 'local';
const enableDmpIdMenu = `${import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID}` === 'true';

// If auth isn't enabled and neither is the DMP ID menu, ASU web standards allows us to hide the nav menu
const enableNavMenu = (isAuthEnabled && role !== 'admin') || enableDmpIdMenu;

let primaryNavTree: NavTreeProps[] = [
  {
    id: 1,
    href: '/',
    text: 'Home',
    type: 'icon-home',
    class: 'test-class',
  },
];

if (enableDmpIdMenu) {
  primaryNavTree.push({
    id: 2,
    href: '/submit-id',
    text: 'Submit DMP ID',
  });
}

const manageUserItems = [
  { href: '/signup', text: 'Create User' },
  { href: '/user/all', text: 'View Users' },
  { href: '/user/update', text: 'Update User' },
  { href: '/user/delete', text: 'Delete User' },
  { href: '/user/change-role', text: 'Change User Role' },
];

const navTree =
  isAuthEnabled && role === 'admin'
    ? [...primaryNavTree, { text: 'Manage Users', href: '#', items: [manageUserItems] }]
    : primaryNavTree;

const buttons =
  isAuthEnabled && role !== 'admin' ? [{ href: '/user/update', text: 'Update Profile', color: 'gold' }] : [];

const header: TsHeaderProps = {
  title: 'DMSP AI Assistant Beta',
  loggedIn: isAuthEnabled ? true : false,
  logoutLink: '/logout',
  loginLink: '#',
  userName: isAuthEnabled ? username : '',
  navTree: enableNavMenu ? primaryNavTree : [],
  mobileNavTree: enableNavMenu ? primaryNavTree : [],
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
  buttons,
};

const footer = {};

export const Layout = () => {
  return (
    <>
      <ASUHeader {...header} />
      {/* <Container className="mt-16">
        <Row>
          <Col md={12}>
            <h1 className="mt-4">DMSP AI Assistant Beta</h1>
          </Col>
        </Row>
      </Container> */}
      <Container className="mt-16" style={{ minHeight: '400px' }}>
        <Outlet />
      </Container>
      <ASUFooter {...footer} />
    </>
  );
};
