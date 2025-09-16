/**
 * Health Insights Web Worker
 * Background processing for health pattern analysis and insights generation
 */

import type { PainEntry } from '../types';

// Worker types
interface HealthInsightTask {
  id: string;
  type: 'pattern-analysis' | 'trend-detection' | 'correlation-analysis' | 'anomaly-detection' | 'prediction' | 'summary-generation';
  data: {
    entries: PainEntry[];
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
    context?: {
      userPreferences?: Record<string, unknown>;
      previousInsights?: HealthInsight[];
      currentDate?: string;
    };
  };
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

interface HealthInsight {
  id: string;
  type: 'pattern' | 'trend' | 'correlation' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: {
    values?: number[];
    labels?: string[];
    correlations?: Array<{
      factor1: string;
      factor2: string;
      strength: number;
      significance: number;
    }>;
    predictions?: Array<{
      date: string;
      value: number;
      confidence: number;
    }>;
    recommendations?: Array<{
      action: string;
      rationale: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  };
  generatedAt: string;
  validUntil?: string;
  traumaInformed: boolean;
  actionable: boolean;
  metadata: {
    basedOnEntries: number;
    timeframeDays: number;
    algorithm: string;
    version: string;
  };
}

interface WorkerMessage {
  type: 'task' | 'result' | 'error' | 'progress';
  taskId?: string;
  data?: unknown;
  error?: string;
  progress?: number;
}

// Main analysis functions
function analyzePatterns(entries: PainEntry[]): HealthInsight[] {
  const insights: HealthInsight[] = [];
  
  if (entries.length < 7) {
    return insights; // Need at least a week of data
  }

  // Daily pattern analysis
  const dailyPatterns = analyzeDailyPatterns(entries);
  if (dailyPatterns) {
    insights.push(dailyPatterns);
  }

  // Weekly pattern analysis
  const weeklyPatterns = analyzeWeeklyPatterns(entries);
  if (weeklyPatterns) {
    insights.push(weeklyPatterns);
  }

  // Activity correlation analysis
  const activityCorrelations = analyzeActivityCorrelations(entries);
  insights.push(...activityCorrelations);

  // Sleep quality correlations
  const sleepCorrelations = analyzeSleepCorrelations(entries);
  if (sleepCorrelations) {
    insights.push(sleepCorrelations);
  }

  // Medication effectiveness analysis
  const medicationInsights = analyzeMedicationEffectiveness(entries);
  insights.push(...medicationInsights);

  return insights;
}

function analyzeDailyPatterns(entries: PainEntry[]): HealthInsight | null {
  // Group entries by hour of day
  const hourlyPain: { [hour: number]: number[] } = {};
  
  entries.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    if (!hourlyPain[hour]) {
      hourlyPain[hour] = [];
    }
    hourlyPain[hour].push(entry.baselineData.pain);
  });

