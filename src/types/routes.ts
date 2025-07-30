import { ReactElement } from 'react';

// Route configuration interfaces
export interface RouteConfig {
  path: string;
  element: ReactElement;
  protected?: boolean;
  requiredRole?: string;
  requiredRoles?: string[];
  children?: RouteConfig[];
}

export interface DomainRoutes {
  basePath: string;
  routes: RouteConfig[];
}

// Route protection levels
export type ProtectionLevel = 'none' | 'authenticated' | 'role-based';

// Common route types
export interface BaseRoute {
  id: string;
  path: string;
  name: string;
  description?: string;
  icon?: string;
  protectionLevel: ProtectionLevel;
}

export interface ProtectedRoute extends BaseRoute {
  protectionLevel: 'role-based';
  requiredRoles: string[];
}

export interface PublicRoute extends BaseRoute {
  protectionLevel: 'none';
}

export interface AuthenticatedRoute extends BaseRoute {
  protectionLevel: 'authenticated';
}

// Domain-specific route collections
export interface AdminRouteCollection {
  dashboard: AuthenticatedRoute;
  assessments: ProtectedRoute;
  companies: ProtectedRoute;
  users: ProtectedRoute;
  settings: ProtectedRoute;
  [key: string]: BaseRoute;
}

export interface CRMRouteCollection {
  dashboard: ProtectedRoute;
  clients: ProtectedRoute;
  deals: ProtectedRoute;
  contacts: ProtectedRoute;
  [key: string]: BaseRoute;
}

export interface PayrollRouteCollection {
  dashboard: ProtectedRoute;
  processing: ProtectedRoute;
  benefits: ProtectedRoute;
  [key: string]: BaseRoute;
}

// Route metadata
export interface RouteMetadata {
  title: string;
  breadcrumbs: string[];
  permissions: string[];
  cached: boolean;
  preload: boolean;
}

// Navigation types
export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: string[];
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
  roles?: string[];
}