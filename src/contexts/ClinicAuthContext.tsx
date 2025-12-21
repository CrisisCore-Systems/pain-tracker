/**
 * Clinic Authentication Context
 * Manages clinician login, role-based access, and session handling
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
}

export interface ClinicAuthState {
  user: ClinicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ClinicAuthContextType extends ClinicAuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: ClinicUserRole | ClinicUserRole[]) => boolean;
}

const ClinicAuthContext = createContext<ClinicAuthContextType | null>(null);

// Role-based permissions
const _ROLE_PERMISSIONS: Record<ClinicUserRole, string[]> = {
  physician: [
    'view:patients',
    'edit:patients',
    'create:reports',
    'view:reports',
    'edit:reports',
    'create:prescriptions',
    'view:full_medical_history',
    'schedule:appointments',
    'cancel:appointments'
  ],
  nurse: [
    'view:patients',
    'edit:patient_vitals',
    'view:reports',
    'schedule:appointments',
    'cancel:appointments',
    'create:notes'
  ],
  admin: [
    'view:patients',
    'edit:patients',
    'create:reports',
    'view:reports',
    'edit:reports',
    'view:full_medical_history',
    'schedule:appointments',
    'cancel:appointments',
    'manage:users',
    'view:audit_logs',
    'export:data',
    'configure:system'
  ],
  researcher: [
    'view:deidentified_data',
    'export:deidentified_data',
    'view:aggregate_analytics'
  ]
};

interface ClinicAuthProviderProps {
  children: ReactNode;
}

export function ClinicAuthProvider({ children }: ClinicAuthProviderProps) {
  const [authState, setAuthState] = useState<ClinicAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check for stored tokens
      const accessToken = localStorage.getItem('clinic_access_token');
      const userData = localStorage.getItem('clinic_user_data');
      
      if (!accessToken || !userData) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Verify token with backend
      const response = await fetch('/api/clinic/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
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
          error: null
        });
      } else {
        // Token invalid or expired, try refresh
        const refreshToken = localStorage.getItem('clinic_refresh_token');
        
        if (refreshToken) {
          try {
            const refreshResponse = await fetch('/api/clinic/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });

            const refreshData = await refreshResponse.json();

            if (refreshResponse.ok && refreshData.success && refreshData.accessToken) {
              // Update access token
              localStorage.setItem('clinic_access_token', refreshData.accessToken);
              
              // Try verification again
              const retryResponse = await fetch('/api/clinic/auth/verify', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${refreshData.accessToken}`
                }
              });

              const retryData = await retryResponse.json();

              if (retryResponse.ok && retryData.success && retryData.valid && retryData.user) {
                setAuthState({
                  user: retryData.user,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null
                });
                return;
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        // If we get here, session restoration failed
        localStorage.removeItem('clinic_access_token');
        localStorage.removeItem('clinic_refresh_token');
        localStorage.removeItem('clinic_user_data');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call backend authentication API
      const response = await fetch('/api/clinic/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('clinic_access_token', data.accessToken);
      localStorage.setItem('clinic_refresh_token', data.refreshToken);
      localStorage.setItem('clinic_user_data', JSON.stringify(data.user));

      // Log successful login (backend already logged this, but we log client-side too)
      await hipaaComplianceService.logAuditEvent({
        actionType: 'login',
        resourceType: 'Session',
        userId: data.user.id,
        userRole: data.user.role,
        outcome: 'success',
        details: { 
          action: 'login_client',
          email: data.user.email,
          role: data.user.role,
        }
      });

      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Log failed login attempt
      await hipaaComplianceService.logAuditEvent({
        actionType: 'login',
        resourceType: 'Session',
        userId: 'unknown',
        userRole: 'unknown',
        outcome: 'failure',
        details: { 
          action: 'login_failed_client',
          email,
          error: errorMessage
        }
      });

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      
      throw error;
    }
  };

  const logout = async () => {
    const currentUser = authState.user;

    try {
      // Call backend logout API
      const accessToken = localStorage.getItem('clinic_access_token');
      
      if (accessToken) {
        await fetch('/api/clinic/auth/logout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ revokeAllSessions: false })
        });
      }

      // Clear local session
      localStorage.removeItem('clinic_access_token');
      localStorage.removeItem('clinic_refresh_token');
      localStorage.removeItem('clinic_user_data');

      // Log logout
      if (currentUser) {
        await hipaaComplianceService.logAuditEvent({
          actionType: 'logout',
          resourceType: 'Session',
          userId: currentUser.id,
          userRole: currentUser.role,
          outcome: 'success',
          details: { action: 'logout_client' }
        });
      }

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('clinic_access_token');
      localStorage.removeItem('clinic_refresh_token');
      localStorage.removeItem('clinic_user_data');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
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

  const contextValue: ClinicAuthContextType = {
    ...authState,
    login,
    logout,
    hasPermission,
    hasRole
  };

  return (
    <ClinicAuthContext.Provider value={contextValue}>
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