  // Calculate average pain by hour
  const hourlyAverages: { hour: number; avgPain: number }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    if (hourlyPain[hour] && hourlyPain[hour].length > 0) {
      const avg = hourlyPain[hour].reduce((sum, pain) => sum + pain, 0) / hourlyPain[hour].length;
      hourlyAverages.push({ hour, avgPain: avg });
    }
  }

  if (hourlyAverages.length < 6) {
    return null; // Not enough data points
  }

  // Find peak pain times
  const sortedByPain = [...hourlyAverages].sort((a, b) => b.avgPain - a.avgPain);
  const peakHours = sortedByPain.slice(0, 3);
  const lowHours = sortedByPain.slice(-3);

  // Determine if there's a clear daily pattern
  const painRange = Math.max(...hourlyAverages.map(h => h.avgPain)) - 
                   Math.min(...hourlyAverages.map(h => h.avgPain));

  if (painRange < 1.5) {
    return null; // Pattern not significant enough
  }

  // Generate description
  const peakTimeDescription = formatTimeRange(peakHours.map(h => h.hour));
  const lowTimeDescription = formatTimeRange(lowHours.map(h => h.hour));

  return {
    id: `daily-pattern-${Date.now()}`,
    type: 'pattern',
    title: 'Daily Pain Pattern Detected',
    description: `Your pain tends to be highest ${peakTimeDescription} and lowest ${lowTimeDescription}. This pattern has been consistent across your recent entries.`,
    confidence: Math.min(95, 60 + painRange * 10),
    severity: painRange > 3 ? 'high' : painRange > 2 ? 'medium' : 'low',
    data: {
      values: hourlyAverages.map(h => h.avgPain),
      labels: hourlyAverages.map(h => `${h.hour}:00`),
      recommendations: [
        {
          action: `Plan lighter activities during peak pain times (${peakTimeDescription})`,
          rationale: 'Reducing activity load during high-pain periods can help prevent flares',
          priority: 'medium'
        },
        {
          action: `Schedule important tasks during low-pain times (${lowTimeDescription})`,
          rationale: 'Taking advantage of better periods can improve overall functioning',
          priority: 'high'
        }
      ]
    },
    generatedAt: new Date().toISOString(),
    traumaInformed: true,
    actionable: true,
    metadata: {
      basedOnEntries: entries.length,
      timeframeDays: Math.ceil((new Date().getTime() - new Date(entries[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)),
      algorithm: 'hourly-aggregation-v1',
      version: '1.0'
    }
  };
}

function analyzeWeeklyPatterns(entries: PainEntry[]): HealthInsight | null {
  // Group entries by day of week
  const weeklyPain: { [day: number]: number[] } = {};
  
  entries.forEach(entry => {
    const day = new Date(entry.timestamp).getDay(); // 0 = Sunday, 6 = Saturday
    if (!weeklyPain[day]) {
      weeklyPain[day] = [];
    }
    weeklyPain[day].push(entry.baselineData.pain);
  });

  // Calculate average pain by day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyAverages: { day: string; dayNum: number; avgPain: number }[] = [];
  
  for (let day = 0; day < 7; day++) {
    if (weeklyPain[day] && weeklyPain[day].length > 0) {
      const avg = weeklyPain[day].reduce((sum, pain) => sum + pain, 0) / weeklyPain[day].length;
      weeklyAverages.push({ day: dayNames[day], dayNum: day, avgPain: avg });
    }
  }

  if (weeklyAverages.length < 5) {
    return null; // Need data for most days of the week
  }

  // Find patterns
  const sortedByPain = [...weeklyAverages].sort((a, b) => b.avgPain - a.avgPain);
  const worstDays = sortedByPain.slice(0, 2);
  const bestDays = sortedByPain.slice(-2);

  const painRange = Math.max(...weeklyAverages.map(d => d.avgPain)) - 
                   Math.min(...weeklyAverages.map(d => d.avgPain));

  if (painRange < 1) {
    return null; // Not significant enough
  }

  // Check for weekend vs weekday pattern
  const weekdayPain = weeklyAverages.filter(d => d.dayNum >= 1 && d.dayNum <= 5);
  const weekendPain = weeklyAverages.filter(d => d.dayNum === 0 || d.dayNum === 6);
  
  let weekendPattern = '';
  if (weekdayPain.length > 0 && weekendPain.length > 0) {
    const weekdayAvg = weekdayPain.reduce((sum, d) => sum + d.avgPain, 0) / weekdayPain.length;
    const weekendAvg = weekendPain.reduce((sum, d) => sum + d.avgPain, 0) / weekendPain.length;
    
    if (Math.abs(weekdayAvg - weekendAvg) > 0.8) {
      weekendPattern = weekendAvg > weekdayAvg 
        ? ' Your pain tends to be higher on weekends.'
        : ' Your pain tends to be lower on weekends.';
    }
  }

  return {
    id: `weekly-pattern-${Date.now()}`,
    type: 'pattern',
    title: 'Weekly Pain Pattern Identified',
    description: `Your pain is typically highest on ${worstDays.map(d => d.day).join(' and ')} and lowest on ${bestDays.map(d => d.day).join(' and ')}.${weekendPattern}`,
    confidence: Math.min(90, 50 + painRange * 15),
    severity: painRange > 2.5 ? 'high' : painRange > 1.5 ? 'medium' : 'low',
    data: {
      values: weeklyAverages.map(d => d.avgPain),
      labels: weeklyAverages.map(d => d.day),
      recommendations: [
        {
          action: `Plan rest activities for ${worstDays.map(d => d.day).join(' and ')}`,
          rationale: 'Reducing demands on high-pain days can help manage symptoms',
          priority: 'high'
        },
        {
          action: `Take advantage of better days (${bestDays.map(d => d.day).join(' and ')}) for important activities`,
          rationale: 'Maximizing productivity during low-pain periods improves overall quality of life',
          priority: 'medium'
        }
      ]
    },
    generatedAt: new Date().toISOString(),
    traumaInformed: true,
    actionable: true,
    metadata: {
      basedOnEntries: entries.length,
      timeframeDays: Math.ceil((new Date().getTime() - new Date(entries[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)),
      algorithm: 'weekly-aggregation-v1',
      version: '1.0'
    }
  };
}

function analyzeActivityCorrelations(entries: PainEntry[]): HealthInsight[] {
  const insights: HealthInsight[] = [];
  
  // Extract activities and their pain correlations
  const activityPainMap: { [activity: string]: number[] } = {};
  
  entries.forEach(entry => {
    if (entry.functionalImpact?.limitedActivities) {
      entry.functionalImpact.limitedActivities.forEach(activity => {
        if (!activityPainMap[activity]) {
          activityPainMap[activity] = [];
        }
        activityPainMap[activity].push(entry.baselineData.pain);
      });
    }
  });

  // Analyze correlations for activities with enough data
  Object.entries(activityPainMap).forEach(([activity, painLevels]) => {
    if (painLevels.length >= 3) {
      const avgPain = painLevels.reduce((sum, pain) => sum + pain, 0) / painLevels.length;
      const overallAvg = entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length;
      
      const correlation = avgPain - overallAvg;
      
      if (Math.abs(correlation) > 0.8) {
        insights.push({
          id: `activity-correlation-${activity}-${Date.now()}`,
          type: 'correlation',
          title: `Activity Impact: ${activity}`,
          description: correlation > 0 
            ? `${activity} appears to be associated with higher pain levels (average: ${avgPain.toFixed(1)} vs overall average: ${overallAvg.toFixed(1)}).`
            : `${activity} appears to be associated with lower pain levels (average: ${avgPain.toFixed(1)} vs overall average: ${overallAvg.toFixed(1)}).`,
          confidence: Math.min(85, 40 + Math.abs(correlation) * 20),
          severity: correlation > 1.5 ? 'high' : correlation > 0.8 ? 'medium' : 'low',
          data: {
            correlations: [{
              factor1: activity,
              factor2: 'pain-level',
              strength: correlation,
              significance: painLevels.length / entries.length
            }],
            recommendations: correlation > 0 ? [
              {
                action: `Consider modifying or limiting ${activity}`,
                rationale: 'This activity seems to be associated with increased pain',
                priority: correlation > 1.5 ? 'high' : 'medium'
              },
              {
                action: `Discuss ${activity} with your healthcare provider`,
                rationale: 'They may have suggestions for safer ways to perform this activity',
                priority: 'medium'
              }
            ] : [
              {
                action: `Consider incorporating more ${activity} when possible`,
                rationale: 'This activity seems to be associated with lower pain levels',
                priority: 'medium'
              }
            ]
          },
          generatedAt: new Date().toISOString(),
          traumaInformed: true,
          actionable: true,
          metadata: {
            basedOnEntries: painLevels.length,
            timeframeDays: Math.ceil((new Date().getTime() - new Date(entries[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)),
            algorithm: 'simple-correlation-v1',
            version: '1.0'
          }
        });
      }
    }
  });

  return insights;
}

function analyzeSleepCorrelations(entries: PainEntry[]): HealthInsight | null {
  const sleepPainPairs: Array<{ sleep: number; pain: number }> = [];
  
  entries.forEach(entry => {
    if (entry.qualityOfLife?.sleepQuality !== undefined) {
      sleepPainPairs.push({
        sleep: entry.qualityOfLife.sleepQuality,
        pain: entry.baselineData.pain
      });
    }
  });

  if (sleepPainPairs.length < 5) {
    return null; // Need more data
  }

  // Calculate correlation coefficient
  const correlation = calculatePearsonCorrelation(
    sleepPainPairs.map(p => p.sleep),
    sleepPainPairs.map(p => p.pain)
  );

  if (Math.abs(correlation) < 0.3) {
    return null; // Not significant enough
  }

  // Calculate averages for additional insights
  const avgSleep = sleepPainPairs.reduce((sum, p) => sum + p.sleep, 0) / sleepPainPairs.length;
  const avgPain = sleepPainPairs.reduce((sum, p) => sum + p.pain, 0) / sleepPainPairs.length;

  return {
    id: `sleep-correlation-${Date.now()}`,
    type: 'correlation',
    title: 'Sleep Quality and Pain Connection',
    description: correlation < -0.3 
      ? `Better sleep quality appears to be associated with lower pain levels. Your data shows a ${Math.abs(correlation * 100).toFixed(0)}% correlation. Average sleep: ${avgSleep.toFixed(1)}h, Average pain: ${avgPain.toFixed(1)}/10.`
      : `Poor sleep quality appears to be associated with higher pain levels. Your data shows a ${Math.abs(correlation * 100).toFixed(0)}% correlation. Average sleep: ${avgSleep.toFixed(1)}h, Average pain: ${avgPain.toFixed(1)}/10.`,
    confidence: Math.min(90, 30 + Math.abs(correlation) * 60),
    severity: Math.abs(correlation) > 0.6 ? 'high' : Math.abs(correlation) > 0.4 ? 'medium' : 'low',
    data: {
      correlations: [{
        factor1: 'sleep-quality',
        factor2: 'pain-level',
        strength: correlation,
        significance: sleepPainPairs.length / entries.length
      }],
      recommendations: correlation < -0.3 ? [
        {
          action: 'Prioritize sleep hygiene practices',
          rationale: 'Better sleep appears to help reduce your pain levels',
          priority: 'high'
        },
        {
          action: 'Consider establishing a consistent bedtime routine',
          rationale: 'Regular sleep patterns may help improve both sleep quality and pain management',
          priority: 'medium'
        }
      ] : [
        {
          action: 'Focus on pain management to improve sleep',
          rationale: 'Managing pain levels may help improve your sleep quality',
          priority: 'high'
        },
        {
          action: 'Discuss sleep issues with your healthcare provider',
          rationale: 'They may recommend specific treatments for pain-related sleep problems',
          priority: 'medium'
        }
      ]
    },
    generatedAt: new Date().toISOString(),
    traumaInformed: true,
    actionable: true,
    metadata: {
      basedOnEntries: sleepPainPairs.length,
      timeframeDays: Math.ceil((new Date().getTime() - new Date(entries[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)),
      algorithm: 'pearson-correlation-v1',
      version: '1.0'
    }
  };
}

function analyzeMedicationEffectiveness(entries: PainEntry[]): HealthInsight[] {
  const insights: HealthInsight[] = [];
  
  // Track medication usage and pain levels
  const medicationPainMap: { [medication: string]: number[] } = {};
  
  entries.forEach(entry => {
    if (entry.medications?.current && entry.medications.current.length > 0) {
      entry.medications.current.forEach(med => {
        const medName = typeof med === 'string' ? med : med.name;
        if (!medicationPainMap[medName]) {
          medicationPainMap[medName] = [];
        }
        medicationPainMap[medName].push(entry.baselineData.pain);
      });
    }
  });

  const overallAvgPain = entries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / entries.length;

  Object.entries(medicationPainMap).forEach(([medication, painLevels]) => {
    if (painLevels.length >= 3) {
      const avgPainWithMed = painLevels.reduce((sum, pain) => sum + pain, 0) / painLevels.length;
      const effectiveness = overallAvgPain - avgPainWithMed;
      
      if (Math.abs(effectiveness) > 0.5) {
        insights.push({
          id: `medication-effectiveness-${medication}-${Date.now()}`,
          type: 'correlation',
          title: `Medication Analysis: ${medication}`,
          description: effectiveness > 0 
            ? `${medication} appears to be associated with lower pain levels (average pain: ${avgPainWithMed.toFixed(1)} vs ${overallAvgPain.toFixed(1)} overall).`
            : `${medication} usage periods show higher pain levels (average pain: ${avgPainWithMed.toFixed(1)} vs ${overallAvgPain.toFixed(1)} overall). This might indicate you take it during flares.`,
          confidence: Math.min(80, 30 + Math.abs(effectiveness) * 20),
          severity: Math.abs(effectiveness) > 1.5 ? 'high' : Math.abs(effectiveness) > 0.8 ? 'medium' : 'low',
          data: {
            correlations: [{
              factor1: medication,
              factor2: 'pain-level',
              strength: -effectiveness, // Negative because lower pain is better
              significance: painLevels.length / entries.length
            }],
            recommendations: effectiveness > 0 ? [
              {
                action: `Continue monitoring ${medication} effectiveness`,
                rationale: 'This medication appears to be helping with pain management',
                priority: 'medium'
              }
            ] : [
              {
                action: `Discuss ${medication} timing and effectiveness with your doctor`,
                rationale: 'Review whether this medication is optimally managing your pain',
                priority: 'medium'
              }
            ]
          },
          generatedAt: new Date().toISOString(),
          traumaInformed: true,
          actionable: true,
          metadata: {
            basedOnEntries: painLevels.length,
            timeframeDays: Math.ceil((new Date().getTime() - new Date(entries[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)),
            algorithm: 'medication-correlation-v1',
            version: '1.0'
          }
        });
      }
    }
  });

  return insights;
}

// Utility functions
function formatTimeRange(hours: number[]): string {
  const sortedHours = hours.sort((a, b) => a - b);
  
  if (sortedHours.length === 1) {
    return formatHour(sortedHours[0]);
  }
  
  if (sortedHours.length === 2) {
    return `${formatHour(sortedHours[0])} and ${formatHour(sortedHours[1])}`;
  }
  
  // Check for consecutive hours
  const isConsecutive = sortedHours.every((hour, index) => 
    index === 0 || hour === sortedHours[index - 1] + 1
  );
  
  if (isConsecutive) {
    return `between ${formatHour(sortedHours[0])} and ${formatHour(sortedHours[sortedHours.length - 1])}`;
  }
  
  return `around ${formatHour(sortedHours[0])}, ${formatHour(sortedHours[1])}, and ${formatHour(sortedHours[2])}`;
}

function formatHour(hour: number): string {
  if (hour === 0) return 'midnight';
  if (hour === 12) return 'noon';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

// Web Worker message handling
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, taskId, data } = e.data;
  
  if (type === 'task' && taskId && data) {
    const task = data as HealthInsightTask;
    
    try {
      let insights: HealthInsight[] = [];
      
      // Post progress update
      self.postMessage({
        type: 'progress',
        taskId,
        progress: 25
      });
      
      switch (task.type) {
        case 'pattern-analysis':
          insights = analyzePatterns(task.data.entries);
          break;
        case 'trend-detection':
          // TODO: Implement trend detection
          break;
        case 'correlation-analysis':
          // TODO: Implement comprehensive correlation analysis
          break;
        case 'anomaly-detection':
          // TODO: Implement anomaly detection
          break;
        case 'prediction':
          // TODO: Implement predictive analysis
          break;
        case 'summary-generation':
          // TODO: Implement summary generation
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      // Post completion
      self.postMessage({
        type: 'result',
        taskId,
        data: insights
      });
      
    } catch (error) {
      self.postMessage({
        type: 'error',
        taskId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// Export types for TypeScript compilation
export type { HealthInsightTask, HealthInsight, WorkerMessage };
