'use client';

import { useState, useEffect } from 'react';
import ClassicFixed from './ClassicFixed';
import PasswordProtection from '../PasswordProtection';

export default function ClassicTemplate({ data }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!data.privacy?.isPasswordProtected);

  // If password protection is not enabled, or already authenticated, show the template
  if (isAuthenticated) {
    return <ClassicFixed 
      data={{
        ...data,
        // Hide sections based on privacy settings
        hideGuestbook: data.privacy?.hideGuestbook,
        hideRSVP: data.privacy?.hideRSVP
      }} 
    />;
  }

  // Show password protection screen
  return (
    <PasswordProtection 
      onPasswordCorrect={() => setIsAuthenticated(true)}
      backgroundImage={data.mempelai.foto_pria || '/images/bg_couple.jpg'}
    />
  );
}
