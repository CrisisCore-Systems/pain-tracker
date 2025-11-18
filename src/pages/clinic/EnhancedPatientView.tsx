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
} from 'lucide-react';
import { PatientPainTimeline } from '../../components/clinic/PatientPainTimeline';
import { PatternDetectionService, DetectedPattern } from '../../services/PatternDetectionService';
import { ReportGenerationService } from '../../services/ReportGenerationService';

// Mock data (replace with real API calls)
const mockPainEntries = [
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

  // Run pattern detection on mount
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
        mockPainEntries,
        mockClinicalNotes,
        mockMedications,
        'progress'
      );

      // Download PDF
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
        mockPainEntries,
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
    const csv = ReportGenerationService.exportToCSV(mockPainEntries);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clinic')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{mockPatientInfo.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Claim #{mockPatientInfo.claimNumber} • {mockPatientInfo.occupation}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain className="w-4 h-4" />
              {showPatterns ? 'Hide' : 'Show'} AI Insights
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Data Points</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{mockPainEntries.length}</p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Trend</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">Improving</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">AI Patterns</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{highConfidencePatterns.length}</p>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Action Items</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{actionablePatterns.length}</p>
          </div>
        </div>
      </div>

      {/* AI-Detected Patterns */}
      {showPatterns && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI-Detected Patterns</h2>
            {isAnalyzing && <span className="text-sm text-slate-500">Analyzing...</span>}
          </div>

          {patterns.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">No significant patterns detected yet. More data needed.</p>
          ) : (
            <div className="space-y-4">
              {patterns.slice(0, 5).map((pattern) => (
                <div
                  key={pattern.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    pattern.confidence === 'high'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : pattern.confidence === 'medium'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{pattern.title}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            pattern.confidence === 'high'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : pattern.confidence === 'medium'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {pattern.confidence} confidence
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{pattern.description}</p>
                      {pattern.recommendation && (
                        <div className="flex items-start gap-2 mt-2 p-3 bg-white dark:bg-slate-800 rounded">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            <strong>Recommendation:</strong> {pattern.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Impact</p>
                      <p
                        className={`text-xl font-bold ${
                          pattern.impact > 0
                            ? 'text-green-600'
                            : pattern.impact < 0
                              ? 'text-red-600'
                              : 'text-slate-600'
                        }`}
                      >
                        {pattern.impact > 0 ? '+' : ''}
                        {pattern.impact.toFixed(1)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{pattern.occurrences} occurrences</p>
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
        entries={mockPainEntries}
        interventions={mockInterventions}
      />

      {/* Report Generation */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Generate Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleGenerateWorkSafeBCReport}
            disabled={isGeneratingReport}
            className="p-6 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">WorkSafe BC Report</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Comprehensive medical report with functional assessment and work capacity evaluation
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Generate PDF</span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleGenerateInsuranceReport}
            disabled={isGeneratingReport}
            className="p-6 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border-2 border-purple-200 dark:border-purple-800 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Insurance Claim Report</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Detailed medical documentation for insurance claim processing and review
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Download className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Generate PDF</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {isGeneratingReport && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400">Generating report...</p>
          </div>
        )}
      </div>
    </div>
  );
};
