import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getInitialState } from '../context/state';

const { user } = getInitialState();

const isAuthEnabled = `${import.meta.env.VITE_FRONTEND_AUTH}` === 'local';
const enableDmpIdMenu = `${import.meta.env.VITE_FRONTEND_ENABLE_DMP_ID}` === 'true';

const manageUserItems = [
  { id: 1, href: '/auth/create-user', text: 'Create User' },
  { id: 2, href: '/user/all', text: 'List Users' },
  { id: 3, href: '/user/update', text: 'Update User' },
  { id: 4, href: '/user/delete', text: 'Delete User' },
];

export const TailwindHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  let primaryNav = [
    {
      id: 1,
      href: '/',
      text: 'Home',
    },
  ];

  if (user && user.role === 'admin') {
    primaryNav.push({
      id: 2,
      href: '/submissions',
      text: 'View Submissions',
    });
  }

  if (enableDmpIdMenu) {
    primaryNav.push({
      id: 3,
      href: '/submit-id',
      text: 'Submit DMP ID',
    });
  }

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <NavLink to="/" end className="text-lg font-semibold text-gray-800">
              DMSP AI Tool Beta
            </NavLink>

            <nav className="hidden md:flex md:ml-6 space-x-2 items-center">
              {primaryNav.map((n) => (
                <NavLink
                  key={n.id}
                  to={n.href}
                  end={n.href === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive
                      ? 'nav-link active'
                      : 'nav-link text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {n.text}
                </NavLink>
              ))}

              {user && user.role === 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => setManageOpen((s) => !s)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    aria-expanded={manageOpen}
                    aria-haspopup="true"
                  >
                    Manage Users ▾
                  </button>

                  {manageOpen && (
                    <div
                      onMouseLeave={() => setManageOpen(false)}
                      className="absolute mt-2 bg-white border rounded shadow-sm min-w-[160px] z-10"
                    >
                      {manageUserItems.map((it) => (
                        <NavLink
                          key={it.id}
                          to={it.href}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm ${isActive ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'}`
                          }
                          onClick={() => setManageOpen(false)}
                        >
                          {it.text}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <span className="text-sm text-gray-600">
                {isAuthEnabled ? (user ? user.username : '') : ''}
              </span>

              {isAuthEnabled ? (
                <NavLink to="/logout" className="px-3 py-1 text-sm bg-gray-100 rounded">
                  Logout
                </NavLink>
              ) : (
                <NavLink to="/login" className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                  Login
                </NavLink>
              )}
            </div>

            <button
              onClick={() => setOpen((s) => !s)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {primaryNav.map((n) => (
              <NavLink
                key={n.id}
                to={n.href}
                end={n.href === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {n.text}
              </NavLink>
            ))}

            {user && user.role === 'admin' && (
              <>
                <div className="border-t pt-2">
                  <div className="px-3 text-sm text-gray-500">Manage Users</div>
                  {manageUserItems.map((it) => (
                    <NavLink
                      key={it.id}
                      to={it.href}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      {it.text}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            <div className="border-t pt-2 px-3">
              <div className="text-sm text-gray-600 mb-2">{isAuthEnabled ? (user ? user.username : '') : ''}</div>
              {isAuthEnabled ? (
                <NavLink to="/logout" className="block px-3 py-2 rounded-md bg-gray-100 text-center">
                  Logout
                </NavLink>
              ) : (
                <NavLink to="/login" className="block px-3 py-2 rounded-md bg-blue-600 text-white text-center">
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
