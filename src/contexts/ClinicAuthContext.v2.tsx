/**
 * Clinic Authentication Context
 * Manages clinician login, role-based access, and session handling
 * Updated for httpOnly cookies and CSRF protection
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hipaaComplianceService } from '../services/HIPAACompliance';

export type ClinicUserRole = 'physician' | 'nurse' | 'admin' | 'researcher';

export interface ClinicUser {
  id: string;
  email: string;
  name: string;
  role: ClinicUserRole;
  licenseNumber?: string;
  specialty?: string;
  npiNumber?: string;
  organizationId: string;
  organizationName: string;
  permissions: string[];
  lastLogin?: string;
  mfaEnabled?: boolean;
}

export interface ClinicAuthState {
  user: ClinicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresMfa?: boolean;
}

interface ClinicAuthContextType extends ClinicAuthState {
  login: (email: string, password: string, mfaCode?: string) => Promise<void>;
  logout: (logoutAllDevices?: boolean) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: ClinicUserRole | ClinicUserRole[]) => boolean;
  refreshSession: () => Promise<void>;
}

const ClinicAuthContext = createContext<ClinicAuthContextType | null>(null);

// Helper to get CSRF token from cookie
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith('csrfToken='));
  if (!csrfCookie) return null;
  
  const value = csrfCookie.split('=')[1];
  return value || null;
}

interface ClinicAuthProviderProps {
  children: ReactNode;
}

export function ClinicAuthProvider({ children }: ClinicAuthProviderProps) {
  const [authState, setAuthState] = useState<ClinicAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    requiresMfa: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // With httpOnly cookies, we just call verify with credentials: 'include'
      const response = await fetch('/api/clinic/auth/verify', {
        method: 'GET',
        credentials: 'include', // Send httpOnly cookies
      });

      const data = await response.json();

      if (response.ok && data.success && data.valid && data.user) {
        // Session is still valid
        await hipaaComplianceService.logAuditEvent({
          actionType: 'read',
          resourceType: 'Session',
          userId: data.user.id,
          userRole: data.user.role,
          outcome: 'success',
          details: { action: 'session_restored' }
        });

        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresMfa: false,
        });
      } else {
        // Try refresh with httpOnly cookie
        try {
          const refreshResponse = await fetch('/api/clinic/auth/refresh', {
            method: 'POST',
            credentials: 'include', // Send httpOnly cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok && refreshData.success) {
            // New access token set in httpOnly cookie, verify session
            const retryResponse = await fetch('/api/clinic/auth/verify', {
              method: 'GET',
              credentials: 'include',
            });

            const retryData = await retryResponse.json();

            if (retryResponse.ok && retryData.success && retryData.valid && retryData.user) {
              setAuthState({
                user: retryData.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                requiresMfa: false,
              });
              return;
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }

        // Session restoration failed
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          requiresMfa: false,
        });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresMfa: false,
      });
    }
  };

  const login = async (email: string, password: string, mfaCode?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call backend authentication API with credentials: 'include'
      const response = await fetch('/api/clinic/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Receive httpOnly cookies
        body: JSON.stringify({ email, password, mfaCode }),
      });

      const data = await response.json();

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const message = retryAfter 
          ? `Too many login attempts. Please try again in ${retryAfter} seconds.`
          : 'Too many login attempts. Please try again later.';
        
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        return;
      }

      if (!response.ok || !data.success) {
        // Check if MFA is required
        if (data.requiresMfa || data.mfaEnabled) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            requiresMfa: true,
          }));
          return;
        }

        throw new Error(data.error || 'Authentication failed');
      }

      // Successful login - tokens are in httpOnly cookies
      const user: ClinicUser = data.user;

      // Log successful authentication
      await hipaaComplianceService.logAuditEvent({
        actionType: 'create',
        resourceType: 'Session',
        userId: user.id,
        userRole: user.role,
        outcome: 'success',
        details: {
          email: user.email,
          role: user.role,
          mfaEnabled: data.mfaEnabled,
        }
      });

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresMfa: false,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      console.error('Login error:', error);

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  };

  const logout = async (logoutAllDevices = false) => {
    try {
      const csrfToken = getCsrfToken();

      // Call backend logout API
      const response = await fetch('/api/clinic/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        credentials: 'include', // Send httpOnly cookies
        body: JSON.stringify({ revokeAllSessions: logoutAllDevices }),
      });

      if (authState.user) {
        await hipaaComplianceService.logAuditEvent({
          actionType: 'delete',
          resourceType: 'Session',
          userId: authState.user.id,
          userRole: authState.user.role,
          outcome: 'success',
          details: { logoutAllDevices }
        });
      }

      if (!response.ok) {
        console.error('Logout failed:', await response.text());
      }

    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear auth state (cookies cleared by server)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresMfa: false,
      });
    }
  };

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/clinic/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // New access token set in httpOnly cookie
        // Verify the new session
        await checkSession();
      } else {
        // Refresh failed, clear auth state
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Session expired',
          requiresMfa: false,
        });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session refresh failed',
        requiresMfa: false,
      });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    return authState.user.permissions.includes(permission);
  };

  const hasRole = (role: ClinicUserRole | ClinicUserRole[]): boolean => {
    if (!authState.user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(authState.user.role);
  };

  const value: ClinicAuthContextType = {
    ...authState,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshSession,
  };

  return (
    <ClinicAuthContext.Provider value={value}>
      {children}
    </ClinicAuthContext.Provider>
  );
}

export function useClinicAuth() {
  const context = useContext(ClinicAuthContext);
  if (!context) {
    throw new Error('useClinicAuth must be used within ClinicAuthProvider');
  }
  return context;
}
