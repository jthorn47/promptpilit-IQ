import type { 
  Permission, 
  Role, 
  UserPermission, 
  PermissionCheckResult, 
  HaaLORole,
  HaaLOModule,
  PermissionAction,
  TenantRole,
  PermissionMatrix
} from '../types';

class PermissionsService {
  private roles = new Map<HaaLORole, Role>();
  private userPermissions = new Map<string, UserPermission>();
  private permissionMatrix: PermissionMatrix = {};
  private static instance: PermissionsService;

  private constructor() {
    this.initializeDefaultRoles();
    this.buildPermissionMatrix();
  }

  static getInstance(): PermissionsService {
    if (!PermissionsService.instance) {
      PermissionsService.instance = new PermissionsService();
    }
    return PermissionsService.instance;
  }

  /**
   * Check if user has specific permission
   */
  async checkPermission(
    userId: string,
    tenantId: string,
    module: HaaLOModule,
    resource: string,
    action: PermissionAction,
    context?: Record<string, any>
  ): Promise<PermissionCheckResult> {
    const userPermission = this.userPermissions.get(`${userId}:${tenantId}`);
    
    if (!userPermission) {
      return {
        allowed: false,
        reason: 'User not found or no permissions assigned'
      };
    }

    // Check if permissions are expired
    if (userPermission.expiresAt && Date.now() > userPermission.expiresAt) {
      return {
        allowed: false,
        reason: 'Permissions expired'
      };
    }

    // Check role-based permissions
    for (const roleName of userPermission.roles) {
      const role = this.roles.get(roleName);
      if (!role) continue;

      const hasPermission = this.checkRolePermission(role, module, resource, action, context);
      if (hasPermission.allowed) {
        return hasPermission;
      }
    }

    // Check custom permissions
    const customPermission = userPermission.customPermissions.find(p => 
      p.module === module && 
      p.resource === resource && 
      p.action === action
    );

    if (customPermission) {
      const conditionsMet = this.checkConditions(customPermission.conditions, context);
      if (conditionsMet) {
        return { allowed: true };
      }
    }

    // Check restrictions
    const restriction = userPermission.restrictions.find(r => 
      r.module === module && 
      (!r.resource || r.resource === resource)
    );

    if (restriction) {
      return {
        allowed: false,
        reason: 'Access restricted for this resource'
      };
    }

    return {
      allowed: false,
      reason: 'Insufficient permissions'
    };
  }

  /**
   * Check if user has specific role
   */
  hasRole(userId: string, tenantId: string, role: HaaLORole): boolean {
    const userPermission = this.userPermissions.get(`${userId}:${tenantId}`);
    return userPermission?.roles.includes(role) || false;
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string, tenantId: string): HaaLORole[] {
    const userPermission = this.userPermissions.get(`${userId}:${tenantId}`);
    return userPermission?.roles || [];
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string, 
    tenantId: string, 
    role: HaaLORole,
    assignedBy: string
  ): Promise<void> {
    const key = `${userId}:${tenantId}`;
    let userPermission = this.userPermissions.get(key);

    if (!userPermission) {
      userPermission = {
        userId,
        tenantId,
        roles: [],
        customPermissions: [],
        restrictions: []
      };
    }

    if (!userPermission.roles.includes(role)) {
      userPermission.roles.push(role);
      this.userPermissions.set(key, userPermission);
    }

    // In a real implementation, this would be persisted to database
    console.log(`🔐 PermissionsService: Assigned role ${role} to user ${userId} in tenant ${tenantId}`);
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, tenantId: string, role: HaaLORole): Promise<void> {
    const key = `${userId}:${tenantId}`;
    const userPermission = this.userPermissions.get(key);

    if (userPermission) {
      userPermission.roles = userPermission.roles.filter(r => r !== role);
      this.userPermissions.set(key, userPermission);
    }

    console.log(`🔐 PermissionsService: Removed role ${role} from user ${userId} in tenant ${tenantId}`);
  }

  /**
   * Get all available roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get role definition
   */
  getRole(roleName: HaaLORole): Role | undefined {
    return this.roles.get(roleName);
  }

  /**
   * Get permission matrix for role
   */
  getRolePermissions(role: HaaLORole): Record<string, Record<string, PermissionAction[]>> {
    return this.permissionMatrix[role] || {};
  }

