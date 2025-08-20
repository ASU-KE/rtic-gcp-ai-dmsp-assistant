import { Container } from 'react-bootstrap';
import { ASUHeader, ASUFooter, HeaderProps, Button, Logo, NavTreeProps } from '@asu/component-header-footer';

import vertAsuLogo from '../assets/arizona-state-university-logo-vertical.png';
import horizAsuLogo from '../assets/arizona-state-university-logo.png';
import { Outlet } from 'react-router-dom';
// import { getUserInfo } from '../utils/auth';

// Override HeaderProps to fix Typescript typing requirements
export interface TsHeaderProps extends Omit<HeaderProps, 'partnerLogo'> {
  partnerLogo?: Logo;
}
// const userInfo = getUserInfo() ?? { role: '', username: '' };
// const { role, username } = userInfo;

const isAuthEnabled = `${import.meta.env.VITE_FRONTEND_AUTH}` === 'local';
const enableDmpIdMenu = `${import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID}` === 'true';

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
  { id: 1, href: '/auth/create-user', text: 'Create User' },
  { id: 2, href: '/user/all', text: 'List Users' },
  { id: 3, href: '/user/update', text: 'Update User' },
  { id: 4, href: '/user/delete', text: 'Delete User' },
];

const navTree = primaryNavTree;
// isAuthEnabled && role === 'admin'
//   ? [...primaryNavTree, { id: 3, text: 'Manage Users', href: '#', items: [manageUserItems] }]
//   : primaryNavTree;

const header: TsHeaderProps = {
  title: 'DMSP AI Tool Beta',
  loggedIn: isAuthEnabled ? true : false,
  logoutLink: '/logout',
  loginLink: '#',
  // userName: isAuthEnabled ? username : '',
  userName: 'TEMP',
  navTree,
  mobileNavTree: navTree,
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
  buttons: [],
  // buttons:
  //   [
  //     {
  //       "href": "/",
  //       "text": "Request Help",
  //       "color": "gold",
  //     },
  //   ]
};

const footer = {};

export const Layout = () => {
  return (
    <>
      <ASUHeader {...header} />
      {/* <Container className="mt-16">
        <Row>
          <Col md={12}>
            <h1 className="mt-4">DMSP AI Tool Beta</h1>
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
