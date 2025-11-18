import { useState, useMemo } from 'react';
import { formatNumber } from '../../utils/formatting';
import {
  Users,
  TrendingUp,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Search,
  BarChart3,
} from 'lucide-react';
import type { PainEntry } from '../../types';
import { painAnalyticsService } from '../../services/PainAnalyticsService';
import { fhirService } from '../../services/FHIRService';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../../design-system';

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  lastEntry: string;
  averagePain: number;
  totalEntries: number;
  riskLevel: 'low' | 'medium' | 'high';
  conditions: string[];
  entries: PainEntry[];
}

interface ProviderDashboardProps {
  patients?: Patient[];
  providerId: string;
}

export function ProviderDashboard({ patients = [] }: ProviderDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy] = useState<'name' | 'lastEntry' | 'averagePain' | 'riskLevel'>('lastEntry');

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || patient.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastEntry':
          return new Date(b.lastEntry).getTime() - new Date(a.lastEntry).getTime();
        case 'averagePain':
          return b.averagePain - a.averagePain;
        case 'riskLevel': {
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        }
        default:
          return 0;
      }
    });
  }, [patients, searchTerm, riskFilter, sortBy]);

  // Dashboard statistics
  const stats = useMemo(() => {
    return {
      totalPatients: patients.length,
      activePatients: patients.filter(p => {
        const lastEntry = new Date(p.lastEntry);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastEntry >= weekAgo;
      }).length,
      highRiskPatients: patients.filter(p => p.riskLevel === 'high').length,
      averagePainLevel:
        patients.reduce((sum, p) => sum + p.averagePain, 0) / (patients.length || 1),
    };
  }, [patients]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleExportFHIR = async (patient: Patient) => {
    try {
      const bundle = fhirService.painEntriesToFHIRBundle(patient.entries, patient.id);
      const dataStr = JSON.stringify(bundle, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${patient.name.replace(/\s+/g, '_')}_pain_data_fhir.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Failed to export FHIR data:', error);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="provider-dashboard space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Provider Dashboard</h1>
          <p className="text-muted-foreground">Pain management patient overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">{stats.activePatients} active this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Pain Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.averagePainLevel, 1)}</div>
            <p className="text-xs text-muted-foreground">Across all active patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRiskPatients}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activePatients}</div>
            <p className="text-xs text-muted-foreground">Logged data this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient List</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={riskFilter}
                    onChange={e =>
                      setRiskFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')
                    }
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/80'
                    }`}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-foreground">{patient.name}</h4>
                          <div
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getRiskColor(patient.riskLevel)}`}
                          >
                            {getRiskIcon(patient.riskLevel)}
                            <span className="capitalize">{patient.riskLevel} Risk</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>
                            {patient.gender},{' '}
                            {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}{' '}
                            years
                          </span>
                          <span>Avg Pain: {formatNumber(patient.averagePain, 1)}</span>
                          <span>{patient.totalEntries} entries</span>
                        </div>
                        {patient.conditions.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {patient.conditions.slice(0, 3).map((condition, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                              >
                                {condition}
                              </span>
                            ))}
                            {patient.conditions.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{patient.conditions.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Last Entry</div>
                        <div className="text-sm font-medium">
                          {new Date(patient.lastEntry).toLocaleDateString()}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => {
                            e.stopPropagation();
                            handleExportFHIR(patient);
                          }}
                          className="mt-2"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          FHIR
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-1">
          {selectedPatient ? (
            <PatientDetailPanel patient={selectedPatient} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a patient to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientDetailPanel({ patient }: { patient: Patient }) {
  const analytics = useMemo(() => {
    if (patient.entries.length < 3) return null;

    return {
      patterns: painAnalyticsService.analyzePatterns(patient.entries),
      prediction: painAnalyticsService.predictPain(patient.entries, '7d'),
      trends: painAnalyticsService.analyzeTrends(patient.entries),
    };
  }, [patient.entries]);

  const recentEntries = useMemo(() => {
    return patient.entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [patient.entries]);

  return (
    <div className="space-y-4">
      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Patient Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground">{patient.name}</h4>
            <p className="text-sm text-muted-foreground">
              {patient.gender},{' '}
              {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Avg Pain</div>
              <div className="text-lg font-semibold text-primary">
                {formatNumber(patient.averagePain, 1)}/10
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
              <div className="text-lg font-semibold">{patient.totalEntries}</div>
            </div>
          </div>

          {patient.conditions.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Conditions</div>
              <div className="flex flex-wrap gap-1">
                {patient.conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Insights */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Trend</div>
              <div
                className={`text-sm font-medium ${
                  analytics.trends.overallTrend === 'improving'
                    ? 'text-green-600'
                    : analytics.trends.overallTrend === 'worsening'
                      ? 'text-red-600'
                      : 'text-blue-600'
                }`}
              >
                {analytics.trends.overallTrend.charAt(0).toUpperCase() +
                  analytics.trends.overallTrend.slice(1)}
                ({Math.round(analytics.trends.trendStrength * 100)}% confidence)
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">7-Day Prediction</div>
              <div className="text-sm font-medium">
                {formatNumber(analytics.prediction.predictedPain, 1)}/10
                <span className="text-muted-foreground ml-1">
                  ({Math.round(analytics.prediction.confidence * 100)}% confidence)
                </span>
              </div>
            </div>

            {analytics.patterns.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Patterns Detected</div>
                <div className="text-xs text-foreground">
                  {analytics.patterns[0].name} -{' '}
                  {Math.round(analytics.patterns[0].confidence * 100)}% confidence
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <div className="text-sm font-medium">
                    Pain Level: {entry.baselineData.pain}/10
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    entry.baselineData.pain >= 7
                      ? 'bg-red-100 text-red-600'
                      : entry.baselineData.pain >= 4
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                  }`}
                >
                  {entry.baselineData.pain}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
