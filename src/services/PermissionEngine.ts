import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface UserAttributes {
  jobTitle?: string;
  department?: string;
  isManager: boolean;
  certifications: string[];
  assignedModules: string[];
  directReports: string[];
  customAttributes: Record<string, any>;
}

export interface AccessContext {
  resourceId?: string;
  resourceType?: string;
  targetUserId?: string;
  companyId?: string;
  clientId?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  matchedPolicies?: string[];
  failedConditions?: string[];
}

export interface CachedPermission {
  allowed: boolean;
  timestamp: number;
  ttl: number;
}

class PermissionEngine {
  private cache = new Map<string, CachedPermission>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Core method to check if a user has access to a feature
   */
  async canUserAccess(
    userId: string,
    feature: string,
    action: string = 'view',
    context?: AccessContext
  ): Promise<PermissionCheckResult> {
    const cacheKey = this.getCacheKey(userId, feature, action, context);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      logger.api.debug('Permission check from cache', { userId, feature, action, allowed: cached.allowed });
      return { allowed: cached.allowed, reason: 'cached_result' };
    }

    try {
      // Get user's roles and attributes
      const [userRoles, userAttributes] = await Promise.all([
        this.getUserRoles(userId),
        this.getUserAttributes(userId)
      ]);

      if (!userRoles || userRoles.length === 0) {
        logger.api.warn('User has no roles assigned', { userId });
        const result = { allowed: false, reason: 'no_roles_assigned' };
        this.cacheResult(cacheKey, result.allowed);
        return result;
      }

      // Check if user is super admin (bypass all checks)
      if (userRoles.some(r => r.role === 'super_admin')) {
        const result = { allowed: true, reason: 'super_admin_access' };
        this.cacheResult(cacheKey, result.allowed);
        return result;
      }

      // Get applicable policies for the user's roles
      const policies = await this.getPoliciesForRoles(userRoles.map(r => r.role), feature, action);
      
      if (!policies || policies.length === 0) {
        logger.api.debug('No policies found for user roles', { userId, userRoles, feature, action });
        const result = { allowed: false, reason: 'no_applicable_policies' };
        this.cacheResult(cacheKey, result.allowed);
        return result;
      }

      // Evaluate each policy
      const evaluationResults = await Promise.all(
        policies.map(policy => this.evaluatePolicy(policy, userAttributes, context))
      );

      // Check if any policy allows access
      const allowedPolicies = evaluationResults.filter(r => r.allowed);
      const hasAccess = allowedPolicies.length > 0;

      const result: PermissionCheckResult = {
        allowed: hasAccess,
        reason: hasAccess ? 'policy_match' : 'no_policy_match',
        matchedPolicies: allowedPolicies.map(p => p.policyName),
        failedConditions: evaluationResults
          .filter(r => !r.allowed)
          .flatMap(r => r.failedConditions || [])
      };

      logger.api.debug('Permission evaluation complete', { 
        userId, feature, action, result, policiesEvaluated: policies.length 
      });

      this.cacheResult(cacheKey, result.allowed);
      return result;

    } catch (error) {
      logger.api.error('Permission check failed', error, { userId, feature, action });
      return { allowed: false, reason: 'evaluation_error' };
    }
  }

  /**
   * Get user's roles with tenant scoping
   */
  private async getUserRoles(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, company_id, client_id')
      .eq('user_id', userId);

    if (error) {
      logger.api.error('Failed to fetch user roles', error, { userId });
      return [];
    }

    return data || [];
  }

  /**
   * Get user's attributes for ABAC evaluation
   */
  private async getUserAttributes(userId: string): Promise<UserAttributes> {
    const { data, error } = await supabase
      .from('user_attributes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.api.error('Failed to fetch user attributes', error, { userId });
    }

    // Return default attributes if none found
    return {
      jobTitle: data?.job_title || '',
      department: data?.department || '',
      isManager: data?.is_manager || false,
      certifications: data?.certifications || [],
      assignedModules: data?.assigned_modules || [],
      directReports: data?.direct_reports || [],
      customAttributes: (data?.custom_attributes as Record<string, any>) || {}
    };
  }

  /**
   * Get policies that apply to the given roles and feature/action
   */
  private async getPoliciesForRoles(roles: string[], feature: string, action: string) {
    const { data, error } = await supabase
      .from('policy_assignments')
      .select(`
        policy_id,
        permission_policies!inner (
          id,
          name,
          description,
          feature,
          action,
          policy_conditions (
            attribute_name,
            operator,
            attribute_value,
            condition_type
          )
        )
      `)
      .in('role', roles as any)
      .eq('is_active', true)
      .eq('permission_policies.feature', feature)
      .eq('permission_policies.action', action)
      .eq('permission_policies.is_active', true);

    if (error) {
      logger.api.error('Failed to fetch policies', error, { roles, feature, action });
      return [];
    }

    return data?.map(assignment => ({
      id: assignment.permission_policies.id,
      name: assignment.permission_policies.name,
      description: assignment.permission_policies.description,
      conditions: assignment.permission_policies.policy_conditions || []
    })) || [];
  }

  /**
   * Evaluate a single policy against user attributes and context
   */
  private async evaluatePolicy(
    policy: any,
    userAttributes: UserAttributes,
    context?: AccessContext
  ): Promise<{ allowed: boolean; policyName: string; failedConditions?: string[] }> {
    // If policy has no conditions, it's always allowed
    if (!policy.conditions || policy.conditions.length === 0) {
      return { allowed: true, policyName: policy.name };
    }

    const failedConditions: string[] = [];
    const results: boolean[] = [];

    for (const condition of policy.conditions) {
      const conditionResult = this.evaluateCondition(condition, userAttributes, context);
      results.push(conditionResult);
      
      if (!conditionResult) {
        failedConditions.push(`${condition.attribute_name} ${condition.operator} ${condition.attribute_value}`);
      }
    }

    // For now, treat all conditions as AND logic
    // TODO: Implement proper AND/OR logic based on condition_type
    const allowed = results.every(result => result);

    return {
      allowed,
      policyName: policy.name,
      failedConditions: allowed ? undefined : failedConditions
    };
  }

  /**
   * Evaluate a single condition against user attributes
   */
  private evaluateCondition(
    condition: any,
    userAttributes: UserAttributes,
    context?: AccessContext
  ): boolean {
    const { attribute_name, operator, attribute_value } = condition;
    
    // Get the actual value from user attributes or context
    let actualValue: any;
    
    switch (attribute_name) {
      case 'job_title':
        actualValue = userAttributes.jobTitle;
        break;
      case 'department':
        actualValue = userAttributes.department;
        break;
      case 'is_manager':
        actualValue = userAttributes.isManager;
        break;
      case 'certifications':
        actualValue = userAttributes.certifications;
        break;
      case 'assigned_modules':
        actualValue = userAttributes.assignedModules;
        break;
      case 'direct_reports':
        actualValue = userAttributes.directReports;
        break;
      case 'company_id':
        actualValue = context?.companyId;
        break;
      case 'client_id':
        actualValue = context?.clientId;
        break;
      default:
        actualValue = userAttributes.customAttributes[attribute_name] || null;
    }

    // Evaluate based on operator
    switch (operator) {
      case 'equals':
        return actualValue === attribute_value;
      case 'not_equals':
        return actualValue !== attribute_value;
      case 'contains':
        return Array.isArray(actualValue) 
          ? actualValue.includes(attribute_value)
          : String(actualValue).includes(attribute_value);
      case 'not_contains':
        return Array.isArray(actualValue)
          ? !actualValue.includes(attribute_value)
          : !String(actualValue).includes(attribute_value);
      case 'in':
        const inValues = attribute_value.split(',').map((v: string) => v.trim());
        return inValues.includes(String(actualValue));
      case 'not_in':
        const notInValues = attribute_value.split(',').map((v: string) => v.trim());
        return !notInValues.includes(String(actualValue));
      case 'greater_than':
        return Number(actualValue) > Number(attribute_value);
      case 'less_than':
        return Number(actualValue) < Number(attribute_value);
      default:
        logger.api.warn('Unknown operator in condition', { operator, condition });
        return false;
    }
  }

  /**
   * Generate cache key for permission check
   */
  private getCacheKey(userId: string, feature: string, action: string, context?: AccessContext): string {
    const contextStr = context ? JSON.stringify(context) : '';
    return `${userId}:${feature}:${action}:${contextStr}`;
  }

  /**
   * Cache permission result
   */
  private cacheResult(key: string, allowed: boolean): void {
    this.cache.set(key, {
      allowed,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });

    // Clean up old cache entries periodically
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached permissions (useful for testing or when roles change)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get user's assigned modules for UI purposes
   */
  async getUserModules(userId: string): Promise<string[]> {
    const attributes = await this.getUserAttributes(userId);
    return attributes.assignedModules;
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(userRole => roles.includes(userRole.role));
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(userRole => userRole.role === role);
  }
}

// Export singleton instance
export const permissionEngine = new PermissionEngine();