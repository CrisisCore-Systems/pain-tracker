import { format, subDays, isWithinInterval } from "date-fns";

export const calculatePainTrends = (entries, days = 30) => {
  const recentDate = new Date();
  const startDate = subDays(recentDate, days);

  const recentEntries = entries.filter(entry => 
    isWithinInterval(new Date(entry.timestamp), {
      start: startDate,
      end: recentDate
    })
  );

  if (recentEntries.length === 0) return null;

  const averagePain = recentEntries.reduce((sum, entry) => 
    sum + entry.baselineData.pain, 0) / recentEntries.length;

  const locationFrequency = recentEntries.reduce((acc, entry) => {
    entry.baselineData.locations.forEach(location => {
      acc[location] = (acc[location] || 0) + 1;
    });
    return acc;
  }, {});

  const symptomFrequency = recentEntries.reduce((acc, entry) => {
    entry.baselineData.symptoms.forEach(symptom => {
      acc[symptom] = (acc[symptom] || 0) + 1;
    });
    return acc;
  }, {});

  const activityImpact = recentEntries.reduce((acc, entry) => {
    entry.functionalImpact.limitedActivities.forEach(activity => {
      acc[activity] = (acc[activity] || 0) + 1;
    });
    return acc;
  }, {});

  return {
    averagePain: Number(averagePain.toFixed(1)),
    maxPain: Math.max(...recentEntries.map(e => e.baselineData.pain)),
    minPain: Math.min(...recentEntries.map(e => e.baselineData.pain)),
    mostAffectedLocations: Object.entries(locationFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    commonSymptoms: Object.entries(symptomFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    mostImpactedActivities: Object.entries(activityImpact)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    entryCount: recentEntries.length,
  };
};

export const generateWCBSummary = (entries, baselineYear = 2019) => {
  const currentYear = new Date().getFullYear();
  const yearsSinceBaseline = currentYear - baselineYear;

  const painProgression = Array.from({ length: yearsSinceBaseline + 1 }, (_, i) => {
    const year = baselineYear + i;
    const yearEntries = entries.filter(entry => 
      new Date(entry.timestamp).getFullYear() === year
    );

    return {
      year,
      averagePain: yearEntries.length ? 
        yearEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / yearEntries.length : 
        null,
      newLocations: findNewLocations(yearEntries, entries, year),
      treatmentChanges: analyzeTreatmentChanges(yearEntries),
      workImpact: analyzeWorkImpact(yearEntries),
    };
  });

  return {
    painProgression,
    overallTrend: calculateOverallTrend(painProgression),
    recommendedActions: generateRecommendations(painProgression),
  };
};

function findNewLocations(yearEntries, allEntries, year) {
  if (yearEntries.length === 0) return [];
  
  const previousYearsLocations = new Set(
    allEntries
      .filter(entry => new Date(entry.timestamp).getFullYear() < year)
      .flatMap(entry => entry.baselineData.locations)
  );

  const currentYearLocations = new Set(
    yearEntries.flatMap(entry => entry.baselineData.locations)
  );

  return [...currentYearLocations].filter(location => 
    !previousYearsLocations.has(location)
  );
}

function analyzeTreatmentChanges(entries) {
  const treatments = entries
    .flatMap(entry => entry.treatments.recent)
    .reduce((acc, treatment) => {
      acc[treatment] = (acc[treatment] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(treatments)
    .sort((a, b) => b[1] - a[1])
    .map(([treatment, count]) => ({
      treatment,
      frequency: count,
    }));
}

function analyzeWorkImpact(entries) {
  const workDays = entries
    .reduce((acc, entry) => acc + (entry.workImpact.missedWork || 0), 0);

  const limitations = entries
    .flatMap(entry => entry.workImpact.workLimitations)
    .reduce((acc, limitation) => {
      acc[limitation] = (acc[limitation] || 0) + 1;
      return acc;
    }, {});

  return {
    missedDays: workDays,
    commonLimitations: Object.entries(limitations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };
}

function calculateOverallTrend(progression) {
  const validPoints = progression.filter(p => p.averagePain !== null);
  if (validPoints.length < 2) return "Insufficient data";

  const firstPoint = validPoints[0].averagePain;
  const lastPoint = validPoints[validPoints.length - 1].averagePain;
  const difference = lastPoint - firstPoint;

  if (difference > 2) return "Significant deterioration";
  if (difference > 1) return "Moderate deterioration";
  if (difference > 0) return "Slight deterioration";
  if (difference === 0) return "Stable";
  return "Improved";
}

function generateRecommendations(progression) {
  const latest = progression[progression.length - 1];
  const recommendations = [];

  if (latest.averagePain > 7) {
    recommendations.push("Immediate medical reassessment recommended");
  }

  if (latest.newLocations.length > 0) {
    recommendations.push("Document new pain locations with medical professional");
  }

  if (latest.workImpact.missedDays > 10) {
    recommendations.push("Consider work capacity evaluation");
  }

  return recommendations;
}
