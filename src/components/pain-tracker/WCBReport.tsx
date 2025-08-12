import { useMemo } from "react";
import type { PainEntry, WCBReport } from "../../types";

interface WCBReportGeneratorProps {
  entries: PainEntry[];
  period: {
    start: string;
    end: string;
  };
}

export function WCBReportGenerator({ entries, period }: WCBReportGeneratorProps) {
  const report = useMemo(() => {
    const filteredEntries = entries.filter(entry => {
      const date = new Date(entry.timestamp);
      return date >= new Date(period.start) && date <= new Date(period.end);
    });

    // Calculate pain trends
    const painLevels = filteredEntries.map(e => e.baselineData.pain);
    const average = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;

    // Track pain locations frequency
    const locationFrequency = filteredEntries.reduce((acc, entry) => {
      entry.baselineData.locations.forEach(location => {
        acc[location] = (acc[location] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Analyze functional limitations
    const limitations = Array.from(new Set(
      filteredEntries.flatMap(e => e.functionalImpact?.limitedActivities || [])
    ));

    // Track changes over time
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const deterioration: string[] = [];
    const improvements: string[] = [];
    let prevPain = sortedEntries[0]?.baselineData.pain;

    sortedEntries.forEach(entry => {
      if (entry.baselineData.pain > prevPain + 2) {
        deterioration.push(`Pain increased significantly on ${new Date(entry.timestamp).toLocaleDateString()}`);
      } else if (entry.baselineData.pain < prevPain - 2) {
        improvements.push(`Pain decreased significantly on ${new Date(entry.timestamp).toLocaleDateString()}`);
      }
      prevPain = entry.baselineData.pain;
    });

    const report: WCBReport = {
      period,
      painTrends: {
        average,
        progression: sortedEntries.map(e => ({
          date: e.timestamp,
          pain: e.baselineData.pain,
          locations: e.baselineData.locations || [],
          symptoms: e.baselineData.symptoms || []
        })),
        locations: locationFrequency
      },
      workImpact: {
        missedDays: 0, // TODO: Calculate from entries
        limitations: [], // TODO: Calculate from entries
        accommodationsNeeded: [] // TODO: Calculate from entries
      },
      functionalAnalysis: {
        limitations,
        deterioration,
        improvements
      },
      treatments: {
        current: [], // TODO: Extract from entries
        effectiveness: '' // TODO: Analyze effectiveness
      },
      recommendations: [
        "Continue monitoring pain levels",
        "Follow up with healthcare provider",
        "Modify work duties as needed"
      ]
    };

    return report;
  }, [entries, period]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">WCB Report</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Period</h3>
          <p>From: {new Date(period.start).toLocaleDateString()}</p>
          <p>To: {new Date(period.end).toLocaleDateString()}</p>
        </div>

        <div>
          <h3 className="font-medium">Pain Trends</h3>
          <p>Average Pain Level: {report.painTrends.average.toFixed(1)}</p>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Common Locations:</h4>
            <ul className="list-disc pl-5">
              {Object.entries(report.painTrends.locations)
                .sort(([,a], [,b]) => b - a)
                .map(([location, count]) => (
                  <li key={location}>{location}: {count} occurrences</li>
                ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-medium">Functional Analysis</h3>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Limitations:</h4>
            <ul className="list-disc pl-5">
              {report.functionalAnalysis.limitations.map(limitation => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-medium">Changes Over Time</h3>
          {report.functionalAnalysis.deterioration.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Deterioration:</h4>
              <ul className="list-disc pl-5">
                {report.functionalAnalysis.deterioration.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {report.functionalAnalysis.improvements.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Improvements:</h4>
              <ul className="list-disc pl-5">
                {report.functionalAnalysis.improvements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium">Recommendations</h3>
          <ul className="list-disc pl-5">
            {report.recommendations.map((recommendation, i) => (
              <li key={i}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