  private checkRolePermission(
    role: Role,
    module: HaaLOModule,
    resource: string,
    action: PermissionAction,
    context?: Record<string, any>
  ): PermissionCheckResult {
    // Super admin has access to everything
    if (role.name === 'super_admin') {
      return { allowed: true };
    }

    // Check direct permissions
    const permission = role.permissions.find(p => 
      p.module === module && 
      p.resource === resource && 
      p.action === action
    );

    if (permission) {
      const conditionsMet = this.checkConditions(permission.conditions, context);
      return {
        allowed: conditionsMet,
        reason: conditionsMet ? undefined : 'Conditions not met'
      };
    }

    // Check inherited permissions
    if (role.inheritFrom) {
      for (const inheritedRoleName of role.inheritFrom) {
        const inheritedRole = this.roles.get(inheritedRoleName);
        if (inheritedRole) {
          const result = this.checkRolePermission(inheritedRole, module, resource, action, context);
          if (result.allowed) {
            return result;
          }
        }
      }
    }

    return {
      allowed: false,
      reason: `Role ${role.name} does not have permission for ${action} on ${module}.${resource}`
    };
  }

  private checkConditions(conditions?: Record<string, any>, context?: Record<string, any>): boolean {
    if (!conditions) return true;
    if (!context) return false;

    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  private initializeDefaultRoles(): void {
    // Super Admin
    this.roles.set('super_admin', {
      id: 'super_admin',
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: [], // Super admin doesn't need explicit permissions
      isSystemRole: true,
      tenantScoped: false
    });

    // Admin
    this.roles.set('admin', {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrator',
      description: 'Tenant administrator with most permissions',
      permissions: this.createAdminPermissions(),
      isSystemRole: true,
      tenantScoped: true
    });

    // Payroll Manager
    this.roles.set('payroll_manager', {
      id: 'payroll_manager',
      name: 'payroll_manager',
      displayName: 'Payroll Manager',
      description: 'Manages payroll operations and employee compensation',
      permissions: this.createPayrollManagerPermissions(),
      isSystemRole: true,
      tenantScoped: true
    });

    // HR Manager
    this.roles.set('hr_manager', {
      id: 'hr_manager',
      name: 'hr_manager',
      displayName: 'HR Manager',
      description: 'Manages human resources and employee data',
      permissions: this.createHRManagerPermissions(),
      isSystemRole: true,
      tenantScoped: true
    });

    // Manager
    this.roles.set('manager', {
      id: 'manager',
      name: 'manager',
      displayName: 'Manager',
      description: 'Team manager with limited administrative access',
      permissions: this.createManagerPermissions(),
      isSystemRole: true,
      tenantScoped: true
    });

    // Employee
    this.roles.set('employee', {
      id: 'employee',
      name: 'employee',
      displayName: 'Employee',
      description: 'Standard employee with basic access',
      permissions: this.createEmployeePermissions(),
      isSystemRole: true,
      tenantScoped: true
    });

    // Viewer
    this.roles.set('viewer', {
      id: 'viewer',
      name: 'viewer',
      displayName: 'Viewer',
      description: 'Read-only access to assigned resources',
      permissions: this.createViewerPermissions(),
      isSystemRole: true,
      tenantScoped: true
    });
  }

  private createAdminPermissions(): Permission[] {
    const modules: HaaLOModule[] = ['payroll', 'employees', 'benefits', 'time_tracking', 'compliance', 'reports'];
    const actions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'execute', 'approve', 'export', 'import'];
    
    return modules.flatMap(module => 
      actions.map(action => ({
        id: `admin_${module}_${action}`,
        module,
        resource: '*',
        action,
        description: `Admin ${action} access to ${module}`
      }))
    );
  }

