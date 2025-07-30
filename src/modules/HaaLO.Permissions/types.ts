// Permissions and roles types

export type HaaLORole = 
  | 'super_admin'
  | 'admin'
  | 'payroll_manager'
  | 'hr_manager'
  | 'manager'
  | 'employee'
  | 'viewer'
  | 'contractor';

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import';

export type HaaLOModule = 
  | 'payroll'
  | 'employees'
  | 'benefits'
  | 'time_tracking'
  | 'compliance'
  | 'reports'
  | 'admin'
  | 'system';

export interface Permission {
  id: string;
  module: HaaLOModule;
  resource: string;
  action: PermissionAction;
  conditions?: Record<string, any>;
  description: string;
}

export interface Role {
  id: string;
  name: HaaLORole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  tenantScoped: boolean;
  inheritFrom?: HaaLORole[];
}

export interface UserPermission {
  userId: string;
  tenantId: string;
  roles: HaaLORole[];
  customPermissions: Permission[];
  restrictions: {
    module: HaaLOModule;
    resource?: string;
    condition: Record<string, any>;
  }[];
  expiresAt?: number;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: HaaLORole;
  requiredPermission?: Permission;
}

export interface TenantRole {
  tenantId: string;
  userId: string;
  role: HaaLORole;
  assignedBy: string;
  assignedAt: number;
  expiresAt?: number;
  active: boolean;
}

export interface PermissionMatrix {
  [role: string]: {
    [module: string]: {
      [resource: string]: PermissionAction[];
    };
  };
}

export interface PermissionAuditLog {
  id: string;
  userId: string;
  tenantId: string;
  action: 'grant' | 'revoke' | 'check' | 'deny';
  permission: Permission;
  result: boolean;
  reason?: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}