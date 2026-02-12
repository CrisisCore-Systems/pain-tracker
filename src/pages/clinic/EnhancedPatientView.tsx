import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Brain,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  User,
  Sparkles,
} from 'lucide-react';
import { PatientPainTimeline } from '../../components/clinic/PatientPainTimeline';
import { PatternDetectionService, DetectedPattern } from '../../services/PatternDetectionService';
import { ReportGenerationService, ReportPainEntry } from '../../services/ReportGenerationService';
import type { PainEntry } from '../../types';
/**
 * Convert simplified demo data to canonical PainEntry format for pattern detection
 */
function createDemoPainEntry(data: ReportPainEntry): PainEntry {
  return {
    id: data.id,
    timestamp: data.timestamp,
    baselineData: {
      pain: data.painLevel,
      locations: [data.location],
      symptoms: [],
    },
    functionalImpact: {
      limitedActivities: [],
      assistanceNeeded: [],
      mobilityAids: [],
    },
    medications: {
      current: (data.medications ?? []).map(m => ({
        name: m,
        dosage: '',
        frequency: '',
        effectiveness: '',
      })),
      changes: '',
      effectiveness: '',
    },
    treatments: {
      recent: [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality: data.sleep ?? 0,
      moodImpact: data.mood ?? 0,
      socialImpact: [],
    },
    workImpact: {
      missedWork: 0,
      modifiedDuties: [],
      workLimitations: [],
    },
    comparison: {
      worseningSince: '',
      newLimitations: [],
    },
    notes: data.notes ?? '',
    triggers: data.triggers,
    activities: data.activities,
    mood: data.mood,
    sleep: data.sleep,
  };
}
// Mock data - simplified format for demo (replace with real API calls)
const mockReportEntries: ReportPainEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 8,
    location: 'Lower Back',
    triggers: ['Prolonged Sitting', 'Cold Weather'],
    medications: ['Naproxen 500mg'],
    activities: ['Desk Work'],
    mood: 4,
    sleep: 5,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 7,
    location: 'Lower Back',
    medications: ['Naproxen 500mg'],
    activities: ['Walking'],
    mood: 5,
    sleep: 6,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 6,
    location: 'Lower Back',
    medications: ['Naproxen 500mg', 'Cyclobenzaprine 10mg'],
    activities: ['Physical Therapy'],
    mood: 6,
    sleep: 7,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 6,
    location: 'Lower Back',
    medications: ['Naproxen 500mg', 'Cyclobenzaprine 10mg'],
    activities: ['Light Exercise'],
    mood: 6,
    sleep: 7,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 5,
    location: 'Lower Back',
    medications: ['Naproxen 500mg', 'Cyclobenzaprine 10mg'],
    activities: ['Physical Therapy', 'Walking'],
    mood: 7,
    sleep: 7,
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 5,
    location: 'Lower Back',
    medications: ['Naproxen 500mg', 'Cyclobenzaprine 10mg'],
    activities: ['Light Exercise'],
    mood: 7,
    sleep: 8,
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 4,
    location: 'Lower Back',
    medications: ['Naproxen 500mg', 'Cyclobenzaprine 10mg'],
    activities: ['Physical Therapy', 'Walking'],
    mood: 8,
    sleep: 8,
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 4,
    location: 'Lower Back',
    medications: ['Naproxen 500mg'],
    activities: ['Walking', 'Light Exercise'],
    mood: 8,
    sleep: 8,
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 3,
    location: 'Lower Back',
    medications: ['Naproxen 500mg'],
    activities: ['Physical Therapy'],
    mood: 8,
    sleep: 8,
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 3,
    location: 'Lower Back',
    medications: ['Naproxen 500mg'],
    activities: ['Walking'],
    mood: 9,
    sleep: 8,
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 3,
    location: 'Lower Back',
    medications: ['Naproxen 500mg'],
    activities: ['Light Exercise', 'Walking'],
    mood: 9,
    sleep: 9,
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 2,
    location: 'Lower Back',
    medications: ['Naproxen 500mg'],
    activities: ['Physical Therapy'],
    mood: 9,
    sleep: 9,
  },
];
// Convert to canonical format for pattern detection
const mockPainEntries: PainEntry[] = mockReportEntries.map(createDemoPainEntry);
const mockInterventions = [
  {
    id: '1',
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'medication' as const,
    name: 'Cyclobenzaprine 10mg',
    dosage: '10mg nightly',
    provider: 'Dr. Smith',
  },
  {
    id: '2',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'therapy' as const,
    name: 'Physical Therapy',
    provider: 'Johnson PT Clinic',
    notes: '2x weekly sessions',
  },
];
const mockPatientInfo = {
  id: '1',
  name: 'Sarah Johnson',
  dateOfBirth: '1985-03-15',
  claimNumber: 'WCB-2024-001234',
  injuryDate: '2024-01-10',
  employerName: 'Tech Solutions Inc',
  occupation: 'Software Developer',
  address: '123 Main St, Vancouver, BC',
  phone: '(604) 555-0123',
  email: 'sarah.j@email.com',
};
const mockMedications = [
  {
    name: 'Naproxen',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    prescriber: 'Dr. Smith',
  },
  {
    name: 'Cyclobenzaprine',
    dosage: '10mg',
    frequency: 'Nightly',
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    prescriber: 'Dr. Smith',
  },
];
const mockClinicalNotes = [
  {
    id: '1',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    provider: 'Dr. Smith',
    type: 'assessment' as const,
    content: 'Initial assessment for work-related lower back injury. Pain rated 8/10.',
    diagnosis: 'Lumbar strain with muscle spasm',
  },
  {
    id: '2',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    provider: 'Dr. Smith',
    type: 'progress' as const,
    content: 'Patient responding well to treatment. Pain reduced to 5/10. Continuing physical therapy.',
  },
];
export const EnhancedPatientView: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  useEffect(() => {
    const analyzePatterns = async () => {
      setIsAnalyzing(true);
      try {
        const detectedPatterns = await PatternDetectionService.detectPatterns(
          mockPainEntries,
          mockInterventions
        );
        setPatterns(detectedPatterns);
      } catch (error) {
        console.error('Pattern detection error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    analyzePatterns();
  }, [patientId]);
  const handleGenerateWorkSafeBCReport = async () => {
    setIsGeneratingReport(true);
    try {
      const { pdf, summary } = await ReportGenerationService.generateWorkSafeBCReport(
        mockPatientInfo,
        mockReportEntries,
        mockClinicalNotes,
        mockMedications,
        'progress'
      );
      pdf.save(`WorkSafeBC-Report-${mockPatientInfo.name}-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('Report summary:', summary);
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const handleGenerateInsuranceReport = async () => {
    setIsGeneratingReport(true);
    try {
      const pdf = await ReportGenerationService.generateInsuranceReport(
        mockPatientInfo,
        mockReportEntries,
        mockClinicalNotes,
        mockMedications
      );
      pdf.save(`Insurance-Report-${mockPatientInfo.name}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const handleExportCSV = () => {
    const csv = ReportGenerationService.exportToCSV(mockReportEntries);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mockPatientInfo.name}-pain-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  const highConfidencePatterns = patterns.filter((p) => p.confidence === 'high');
  const actionablePatterns = patterns.filter((p) => p.actionable);
  return (
    <div className="space-y-6 p-6 bg-background text-foreground min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      {/* Header */}
      <div 
        className="relative rounded-2xl border border-border p-6 overflow-hidden"
        style={{
          boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-purple-500" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clinic')}
              className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30">
                <User className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{mockPatientInfo.name}</h1>
                <p className="text-muted-foreground">
                  Claim #{mockPatientInfo.claimNumber}  {mockPatientInfo.occupation}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-muted transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-foreground font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-violet-500/25"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
              }}
            >
              <Brain className="w-4 h-4" />
              {showPatterns ? 'Hide' : 'Show'} Insights
            </button>
          </div>
        </div>
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-sky-400" />
              <span className="text-sm text-muted-foreground">Data Points</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{mockReportEntries.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Trend</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">Improving</p>
          </div>
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-muted-foreground">AI Patterns</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{highConfidencePatterns.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Action Items</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{actionablePatterns.length}</p>
          </div>
        </div>
      </div>
      {/* AI-Detected Patterns */}
      {showPatterns && (
        <div 
          className="relative rounded-2xl border border-border p-6 overflow-hidden"
          style={{
            boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">AI-Detected Patterns</h2>
            {isAnalyzing && <span className="text-sm text-muted-foreground">Analyzing...</span>}
          </div>
          {patterns.length === 0 ? (
            <p className="text-muted-foreground">No significant patterns detected yet. More data needed.</p>
          ) : (
            <div className="space-y-4">
              {patterns.slice(0, 5).map((pattern) => (
                <div
                  key={pattern.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    pattern.confidence === 'high'
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : pattern.confidence === 'medium'
                        ? 'bg-sky-500/10 border-sky-500'
                        : 'bg-muted border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{pattern.title}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            pattern.confidence === 'high'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : pattern.confidence === 'medium'
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {pattern.confidence} confidence
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                      {pattern.recommendation && (
                        <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-muted border border-border">
                          <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-amber-400">Recommendation:</span> {pattern.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-muted-foreground">Impact</p>
                      <p
                        className={`text-xl font-bold ${
                          pattern.impact > 0
                            ? 'text-emerald-400'
                            : pattern.impact < 0
                              ? 'text-rose-400'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {pattern.impact > 0 ? '+' : ''}
                        {pattern.impact.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{pattern.occurrences} occurrences</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Interactive Timeline */}
      <PatientPainTimeline
        patientId={patientId || '1'}
        patientName={mockPatientInfo.name}
        entries={mockReportEntries}
        interventions={mockInterventions}
      />
      {/* Report Generation */}
      <div 
        className="relative rounded-2xl border border-border p-6 overflow-hidden"
        style={{
          boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/30">
            <FileText className="w-5 h-5 text-sky-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Generate Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleGenerateWorkSafeBCReport}
            disabled={isGeneratingReport}
            className="group p-6 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all text-left disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-2">WorkSafe BC Report</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive medical report with functional assessment and work capacity evaluation
                </p>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-medium text-sky-400 group-hover:text-sky-300">Generate PDF</span>
                </div>
              </div>
            </div>
          </button>
          <button
            onClick={handleGenerateInsuranceReport}
            disabled={isGeneratingReport}
            className="group p-6 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all text-left disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Insurance Claim Report</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed medical documentation for insurance claim processing and review
                </p>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-violet-400 group-hover:text-violet-300">Generate PDF</span>
                </div>
              </div>
            </div>
          </button>
        </div>
        {isGeneratingReport && (
          <div className="mt-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <p className="text-sm text-sky-400">Generating report...</p>
          </div>
        )}
      </div>
    </div>
  );
};