  private createPayrollManagerPermissions(): Permission[] {
    return [
      { id: 'pm_payroll_all', module: 'payroll', resource: '*', action: 'create', description: 'Create payroll records' },
      { id: 'pm_payroll_read', module: 'payroll', resource: '*', action: 'read', description: 'View payroll data' },
      { id: 'pm_payroll_update', module: 'payroll', resource: '*', action: 'update', description: 'Update payroll records' },
      { id: 'pm_payroll_execute', module: 'payroll', resource: 'payroll_run', action: 'execute', description: 'Execute payroll runs' },
      { id: 'pm_payroll_approve', module: 'payroll', resource: 'payroll_run', action: 'approve', description: 'Approve payroll runs' },
      { id: 'pm_employees_read', module: 'employees', resource: '*', action: 'read', description: 'View employee data' },
      { id: 'pm_reports_read', module: 'reports', resource: 'payroll_reports', action: 'read', description: 'View payroll reports' },
      { id: 'pm_reports_export', module: 'reports', resource: 'payroll_reports', action: 'export', description: 'Export payroll reports' }
    ];
  }

  private createHRManagerPermissions(): Permission[] {
    return [
      { id: 'hr_employees_all', module: 'employees', resource: '*', action: 'create', description: 'Manage employees' },
      { id: 'hr_employees_read', module: 'employees', resource: '*', action: 'read', description: 'View employee data' },
      { id: 'hr_employees_update', module: 'employees', resource: '*', action: 'update', description: 'Update employee records' },
      { id: 'hr_benefits_all', module: 'benefits', resource: '*', action: 'create', description: 'Manage benefits' },
      { id: 'hr_compliance_read', module: 'compliance', resource: '*', action: 'read', description: 'View compliance data' },
      { id: 'hr_time_approve', module: 'time_tracking', resource: 'time_entries', action: 'approve', description: 'Approve time entries' },
      { id: 'hr_reports_read', module: 'reports', resource: 'hr_reports', action: 'read', description: 'View HR reports' }
    ];
  }

  private createManagerPermissions(): Permission[] {
    return [
      { id: 'mgr_employees_read', module: 'employees', resource: 'direct_reports', action: 'read', description: 'View direct reports' },
      { id: 'mgr_time_read', module: 'time_tracking', resource: 'team_time', action: 'read', description: 'View team time entries' },
      { id: 'mgr_time_approve', module: 'time_tracking', resource: 'team_time', action: 'approve', description: 'Approve team time entries' },
      { id: 'mgr_reports_read', module: 'reports', resource: 'team_reports', action: 'read', description: 'View team reports' }
    ];
  }

  private createEmployeePermissions(): Permission[] {
    return [
      { id: 'emp_profile_read', module: 'employees', resource: 'own_profile', action: 'read', description: 'View own profile' },
      { id: 'emp_profile_update', module: 'employees', resource: 'own_profile', action: 'update', description: 'Update own profile' },
      { id: 'emp_payroll_read', module: 'payroll', resource: 'own_payroll', action: 'read', description: 'View own payroll data' },
      { id: 'emp_benefits_read', module: 'benefits', resource: 'own_benefits', action: 'read', description: 'View own benefits' },
      { id: 'emp_benefits_update', module: 'benefits', resource: 'own_benefits', action: 'update', description: 'Update own benefits' },
      { id: 'emp_time_create', module: 'time_tracking', resource: 'own_time', action: 'create', description: 'Create time entries' },
      { id: 'emp_time_read', module: 'time_tracking', resource: 'own_time', action: 'read', description: 'View own time entries' },
      { id: 'emp_time_update', module: 'time_tracking', resource: 'own_time', action: 'update', description: 'Update own time entries' }
    ];
  }

  private createViewerPermissions(): Permission[] {
    return [
      { id: 'viewer_assigned_read', module: 'payroll', resource: 'assigned_data', action: 'read', description: 'View assigned data' },
      { id: 'viewer_reports_read', module: 'reports', resource: 'assigned_reports', action: 'read', description: 'View assigned reports' }
    ];
  }

  private buildPermissionMatrix(): void {
    for (const role of this.roles.values()) {
      this.permissionMatrix[role.name] = {};
      
      for (const permission of role.permissions) {
        if (!this.permissionMatrix[role.name][permission.module]) {
          this.permissionMatrix[role.name][permission.module] = {};
        }
        
        if (!this.permissionMatrix[role.name][permission.module][permission.resource]) {
          this.permissionMatrix[role.name][permission.module][permission.resource] = [];
        }
        
        this.permissionMatrix[role.name][permission.module][permission.resource].push(permission.action);
      }
    }
  }
}

// Export singleton instance
export const permissionsService = PermissionsService.getInstance();
export { PermissionsService };