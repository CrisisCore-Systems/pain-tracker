import { useMemo } from "react";
import { formatNumber } from "../../utils/formatting";
import type { PainEntry } from "../../types";
import type { WCBReport } from "../../types/index";
import { analyzeTreatmentChanges, analyzeWorkImpact } from "../../utils/wcbAnalytics";
import { toast } from "sonner";

interface WCBReportGeneratorProps {
  entries: PainEntry[];
  period: {
    start: string;
    end: string;
  };
}

const BASE_RECOMMENDATIONS = [
  "Continue monitoring pain levels",
  "Follow up with healthcare provider",
  "Modify work duties as needed"
];

const createEmptyReport = (period: WCBReport["period"]): WCBReport => ({
  period,
  painTrends: {
    average: 0,
    progression: [],
    locations: {}
  },
  workImpact: {
    missedDays: 0,
    limitations: [],
    accommodationsNeeded: []
  },
  functionalAnalysis: {
    limitations: [],
    deterioration: [],
    improvements: []
  },
  treatments: {
    current: [],
    effectiveness: "No treatment data recorded."
  },
  recommendations: [
    "No entries available for the selected period. Maintain regular logging to build a comprehensive record."
  ]
});

export function WCBReportGenerator({ entries, period }: WCBReportGeneratorProps) {
  const report = useMemo((): WCBReport => {
    const periodStart = new Date(period.start);
    const periodEnd = new Date(period.end);

    if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
      return createEmptyReport(period);
    }

    const filteredEntries = entries.filter(entry => {
      const timestamp = new Date(entry.timestamp);
      if (Number.isNaN(timestamp.getTime())) {
        return false;
      }

      return timestamp >= periodStart && timestamp <= periodEnd;
    });

    if (filteredEntries.length === 0) {
      return createEmptyReport(period);
    }

    const sortedEntries = [...filteredEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const painLevels = sortedEntries.map(entry => entry.baselineData.pain);
    const painSum = painLevels.reduce((total, level) => total + level, 0);
    const averagePain = painLevels.length > 0 ? painSum / painLevels.length : 0;

    const locationFrequency = sortedEntries.reduce((acc, entry) => {
      entry.baselineData.locations?.forEach(location => {
        const normalized = location.trim() || "Unspecified";
        acc[normalized] = (acc[normalized] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const limitationSources = [
      filteredEntries.flatMap(entry => entry.functionalImpact?.limitedActivities ?? []),
      filteredEntries.flatMap(entry => entry.workImpact?.workLimitations ?? []),
      filteredEntries.flatMap(entry => entry.comparison?.newLimitations ?? [])
    ];

    const limitations = Array.from(new Set(limitationSources.flat())).sort();

    const deterioration: string[] = [];
    const improvements: string[] = [];

    sortedEntries.forEach((entry, index) => {
      if (index === 0) {
        return;
      }

      const previousPain = sortedEntries[index - 1].baselineData.pain;
      const currentPain = entry.baselineData.pain;
      const painDelta = currentPain - previousPain;
      const formattedDate = new Date(entry.timestamp).toLocaleDateString();

      if (painDelta >= 2) {
        deterioration.push(`Pain increased significantly on ${formattedDate}`);
      } else if (painDelta <= -2) {
        improvements.push(`Pain decreased significantly on ${formattedDate}`);
      }
    });

    const { missedDays, commonLimitations } = analyzeWorkImpact(filteredEntries);

    const accommodationsNeeded = Array.from(
      new Set(filteredEntries.flatMap(entry => entry.workImpact?.modifiedDuties ?? []))
    ).sort();

    const currentTreatments = analyzeTreatmentChanges(filteredEntries).slice(0, 5);

    const treatmentEffectivenessFeedback = filteredEntries
      .flatMap(entry => [
        entry.treatments?.effectiveness ?? "",
        ...((entry.treatments?.recent ?? []).map(treatment => treatment.effectiveness ?? ""))
      ])
      .map(effectiveness => effectiveness.trim())
      .filter(Boolean);

    let effectivenessSummary = "No treatment data recorded.";

    if (treatmentEffectivenessFeedback.length > 0) {
      const effectivenessCounts = treatmentEffectivenessFeedback.reduce(
        (acc, feedback) => {
          acc.set(feedback, (acc.get(feedback) ?? 0) + 1);
          return acc;
        },
        new Map<string, number>()
      );

      const rankedEffectiveness = Array.from(effectivenessCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      );

      const [primaryLabel, primaryCount] = rankedEffectiveness[0];
      const totalFeedback = treatmentEffectivenessFeedback.length;
      const primaryShare = Math.round((primaryCount / totalFeedback) * 100);

      const secondaryInsights = rankedEffectiveness
        .slice(1)
        .map(([label, count]) => `${label} (${count})`);

      effectivenessSummary = `${primaryLabel} (${primaryShare}% of ${totalFeedback} reports)`;

      if (secondaryInsights.length > 0) {
        effectivenessSummary += `; other feedback: ${secondaryInsights.join(", ")}`;
      }
    }

    const recommendations = [...BASE_RECOMMENDATIONS];

    if (averagePain >= 7) {
      recommendations.unshift("Elevated pain levels detected; consider clinical reassessment.");
    }

    if (missedDays > 0) {
      recommendations.push("Document missed work days for employer or insurer discussions.");
    }

    if (accommodationsNeeded.length > 0) {
      recommendations.push("Review workplace accommodations to ensure ongoing suitability.");
    }

    return {
      period,
      painTrends: {
        average: Number.isFinite(averagePain) ? averagePain : 0,
        progression: sortedEntries.map(entry => ({
          date: entry.timestamp,
          pain: entry.baselineData.pain,
          locations: entry.baselineData.locations ?? [],
          symptoms: entry.baselineData.symptoms ?? []
        })),
        locations: locationFrequency
      },
      workImpact: {
        missedDays,
        limitations: commonLimitations,
        accommodationsNeeded
      },
      functionalAnalysis: {
        limitations,
        deterioration,
        improvements
      },
      treatments: {
        current: currentTreatments,
        effectiveness: effectivenessSummary
      },
      recommendations
    };
  }, [entries, period]);

  const handleExportPDF = async () => {
    try {
      toast.loading("Generating PDF report...");
      // Lazy load PDF service to defer jsPDF bundle loading (Phase 3 optimization)
      const { pdfExportService } = await import("../../services/PDFExportService");
      await pdfExportService.downloadWCBReport(report);
      toast.dismiss();
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("PDF export failed:", error);
      toast.error("Failed to generate PDF report. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">WCB Report</h2>
        <button
          onClick={handleExportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          disabled={report.recommendations.includes("No entries available for the selected period")}
        >
          Export PDF
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Period</h3>
          <p>From: {new Date(period.start).toLocaleDateString()}</p>
          <p>To: {new Date(period.end).toLocaleDateString()}</p>
        </div>

        <div>
          <h3 className="font-medium">Pain Trends</h3>
          {report.painTrends ? (
            <>
              <p>Average Pain Level: {formatNumber(report.painTrends.average, 1)}</p>
              <div className="mt-2">
                <h4 className="text-sm font-medium">Common Locations:</h4>
                {Object.keys(report.painTrends.locations).length === 0 ? (
                  <p className="text-sm text-gray-500">No pain location data recorded.</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {Object.entries(report.painTrends.locations)
                      .sort(([, a], [, b]) => b - a)
                      .map(([location, count]) => (
                        <li key={location}>{location}: {count} occurrences</li>
                      ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No pain trend data available.</p>
          )}
        </div>

        <div>
          <h3 className="font-medium">Work Impact</h3>
          <p>Missed Days: {report.workImpact.missedDays}</p>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Common Limitations:</h4>
            {report.workImpact.limitations.length === 0 ? (
              <p className="text-sm text-gray-500">No work limitations reported.</p>
            ) : (
              <ul className="list-disc pl-5">
                {report.workImpact.limitations.map(([limitation, frequency]) => (
                  <li key={limitation}>{limitation}: {frequency} occurrences</li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Accommodations Needed:</h4>
            {report.workImpact.accommodationsNeeded.length === 0 ? (
              <p className="text-sm text-gray-500">No accommodations documented.</p>
            ) : (
              <ul className="list-disc pl-5">
                {report.workImpact.accommodationsNeeded.map(accommodation => (
                  <li key={accommodation}>{accommodation}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium">Functional Analysis</h3>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Limitations:</h4>
            {report.functionalAnalysis.limitations.length === 0 ? (
              <p className="text-sm text-gray-500">No functional limitations reported.</p>
            ) : (
              <ul className="list-disc pl-5">
                {report.functionalAnalysis.limitations.map(limitation => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium">Changes Over Time</h3>
          {report.functionalAnalysis.deterioration.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Deterioration:</h4>
              <ul className="list-disc pl-5">
                {report.functionalAnalysis.deterioration.map((item, index) => (
                  <li key={item + index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {report.functionalAnalysis.improvements.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Improvements:</h4>
              <ul className="list-disc pl-5">
                {report.functionalAnalysis.improvements.map((item, index) => (
                  <li key={item + index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {report.functionalAnalysis.deterioration.length === 0 &&
            report.functionalAnalysis.improvements.length === 0 && (
              <p className="text-sm text-gray-500">No significant pain changes detected.</p>
            )}
        </div>

        <div>
          <h3 className="font-medium">Treatments</h3>
          {report.treatments.current.length === 0 ? (
            <p className="text-sm text-gray-500">No active treatments recorded.</p>
          ) : (
            <ul className="list-disc pl-5">
              {report.treatments.current.map(treatment => (
                <li key={treatment.treatment}>
                  {treatment.treatment}: {treatment.frequency} entries
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm text-gray-700">{report.treatments.effectiveness}</p>
        </div>

        <div>
          <h3 className="font-medium">Recommendations</h3>
          <ul className="list-disc pl-5">
            {report.recommendations.map(recommendation => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
