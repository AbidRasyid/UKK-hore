/**
 * Clean up any legacy credential data from browser storage (localStorage / sessionStorage)
 */
export function purgeBrowserStorageCredentials() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('current_user_id');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('current_user_id');
  } catch {
    // Ignore storage access errors
  }
}
