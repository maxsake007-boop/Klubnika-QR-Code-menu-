import React, { useState, useEffect } from 'react';
import ShopApp from './ShopApp';
import AdminApp from './admin/AdminApp';
import { AdminLogin } from './admin/components/AdminLogin';
import { ErrorBoundary } from './admin/ErrorBoundary';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('klubnika_admin_auth') === 'authenticated' ||
        sessionStorage.getItem('klubnika_admin_auth') === 'authenticated'
      );
    } catch {
      return false;
    }
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

  const handleLogout = () => {
    try {
      localStorage.removeItem('klubnika_admin_auth');
      sessionStorage.removeItem('klubnika_admin_auth');
    } catch {
      // ignore
    }
    setIsAdminAuthenticated(false);
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) {
      document.documentElement.classList.add('admin-page');
      document.body.classList.add('admin-page');
    } else {
      document.documentElement.classList.remove('admin-page');
      document.body.classList.remove('admin-page');
    }
    return () => {
      document.documentElement.classList.remove('admin-page');
      document.body.classList.remove('admin-page');
    };
  }, [isAdminRoute]);

  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
        />
      );
    }

    return (
      <ErrorBoundary>
        <AdminApp
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  return <ShopApp />;
}

