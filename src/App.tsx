import React, { useState, useEffect } from 'react';
import ShopApp from './ShopApp';
import AdminApp from './admin/AdminApp';
import { ErrorBoundary } from './admin/ErrorBoundary';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        <AdminApp />
      </ErrorBoundary>
    );
  }

  return <ShopApp />;
}
