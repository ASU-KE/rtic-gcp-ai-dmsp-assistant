import { Container, Col, Row } from 'react-bootstrap';
import { ASUHeader, ASUFooter, HeaderProps, Button, Logo } from '@asu/component-header-footer';

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

const head = [
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
]

const manageUserItems = [
  { href: "/signup", text: "Create User" },
  { href: "/user/all", text: "View Users" },
  { href: "/user/update", text: "Update User" },
  { href: "/user/delete", text: "Delete User" },
  { href: "/user/change-role", text: "Change User Role" },
];

const isAuthEnabled = `${import.meta.env.VITE_AUTH}` === 'local';

const navTree = isAuthEnabled
  ? (role === 'admin'
    ? [...head, { text: "Manage Users", href: "#", items: [manageUserItems] }]
    : head)
  : head;

const buttons = isAuthEnabled && role !== 'admin'
  ? [{ href: '/user/update', text: 'Update Profile', color: 'gold' }]
  : [];

const header: TsHeaderProps = {
  title: 'DMSP AI Assistant',
  loggedIn: isAuthEnabled ? true : false,
  logoutLink: '/logout',
  loginLink: '#',
  userName: isAuthEnabled ? username : '',
  navTree,
  buttons,
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
