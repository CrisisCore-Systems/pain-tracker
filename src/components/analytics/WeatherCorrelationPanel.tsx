/**
 * Weather Correlation Analytics Component
 * 
 * Displays weather-pain correlation insights including:
 * - Temperature correlation
 * - Rain/precipitation impact
 * - Barometric pressure correlation
 * - Humidity correlation
 */

import React, { useMemo } from 'react';
import { Cloud, CloudRain, Thermometer, Droplets, Wind, Sun, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../design-system';
import { cn } from '../../design-system/utils';
import type { PainEntry } from '../../types';

interface WeatherCorrelationProps {
  entries: PainEntry[];
  className?: string;
}

interface WeatherStats {
  condition: string;
  count: number;
  avgPain: number;
  icon: React.ReactNode;
}

interface CorrelationResult {
  factor: string;
  correlation: 'positive' | 'negative' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  avgPainWith: number;
  avgPainWithout: number;
  sampleSize: number;
  insight: string;
  icon: React.ReactNode;
}

// Parse weather string to extract components
function parseWeatherString(weather: string): {
  temp?: number;
  condition?: string;
  humidity?: number;
  isRaining: boolean;
} {
  const result: ReturnType<typeof parseWeatherString> = { isRaining: false };
  
  // Extract temperature (e.g., "18°C" or "18°")
  const tempMatch = weather.match(/(-?\d+)°/);
  if (tempMatch) {
    result.temp = parseInt(tempMatch[1], 10);
  }
  
  // Extract humidity (e.g., "65% humidity")
  const humidityMatch = weather.match(/(\d+)%\s*humidity/i);
  if (humidityMatch) {
    result.humidity = parseInt(humidityMatch[1], 10);
  }
  
  // Detect rain conditions
  const rainKeywords = ['rain', 'drizzle', 'shower', 'thunderstorm', '🌧️'];
  result.isRaining = rainKeywords.some(kw => weather.toLowerCase().includes(kw));
  
  // Extract condition (after temp, before humidity)
  const conditionMatch = weather.match(/°C?,?\s*([a-z\s]+?)(?:,|\d|$)/i);
  if (conditionMatch) {
    result.condition = conditionMatch[1].trim();
  }
  
  return result;
}

// Calculate correlation strength
function getCorrelationStrength(diff: number): 'strong' | 'moderate' | 'weak' | 'none' {
  const absDiff = Math.abs(diff);
  if (absDiff >= 2) return 'strong';
  if (absDiff >= 1) return 'moderate';
  if (absDiff >= 0.5) return 'weak';
  return 'none';
}

export function WeatherCorrelationPanel({ entries, className }: WeatherCorrelationProps) {
  const analysis = useMemo(() => {
    // Filter entries with weather data
    const weatherEntries = entries.filter(e => e.weather && e.weather.trim() !== '');
    
    if (weatherEntries.length < 3) {
      return null;
    }
    
    // Parse all weather data
    const parsed = weatherEntries.map(e => ({
      ...parseWeatherString(e.weather!),
      pain: e.baselineData.pain,
      weather: e.weather!,
    }));
    
    // Overall stats
    const totalAvgPain = entries.reduce((sum, e) => sum + e.baselineData.pain, 0) / entries.length;
    
    // Temperature correlation
    const tempEntries = parsed.filter(p => p.temp !== undefined);
    const coldEntries = tempEntries.filter(p => p.temp! < 10);
    const warmEntries = tempEntries.filter(p => p.temp! >= 10 && p.temp! < 25);
    const hotEntries = tempEntries.filter(p => p.temp! >= 25);
    
    // Rain correlation
    const rainyEntries = parsed.filter(p => p.isRaining);
    const dryEntries = parsed.filter(p => !p.isRaining);
    
    // Humidity correlation
    const humidEntries = parsed.filter(p => p.humidity !== undefined && p.humidity >= 70);
    const normalHumidityEntries = parsed.filter(p => p.humidity !== undefined && p.humidity < 70);
    
    // Calculate averages
    const calcAvg = (arr: { pain: number }[]) => 
      arr.length > 0 ? arr.reduce((s, e) => s + e.pain, 0) / arr.length : 0;
    
    // Suppress unused variable warning - hotEntries reserved for future hot weather correlation
    void totalAvgPain;
    void hotEntries;
    
    const correlations: CorrelationResult[] = [];
    
    // Temperature correlation
    if (coldEntries.length >= 2 && warmEntries.length >= 2) {
      const coldAvg = calcAvg(coldEntries);
      const warmAvg = calcAvg(warmEntries);
      const diff = coldAvg - warmAvg;
      
      correlations.push({
        factor: 'Cold Weather',
        correlation: diff > 0.3 ? 'positive' : diff < -0.3 ? 'negative' : 'neutral',
        strength: getCorrelationStrength(diff),
        avgPainWith: coldAvg,
        avgPainWithout: warmAvg,
        sampleSize: coldEntries.length + warmEntries.length,
        insight: diff > 0.5 
          ? `Cold weather increases your pain by ${diff.toFixed(1)} points on average`
          : diff < -0.5
            ? `You experience less pain in cold weather`
            : `Temperature has minimal impact on your pain`,
        icon: <Thermometer className="h-5 w-5 text-blue-500" />,
      });
    }
    
    // Rain correlation
    if (rainyEntries.length >= 2 && dryEntries.length >= 2) {
      const rainyAvg = calcAvg(rainyEntries);
      const dryAvg = calcAvg(dryEntries);
      const diff = rainyAvg - dryAvg;
      
      correlations.push({
        factor: 'Rain/Precipitation',
        correlation: diff > 0.3 ? 'positive' : diff < -0.3 ? 'negative' : 'neutral',
        strength: getCorrelationStrength(diff),
        avgPainWith: rainyAvg,
        avgPainWithout: dryAvg,
        sampleSize: rainyEntries.length + dryEntries.length,
        insight: diff > 0.5 
          ? `Rainy weather increases your pain by ${diff.toFixed(1)} points`
          : diff < -0.5
            ? `You experience less pain during rainy weather`
            : `Rain has minimal impact on your pain levels`,
        icon: <CloudRain className="h-5 w-5 text-blue-600" />,
      });
    }
    
    // Humidity correlation
    if (humidEntries.length >= 2 && normalHumidityEntries.length >= 2) {
      const humidAvg = calcAvg(humidEntries);
      const normalAvg = calcAvg(normalHumidityEntries);
      const diff = humidAvg - normalAvg;
      
      correlations.push({
        factor: 'High Humidity',
        correlation: diff > 0.3 ? 'positive' : diff < -0.3 ? 'negative' : 'neutral',
        strength: getCorrelationStrength(diff),
        avgPainWith: humidAvg,
        avgPainWithout: normalAvg,
        sampleSize: humidEntries.length + normalHumidityEntries.length,
        insight: diff > 0.5 
          ? `High humidity increases your pain by ${diff.toFixed(1)} points`
          : diff < -0.5
            ? `You feel better in humid conditions`
            : `Humidity has minimal impact on your pain`,
        icon: <Droplets className="h-5 w-5 text-cyan-500" />,
      });
    }
    
    // Weather condition breakdown
    const conditionMap = new Map<string, { count: number; totalPain: number }>();
    parsed.forEach(p => {
      const condition = p.condition || (p.isRaining ? 'rainy' : 'unknown');
      const existing = conditionMap.get(condition) || { count: 0, totalPain: 0 };
      conditionMap.set(condition, {
        count: existing.count + 1,
        totalPain: existing.totalPain + p.pain,
      });
    });
    
    const weatherStats: WeatherStats[] = Array.from(conditionMap.entries())
      .map(([condition, data]) => ({
        condition,
        count: data.count,
        avgPain: data.totalPain / data.count,
        icon: getWeatherIcon(condition),
      }))
      .sort((a, b) => b.avgPain - a.avgPain);
    
    return {
      totalEntries: entries.length,
      weatherEntries: weatherEntries.length,
      coveragePercent: Math.round((weatherEntries.length / entries.length) * 100),
      correlations,
      weatherStats,
      totalAvgPain,
    };
  }, [entries]);
  
  if (!analysis) {
    return (
      <Card className={cn('border-blue-200 dark:border-blue-900', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            Weather Correlations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Not enough weather data yet</p>
            <p className="text-sm mt-1">
              Keep logging entries to see how weather affects your pain.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn('border-blue-200 dark:border-blue-900', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            Weather Correlations
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {analysis.coveragePercent}% of entries have weather data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Correlation Cards */}
        {analysis.correlations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Pain Correlations</h4>
            <div className="grid gap-3">
              {analysis.correlations.map((corr, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-4 rounded-xl border',
                    corr.strength === 'strong' && corr.correlation === 'positive' && 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900',
                    corr.strength === 'strong' && corr.correlation === 'negative' && 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900',
                    corr.strength !== 'strong' && 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{corr.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{corr.factor}</span>
                        <CorrelationBadge correlation={corr.correlation} strength={corr.strength} />
                      </div>
                      <p className="text-sm text-muted-foreground">{corr.insight}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span>
                          With: <strong>{corr.avgPainWith.toFixed(1)}</strong>/10
                        </span>
                        <span>
                          Without: <strong>{corr.avgPainWithout.toFixed(1)}</strong>/10
                        </span>
                        <span className="text-muted-foreground">
                          ({corr.sampleSize} entries)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Weather Breakdown */}
        {analysis.weatherStats.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Pain by Weather Condition</h4>
            <div className="space-y-2">
              {analysis.weatherStats.slice(0, 5).map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8">{stat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{stat.condition}</span>
                      <span className="text-sm">
                        <strong>{stat.avgPain.toFixed(1)}</strong>/10 avg
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          stat.avgPain >= 7 && 'bg-red-500',
                          stat.avgPain >= 4 && stat.avgPain < 7 && 'bg-amber-500',
                          stat.avgPain < 4 && 'bg-green-500'
                        )}
                        style={{ width: `${(stat.avgPain / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.count} entries
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-muted-foreground text-center">
            Based on {analysis.weatherEntries} entries with weather data out of {analysis.totalEntries} total entries.
            {analysis.coveragePercent < 50 && (
              <span className="block mt-1 text-amber-600 dark:text-amber-400">
                Enable location access to automatically capture weather data.
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CorrelationBadge({ 
  correlation, 
  strength 
}: { 
  correlation: 'positive' | 'negative' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak' | 'none';
}) {
  const icon = correlation === 'positive' 
    ? <TrendingUp className="h-3 w-3" />
    : correlation === 'negative'
      ? <TrendingDown className="h-3 w-3" />
      : <Minus className="h-3 w-3" />;
  
  const colorClass = correlation === 'positive'
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : correlation === 'negative'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  
  const label = strength === 'none' 
    ? 'No effect' 
    : `${strength.charAt(0).toUpperCase() + strength.slice(1)} ${correlation === 'positive' ? 'increase' : correlation === 'negative' ? 'decrease' : 'effect'}`;
  
  return (
    <Badge variant="secondary" className={cn('text-xs gap-1', colorClass)}>
      {icon}
      {label}
    </Badge>
  );
}

function getWeatherIcon(condition: string): React.ReactNode {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) {
    return <CloudRain className="h-4 w-4 text-blue-600" />;
  }
  if (lower.includes('cloud') || lower.includes('overcast')) {
    return <Cloud className="h-4 w-4 text-gray-500" />;
  }
  if (lower.includes('clear') || lower.includes('sunny')) {
    return <Sun className="h-4 w-4 text-amber-500" />;
  }
  if (lower.includes('thunder') || lower.includes('storm')) {
    return <CloudRain className="h-4 w-4 text-purple-600" />;
  }
  if (lower.includes('snow')) {
    return <Cloud className="h-4 w-4 text-blue-300" />;
  }
  if (lower.includes('fog')) {
    return <Wind className="h-4 w-4 text-gray-400" />;
  }
  return <Cloud className="h-4 w-4 text-gray-400" />;
}

export default WeatherCorrelationPanel;
