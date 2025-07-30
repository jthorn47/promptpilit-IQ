
import { logger } from '@/lib/logger';

export interface UserCreationError {
  type: 'validation' | 'database' | 'network' | 'permission' | 'unknown';
  message: string;
  details?: any;
  userFriendlyMessage: string;
}

/**
 * Parses and categorizes errors from user creation attempts
 */
export const parseUserCreationError = (error: any, context?: any): UserCreationError => {
  logger.auth.error('Parsing user creation error', error, { context });

  // Handle Supabase RPC errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return {
          type: 'database',
          message: 'Function not found',
          details: error,
          userFriendlyMessage: 'User creation service is not available. Please contact support.'
        };
      
      case '23505':
        return {
          type: 'validation',
          message: 'Unique constraint violation',
          details: error,
          userFriendlyMessage: 'A user with this email already exists.'
        };
      
      case '23514':
        return {
          type: 'validation',
          message: 'Check constraint violation',
          details: error,
          userFriendlyMessage: 'Invalid role or data provided. Please check your selections.'
        };
      
      case '42703':
        return {
          type: 'database',
          message: 'Column does not exist',
          details: error,
          userFriendlyMessage: 'Database schema mismatch. Please contact support.'
        };
      
      default:
        return {
          type: 'database',
          message: error.message || 'Database error',
          details: error,
          userFriendlyMessage: `Database error: ${error.message}`
        };
    }
  }

  // Handle function response errors (from create_test_account)
  if (error?.error && typeof error.error === 'string') {
    if (error.error.includes('already exists')) {
      return {
        type: 'validation',
        message: error.error,
        details: error,
        userFriendlyMessage: 'A user with this email already exists. Please use a different email.'
      };
    }
    
    if (error.error.includes('Invalid role')) {
      return {
        type: 'validation',
        message: error.error,
        details: error,
        userFriendlyMessage: 'The selected role is not valid. Please choose a different role.'
      };
    }
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error',
      details: error,
      userFriendlyMessage: 'Network error. Please check your connection and try again.'
    };
  }

  // Handle permission errors
  if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
    return {
      type: 'permission',
      message: 'Permission denied',
      details: error,
      userFriendlyMessage: 'You do not have permission to create users.'
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: error?.message || 'Unknown error',
    details: error,
    userFriendlyMessage: 'An unexpected error occurred. Please try again or contact support.'
  };
};

/**
 * Reports error metrics for monitoring
 */
export const reportUserCreationError = (error: UserCreationError, context?: any) => {
  logger.auth.error('User creation error reported', error, { 
    context,
    errorType: error.type,
    timestamp: new Date().toISOString()
  });

  // In a real application, you might send this to an error tracking service
  // like Sentry, LogRocket, or similar
};
