import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import {
  getDefaultHomeForRole,
  isPublicPage,
  normalizeRole,
  roleMeetsMinimum,
  PAGE_MIN_ROLES,
} from '@/lib/roles';

/**
 * Wraps a page: public routes always render; others require auth + allowed roles.
 */
export default function RequireRole({ pageKey, children }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const location = useLocation();

  if (isPublicPage(pageKey)) {
    return children;
  }

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={createPageUrl('Landing')} replace state={{ from: location.pathname }} />;
  }

  const normalizedRole = normalizeRole(user.role);
  const allowed = PAGE_MIN_ROLES[pageKey];

  if (allowed === undefined) {
    return children;
  }

  if (!allowed.length) {
    return children;
  }

  if (!roleMeetsMinimum(normalizedRole, allowed)) {
    return <Navigate to={createPageUrl(getDefaultHomeForRole(normalizedRole))} replace />;
  }

  return children;
}
