import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Badge } from '../../design-system/components/Badge';
import { cn } from '../../design-system/utils';
import type { AuditLogEntry } from '../../types/compliance';

export function ClinicCompliance() {
  const [filterAction, setFilterAction] = useState<string>('all');
  
  // Mock data for audit logs
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-001',
      timestamp: '2025-11-20T14:30:00Z',
      actorId: 'DR-001',
      actorName: 'Dr. Sarah Chen',
      actorRole: 'physician',
      action: 'view',
      resourceType: 'patient',
      resourceId: 'P-001',
      details: 'Viewed patient dashboard: John Smith',
      ipAddress: '192.168.1.5',
      status: 'success'
    },
    {
      id: 'LOG-002',
      timestamp: '2025-11-20T14:15:22Z',
      actorId: 'N-003',
      actorName: 'Nurse James',
      actorRole: 'nurse',
      action: 'update',
      resourceType: 'appointment',
      resourceId: 'A-002',
      details: 'Updated appointment status for Maria Garcia',
      ipAddress: '192.168.1.8',
      status: 'success'
    },
    {
      id: 'LOG-003',
      timestamp: '2025-11-20T13:45:00Z',
      actorId: 'SYS',
      actorName: 'System',
      actorRole: 'system',
      action: 'export',
      resourceType: 'report',
      details: 'Automated daily backup encrypted',
      ipAddress: 'internal',
      status: 'success'
    },
    {
      id: 'LOG-004',
      timestamp: '2025-11-20T11:20:10Z',
      actorId: 'DR-001',
      actorName: 'Dr. Sarah Chen',
      actorRole: 'physician',
      action: 'access_phi',
      resourceType: 'patient',
      resourceId: 'P-002',
      details: 'Accessed sensitive clinical notes',
      ipAddress: '192.168.1.5',
      status: 'success'
    },
    {
      id: 'LOG-005',
      timestamp: '2025-11-20T09:05:00Z',
      actorId: 'UNKNOWN',
      actorName: 'Unknown',
      actorRole: 'system',
      action: 'login',
      resourceType: 'system',
      details: 'Failed login attempt - Invalid credentials',
      ipAddress: '10.0.0.55',
      status: 'failure'
    }
  ]);

  const getActionIcon = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <Lock className="h-4 w-4" />;
      case 'view':
      case 'access_phi':
        return <Eye className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      case 'update':
      case 'create':
      case 'delete':
        return <FileText className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'failure':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'warning':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterAction === 'all') return true;
    return log.action.includes(filterAction); // simple contains match for demo
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Compliance Audit Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Privacy-aligned access tracking and security monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Logs (CSV)
            </Button>
        </div>
      </div>

       <div className="grid gap-6 md:grid-cols-4">
        {/* Quick Stats */}
        <Card className="md:col-span-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Events Today</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">142</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400">PHI Access</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">45</div>
                    </div>
                     <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">Data Integrity</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">100%</div>
                    </div>
                     <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">Security Alerts</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1</div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="md:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search by user or resource..." 
                            className="pl-9 w-[300px]"
                        />
                    </div>
                     <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setFilterAction('all')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                filterAction === 'all' 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                            )}
                        >
                            All
                        </button>
                         <button 
                            onClick={() => setFilterAction('access_phi')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                filterAction === 'access_phi' 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                            )}
                        >
                            PHI Access
                        </button>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                </Button>
            </CardHeader>
             <CardContent className="p-0">
                <div className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <div className="col-span-2">Timestamp</div>
                        <div className="col-span-2">Actor</div>
                        <div className="col-span-2">Action</div>
                        <div className="col-span-3">Details</div>
                        <div className="col-span-2">Source</div>
                        <div className="col-span-1 text-right">Status</div>
                    </div>
                    
                    <div className="divide-y divide-border">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm">
                            <div className="col-span-2 text-slate-600 dark:text-slate-400">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                                <div className="text-xs text-slate-400">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="font-medium text-slate-900 dark:text-white">{log.actorName}</div>
                                <div className="text-xs text-slate-500 capitalize">{log.actorRole}</div>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <span className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {getActionIcon(log.action)}
                                </span>
                                <span className={cn(
                                    "font-medium capitalize",
                                    log.action === 'access_phi' && "text-purple-600 dark:text-purple-400",
                                    log.action === 'delete' && "text-red-600 dark:text-red-400"
                                )}>
                                    {log.action.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="col-span-3 text-slate-600 dark:text-slate-300">
                                {log.details}
                                {log.resourceId && (
                                    <div className="text-xs text-slate-400 mt-0.5 font-mono">Ref: {log.resourceId}</div>
                                )}
                            </div>
                            <div className="col-span-2 text-slate-500 font-mono text-xs">
                                {log.ipAddress}
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <Badge variant="secondary" className={cn("capitalize px-2", getStatusColor(log.status))}>
                                    {log.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
