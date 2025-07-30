
import { logger } from '@/lib/logger';

// Valid roles that should exist in the database
export const EXPECTED_ROLES = [
  'super_admin',
  'company_admin', 
  'learner',
  'admin',
  'client_admin'
] as const;

export type ExpectedRole = typeof EXPECTED_ROLES[number];

/**
 * Validates if a role is one of the expected valid roles
 */
export const isValidRole = (role: string): role is ExpectedRole => {
  return EXPECTED_ROLES.includes(role as ExpectedRole);
};

/**
 * Validates user creation form data
 */
export interface UserCreationForm {
  email: string;
  role: string;
  companyName?: string;
}

export const validateUserCreationForm = (form: UserCreationForm): string[] => {
  const errors: string[] = [];

  // Validate email
  if (!form.email || form.email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  // Validate role
  if (!form.role || form.role.trim() === '') {
    errors.push('Role is required');
  } else if (!isValidRole(form.role)) {
    errors.push(`Invalid role: ${form.role}. Valid roles are: ${EXPECTED_ROLES.join(', ')}`);
  }

  // Log validation attempt
  logger.auth.debug('User form validation', { 
    form, 
    errors, 
    isValid: errors.length === 0 
  });

  return errors;
};

/**
 * Formats role names for display
 */
export const formatRoleLabel = (role: string): string => {
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
