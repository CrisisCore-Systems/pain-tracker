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
const ROLE_PERMISSIONS: Record<ClinicUserRole, string[]> = {
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
      // Check for stored session token
      const sessionToken = localStorage.getItem('clinic_session_token');
      
      if (!sessionToken) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Validate session with backend
      // For now, decode stored user data (in production, validate with API)
      const userData = localStorage.getItem('clinic_user_data');
      
      if (userData) {
        const user = JSON.parse(userData) as ClinicUser;
        
        // Log session restoration
        await hipaaComplianceService.logAuditEvent({
          actionType: 'read',
          resourceType: 'Session',
          userId: user.id,
          userRole: user.role,
          outcome: 'success',
          details: { action: 'session_restored' }
        });

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, _password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // In production, this would call your authentication API
      // For now, we'll simulate authentication
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/clinic/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password: _password })
      // });
      
      // Simulated authentication (REMOVE IN PRODUCTION)
      const mockUser: ClinicUser = {
        id: `clinic-${Date.now()}`,
        email,
        name: email.split('@')[0].replace('.', ' ').split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        role: email.includes('admin') ? 'admin' : 
              email.includes('nurse') ? 'nurse' :
              email.includes('research') ? 'researcher' : 'physician',
        licenseNumber: 'BC-12345',
        specialty: 'Pain Medicine',
        npiNumber: '1234567890',
        organizationId: 'org-001',
        organizationName: 'Pain Management Clinic',
        permissions: ROLE_PERMISSIONS[
          email.includes('admin') ? 'admin' : 
          email.includes('nurse') ? 'nurse' :
          email.includes('research') ? 'researcher' : 'physician'
        ],
        lastLogin: new Date().toISOString()
      };

      // Store session (in production, use secure httpOnly cookies)
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36)}`;
      localStorage.setItem('clinic_session_token', sessionToken);
      localStorage.setItem('clinic_user_data', JSON.stringify(mockUser));

      // Log successful login
      await hipaaComplianceService.logAuditEvent({
        actionType: 'login',
        resourceType: 'Session',
        userId: mockUser.id,
        userRole: mockUser.role,
        outcome: 'success',
        details: { 
          action: 'login',
          email: mockUser.email,
          role: mockUser.role,
          ip: 'client_ip' // In production, get from server
        }
      });

      setAuthState({
        user: mockUser,
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
          action: 'login_failed',
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
    }
  };

  const logout = async () => {
    const currentUser = authState.user;

    try {
      // Clear session
      localStorage.removeItem('clinic_session_token');
      localStorage.removeItem('clinic_user_data');

      // Log logout
      if (currentUser) {
        await hipaaComplianceService.logAuditEvent({
          actionType: 'logout',
          resourceType: 'Session',
          userId: currentUser.id,
          userRole: currentUser.role,
          outcome: 'success',
          details: { action: 'logout' }
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
      // Force logout even if logging fails
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
