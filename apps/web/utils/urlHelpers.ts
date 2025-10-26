// Utility functions for creating URL-safe identifiers and managing dynamic routes

/**
 * Converts a user's name and email into a unique URL-safe slug
 * Example: "John Doe" + "john.doe@example.com" -> "john-doe"
 * If name collision occurs, appends email username: "john-doe-johndoe"
 */
export function getUserSlug(name?: string | null, email?: string | null): string {
  let baseSlug = '';
  
  if (name) {
    baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
  
  if (!baseSlug && email) {
    // Use email username part if name not available
    const emailUsername = email.split('@')[0] || 'user';
    baseSlug = emailUsername
      .toLowerCase()
      .replace(/[^\w-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Append email username to make it more unique
  if (email && baseSlug) {
    const emailPart = email.split('@')[0]
      ?.toLowerCase()
      .replace(/[^\w]/g, '')
      .slice(0, 10); // Limit to 10 chars
    
    if (emailPart) {
      return `${baseSlug}-${emailPart}`;
    }
  }
  
  return baseSlug || 'user';
}

/**
 * Creates query params for task operations
 */
export function getTaskQueryParams(taskId?: string, action?: 'edit' | 'delete' | 'view'): string {
  const params = new URLSearchParams();
  
  if (taskId) {
    params.set('taskId', taskId);
  }
  
  if (action) {
    params.set('action', action);
  }
  
  return params.toString() ? `?${params.toString()}` : '';
}

/**
 * Creates query params for profile operations
 */
export function getProfileQueryParams(action?: 'editing' | 'changePassword', field?: string): string {
  const params = new URLSearchParams();
  
  if (action) {
    params.set('action', action);
  }
  
  if (field) {
    params.set('field', field);
  }
  
  return params.toString() ? `?${params.toString()}` : '';
}
