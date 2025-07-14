import { useEffect } from 'react';

export const CasAutoRedirect = () => {
  useEffect(() => {
    // Redirect immediately to CAS login
    window.location.href = '/login/cas';
  }, []);

  // Render nothing because we redirect immediately
  return null;
};
