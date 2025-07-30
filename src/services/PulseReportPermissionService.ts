import { supabase } from '@/integrations/supabase/client';

export interface UserPermissions {
  canViewAllCompanies: boolean;
  canViewCompany: (companyId: string) => boolean;
  canViewDepartment: (department: string) => boolean;
  allowedCompanies: string[];
  allowedDepartments: string[];
  userRole: string;
}

export class PulseReportPermissionService {
  private static userPermissionsCache = new Map<string, UserPermissions>();

  static async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Check cache first
    if (this.userPermissionsCache.has(userId)) {
      return this.userPermissionsCache.get(userId)!;
    }

    try {
      // Get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', userId);

      // Get user employee record for department info
      const { data: employee } = await supabase
        .from('employees')
        .select('company_id, department')
        .eq('user_id', userId)
        .single();

      const roles = userRoles || [];
      const userRole = roles[0]?.role || 'employee';
      const isSuperAdmin = roles.some(r => r.role === 'super_admin');
      const isCompanyAdmin = roles.some(r => r.role === 'company_admin');
      
      const allowedCompanies = isSuperAdmin 
        ? ['*'] // Super admin can see all
        : roles.map(r => r.company_id).filter(Boolean);

      const allowedDepartments = isCompanyAdmin || isSuperAdmin
        ? ['*'] // Company admin can see all departments in their company
        : employee?.department ? [employee.department] : [];

      const permissions: UserPermissions = {
        canViewAllCompanies: isSuperAdmin,
        canViewCompany: (companyId: string) => 
          isSuperAdmin || allowedCompanies.includes(companyId),
        canViewDepartment: (department: string) => 
          isCompanyAdmin || isSuperAdmin || allowedDepartments.includes(department),
        allowedCompanies,
        allowedDepartments,
        userRole
      };

      // Cache for 5 minutes
      this.userPermissionsCache.set(userId, permissions);
      setTimeout(() => {
        this.userPermissionsCache.delete(userId);
      }, 5 * 60 * 1000);

      return permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      // Default to minimal permissions
      return {
        canViewAllCompanies: false,
        canViewCompany: () => false,
        canViewDepartment: () => false,
        allowedCompanies: [],
        allowedDepartments: [],
        userRole: 'employee'
      };
    }
  }

  static async filterDataByPermissions<T extends { company_id?: string; assigned_to?: string }>(
    data: T[], 
    userId: string,
    permissions?: UserPermissions
  ): Promise<T[]> {
    const userPermissions = permissions || await this.getUserPermissions(userId);

    if (userPermissions.canViewAllCompanies) {
      return data; // Super admin can see everything
    }

    // Filter by company access
    return data.filter(item => {
      // Check company access
      if (item.company_id && !userPermissions.canViewCompany(item.company_id)) {
        return false;
      }

      // For regular employees, only show their own data
      if (userPermissions.userRole === 'employee' && item.assigned_to !== userId) {
        return false;
      }

      return true;
    });
  }

  static async getFilteredCaseQuery(userId: string, baseQuery: any) {
    const permissions = await this.getUserPermissions(userId);

    if (permissions.canViewAllCompanies) {
      return baseQuery; // No filtering needed
    }

    if (permissions.allowedCompanies.length > 0 && !permissions.allowedCompanies.includes('*')) {
      baseQuery = baseQuery.in('company_id', permissions.allowedCompanies);
    }

    // For regular employees, only show assigned cases
    if (permissions.userRole === 'employee') {
      baseQuery = baseQuery.eq('assigned_to', userId);
    }

    return baseQuery;
  }

  static async getFilteredTaskQuery(userId: string, baseQuery: any) {
    const permissions = await this.getUserPermissions(userId);

    if (permissions.canViewAllCompanies) {
      return baseQuery; // No filtering needed
    }

    if (permissions.allowedCompanies.length > 0 && !permissions.allowedCompanies.includes('*')) {
      baseQuery = baseQuery.in('company_id', permissions.allowedCompanies);
    }

    // For regular employees, only show assigned tasks
    if (permissions.userRole === 'employee') {
      baseQuery = baseQuery.eq('assigned_to', userId);
    }

    return baseQuery;
  }

  static async validateReportAccess(userId: string, reportType: string, filters: any): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);

    // Super admin can access all reports
    if (permissions.canViewAllCompanies) {
      return true;
    }

    // Company admin can access company-wide reports
    if (permissions.userRole === 'company_admin') {
      // Ensure they're only requesting data for their company
      if (filters.clientId && !permissions.canViewCompany(filters.clientId)) {
        return false;
      }
      return true;
    }

    // Regular employees can only access their own performance reports
    if (permissions.userRole === 'employee') {
      return reportType === 'performance' && filters.assignee === userId;
    }

    return false;
  }
}