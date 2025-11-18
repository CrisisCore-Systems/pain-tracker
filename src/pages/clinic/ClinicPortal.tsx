/**
 * Clinic Portal - Healthcare Professional Interface
 * Separate UI/UX optimized for clinical workflows
 */

import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ClinicDashboard } from './ClinicDashboard';
import { EnhancedPatientView } from './EnhancedPatientView';
import { ClinicSettings } from './ClinicSettings';
import { ClinicLogin } from './ClinicLogin';
import { ClinicSidebar } from '../../components/clinic/ClinicSidebar';
import { ClinicHeader } from '../../components/clinic/ClinicHeader';
import { ClinicProtectedRoute } from '../../components/clinic/ClinicProtectedRoute';
import { RealTimeMonitoring } from '../../components/clinic/RealTimeMonitoring';
import { ClinicAuthProvider, useClinicAuth } from '../../contexts/ClinicAuthContext';
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3,
  Shield,
  Activity
} from 'lucide-react';

export function ClinicPortal() {
  return (
    <ClinicAuthProvider>
      <ClinicPortalContent />
    </ClinicAuthProvider>
  );
}

function ClinicPortalContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useClinicAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: '/clinic/dashboard',
      description: 'Overview and analytics'
    },
    {
      label: 'Monitoring',
      icon: Activity,
      path: '/clinic/monitoring',
      description: 'Real-time patient alerts'
    },
    {
      label: 'Patients',
      icon: Users,
      path: '/clinic/patients',
      description: 'Patient list and search'
    },
    {
      label: 'Appointments',
      icon: Calendar,
      path: '/clinic/appointments',
      description: 'Schedule management'
    },
    {
      label: 'Reports',
      icon: FileText,
      path: '/clinic/reports',
      description: 'Clinical reports and exports'
    },
    {
      label: 'Compliance',
      icon: Shield,
      path: '/clinic/compliance',
      description: 'HIPAA and audit logs',
      requiresAdmin: true
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/clinic/settings',
      description: 'Portal configuration'
    }
  ];

  const filteredNavItems = navigationItems.filter(item => {
    if (item.requiresAdmin && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  // If no user, show login page
  if (!user) {
    return <ClinicLogin />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Clinical Sidebar */}
      <ClinicSidebar
        items={filteredNavItems}
        currentPath={location.pathname}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Clinical Header */}
        <ClinicHeader
          user={user}
          onSignOut={() => logout().then(() => navigate('/clinic/login'))}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <Routes>
            <Route index element={<Navigate to="/clinic/dashboard" replace />} />
            <Route path="dashboard" element={
              <ClinicProtectedRoute>
                <ClinicDashboard />
              </ClinicProtectedRoute>
            } />
            <Route path="monitoring" element={
              <ClinicProtectedRoute requiredPermission="view:patients">
                <div className="p-6">
                  <RealTimeMonitoring />
                </div>
              </ClinicProtectedRoute>
            } />
            <Route path="patients" element={
              <ClinicProtectedRoute requiredPermission="view:patients">
                <EnhancedPatientView />
              </ClinicProtectedRoute>
            } />
            <Route path="patients/:patientId" element={
              <ClinicProtectedRoute requiredPermission="view:patients">
                <EnhancedPatientView />
              </ClinicProtectedRoute>
            } />
            <Route path="appointments" element={
              <ClinicProtectedRoute requiredPermission="schedule:appointments">
                <div className="p-6">Appointments (Coming Soon)</div>
              </ClinicProtectedRoute>
            } />
            <Route path="reports" element={
              <ClinicProtectedRoute requiredPermission="view:reports">
                <div className="p-6">Reports (Coming Soon)</div>
              </ClinicProtectedRoute>
            } />
            <Route path="compliance" element={
              <ClinicProtectedRoute requiredRole="admin">
                <div className="p-6">Compliance (Coming Soon)</div>
              </ClinicProtectedRoute>
            } />
            <Route path="settings" element={
              <ClinicProtectedRoute>
                <ClinicSettings />
              </ClinicProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/clinic/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
