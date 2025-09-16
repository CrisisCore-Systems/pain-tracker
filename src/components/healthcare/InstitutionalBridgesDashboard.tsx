// Institutional Bridges Dashboard Component
// Central interface for healthcare providers to manage integrations

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Share2,
  Shield,
  Key,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Download,
  Upload,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '../../design-system';

interface IntegrationStatus {
  fhir: {
    connected: boolean;
    endpoint: string;
    lastSync: string;
    resourceCount: number;
  };
  oauth: {
    configured: boolean;
    clientCount: number;
    activeTokens: number;
  };
  dataSharing: {
    activeAgreements: number;
    pendingRequests: number;
    dataVolume: number;
  };
  compliance: {
    score: number;
    issues: number;
    lastAudit: string;
  };
}

interface ConnectionConfig {
  fhirEndpoint: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  organizationId: string;
  npi: string;
}

interface DataSharingAgreement {
  id: string;
  partnerName: string;
  purpose: string;
  status: 'active' | 'pending' | 'expired';
  dataTypes: string[];
  expirationDate: string;
}

interface ComplianceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function InstitutionalBridgesDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    fhir: {
      connected: false,
      endpoint: '',
      lastSync: '',
      resourceCount: 0
    },
    oauth: {
      configured: false,
      clientCount: 0,
      activeTokens: 0
    },
    dataSharing: {
      activeAgreements: 0,
      pendingRequests: 0,
      dataVolume: 0
    },
    compliance: {
      score: 0,
      issues: 0,
      lastAudit: ''
    }
  });

  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    fhirEndpoint: '',
    clientId: '',
    clientSecret: '',
    scopes: ['patient/*.read', 'patient/*.write'],
    organizationId: '',
    npi: ''
  });

  const [agreements, setAgreements] = useState<DataSharingAgreement[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadIntegrationStatus();
    loadDataSharingAgreements();
    loadComplianceAlerts();
  }, []);

  const loadIntegrationStatus = async () => {
    // Mock data - would fetch from actual services
    setIntegrationStatus({
      fhir: {
        connected: true,
        endpoint: 'https://fhir.hospital.org/R4',
        lastSync: '2025-09-15T10:30:00Z',
        resourceCount: 1234
      },
      oauth: {
        configured: true,
        clientCount: 3,
        activeTokens: 12
      },
      dataSharing: {
        activeAgreements: 2,
        pendingRequests: 1,
        dataVolume: 45678
      },
      compliance: {
        score: 95,
        issues: 2,
        lastAudit: '2025-09-01T00:00:00Z'
      }
    });
  };

  const loadDataSharingAgreements = async () => {
    setAgreements([
      {
        id: 'dsa-001',
        partnerName: 'Regional Medical Center',
        purpose: 'Clinical care coordination',
        status: 'active',
        dataTypes: ['Patient', 'Observation', 'Medication'],
        expirationDate: '2026-01-15'
      },
      {
        id: 'dsa-002',
        partnerName: 'Research Institute',
        purpose: 'Pain management research',
        status: 'pending',
        dataTypes: ['Observation', 'QuestionnaireResponse'],
        expirationDate: '2025-12-31'
      }
    ]);
  };

  const loadComplianceAlerts = async () => {
    setComplianceAlerts([
      {
        id: 'alert-001',
        type: 'warning',
        message: 'Certificate expires in 30 days',
        timestamp: '2025-09-15T08:00:00Z',
        resolved: false
      },
      {
        id: 'alert-002',
        type: 'info',
        message: 'Security audit completed successfully',
        timestamp: '2025-09-14T16:30:00Z',
        resolved: true
      }
    ]);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Mock connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Connection test successful!');
    } catch {
      alert('Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // Mock data export
      await new Promise(resolve => setTimeout(resolve, 1500));
      const dataUri = 'data:application/json;charset=utf-8,' + 
        encodeURIComponent(JSON.stringify({ exported: 'data' }, null, 2));
      
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', 'fhir-export.json');
      link.click();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="institutional-bridges-dashboard space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Institutional Bridges</h1>
          <p className="text-muted-foreground">Healthcare integration and data sharing management</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fhir">FHIR Integration</TabsTrigger>
          <TabsTrigger value="oauth">Authentication</TabsTrigger>
          <TabsTrigger value="data-sharing">Data Sharing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FHIR Integration</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`flex items-center space-x-2 ${getStatusColor(integrationStatus.fhir.connected)}`}>
                  {getStatusIcon(integrationStatus.fhir.connected)}
                  <span className="text-sm font-medium">
                    {integrationStatus.fhir.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {integrationStatus.fhir.resourceCount} resources synced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OAuth2 Auth</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`flex items-center space-x-2 ${getStatusColor(integrationStatus.oauth.configured)}`}>
                  {getStatusIcon(integrationStatus.oauth.configured)}
                  <span className="text-sm font-medium">
                    {integrationStatus.oauth.configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {integrationStatus.oauth.activeTokens} active tokens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Sharing</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{integrationStatus.dataSharing.activeAgreements}</div>
                <p className="text-xs text-muted-foreground">
                  Active agreements, {integrationStatus.dataSharing.pendingRequests} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getComplianceScoreColor(integrationStatus.compliance.score)}`}>
                  {integrationStatus.compliance.score}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {integrationStatus.compliance.issues} issues found
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">FHIR sync completed</div>
                    <div className="text-xs text-muted-foreground">1,234 resources synchronized successfully</div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-auto">2 hours ago</div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">New data sharing agreement</div>
                    <div className="text-xs text-muted-foreground">Research Institute partnership approved</div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-auto">1 day ago</div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-sm font-medium">Certificate expiring soon</div>
                    <div className="text-xs text-muted-foreground">SSL certificate expires in 30 days</div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-auto">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FHIR Integration Tab */}
        <TabsContent value="fhir" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FHIR Server Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">FHIR Endpoint URL</label>
                <Input
                  value={connectionConfig.fhirEndpoint}
                  onChange={(e) => setConnectionConfig(prev => ({ ...prev, fhirEndpoint: e.target.value }))}
                  placeholder="https://fhir.hospital.org/R4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization ID</label>
                  <Input
                    value={connectionConfig.organizationId}
                    onChange={(e) => setConnectionConfig(prev => ({ ...prev, organizationId: e.target.value }))}
                    placeholder="org-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">NPI Number</label>
                  <Input
                    value={connectionConfig.npi}
                    onChange={(e) => setConnectionConfig(prev => ({ ...prev, npi: e.target.value }))}
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleTestConnection} disabled={isLoading}>
                  {isLoading ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Sync Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FHIR Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Patient', 'Observation', 'Medication', 'Encounter', 'Practitioner', 'Organization'].map((resource) => (
                  <div key={resource} className="p-3 border rounded-lg text-center">
                    <div className="font-medium">{resource}</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 1000)} records
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OAuth Authentication Tab */}
        <TabsContent value="oauth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OAuth2 Client Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client ID</label>
                  <Input
                    value={connectionConfig.clientId}
                    onChange={(e) => setConnectionConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="client_12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Secret</label>
                  <div className="relative">
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      value={connectionConfig.clientSecret}
                      onChange={(e) => setConnectionConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                      placeholder="client_secret_xyz"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scopes</label>
                <div className="space-y-2">
                  {['patient/*.read', 'patient/*.write', 'system/*.read', 'openid', 'fhirUser'].map((scope) => (
                    <label key={scope} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={connectionConfig.scopes.includes(scope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConnectionConfig(prev => ({
                              ...prev,
                              scopes: [...prev.scopes, scope]
                            }));
                          } else {
                            setConnectionConfig(prev => ({
                              ...prev,
                              scopes: prev.scopes.filter(s => s !== scope)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button>
                <Key className="h-4 w-4 mr-2" />
                Generate New Credentials
              </Button>
            </CardContent>
          </Card>

          {/* Active Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>Active Access Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Token {i + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        Expires: {new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sharing Tab */}
        <TabsContent value="data-sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Sharing Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agreements.map((agreement) => (
                  <div key={agreement.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{agreement.partnerName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        agreement.status === 'active' ? 'bg-green-100 text-green-600' :
                        agreement.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {agreement.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{agreement.purpose}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {agreement.dataTypes.map((type) => (
                          <span key={type} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Expires: {new Date(agreement.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="mt-4">
                <FileText className="h-4 w-4 mr-2" />
                Create New Agreement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance Score */}
            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${getComplianceScoreColor(integrationStatus.compliance.score)}`}>
                  {integrationStatus.compliance.score}%
                </div>
                <p className="text-muted-foreground mt-2">
                  Last audit: {new Date(integrationStatus.compliance.lastAudit).toLocaleDateString()}
                </p>
                <Button className="mt-4" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Run Compliance Check
                </Button>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { feature: 'End-to-end encryption', enabled: true },
                    { feature: 'Audit logging', enabled: true },
                    { feature: 'Access controls', enabled: true },
                    { feature: 'Data validation', enabled: true },
                    { feature: 'Backup encryption', enabled: false }
                  ].map(({ feature, enabled }) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm">{feature}</span>
                      <div className={`flex items-center space-x-2 ${enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {enabled ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        <span className="text-xs">{enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'error' ? 'border-red-500 bg-red-50' :
                      alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {alert.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
                         alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                         <CheckCircle className="h-4 w-4 text-blue-500" />}
                        <span className="text-sm font-medium">{alert.message}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
