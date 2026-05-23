import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const StartRedirect: React.FC = () => {
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect');
  const target = redirect && redirect.startsWith('/') ? redirect : '/app';

  return <Navigate to={target} replace />;
};

export default StartRedirect;