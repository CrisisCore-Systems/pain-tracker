import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Target, Calendar } from 'lucide-react';
import type { PainEntry } from '../../types';
import { painAnalyticsService } from '../../services/PainAnalyticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../design-system';

interface PainAnalyticsPanelProps {
  entries: PainEntry[];
}

export function PainAnalyticsPanel({ entries }: PainAnalyticsPanelProps) {
  const analytics = useMemo(() => {
    if (entries.length < 3) return null;
    
    return {
      patterns: painAnalyticsService.analyzePatterns(entries),
      prediction: painAnalyticsService.predictPain(entries, '7d'),
      correlations: painAnalyticsService.analyzeCorrelations(entries),
      trends: painAnalyticsService.analyzeTrends(entries)
    };
  }, [entries]);

  if (!analytics || entries.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI-Powered Insights</span>
          </CardTitle>
          <CardDescription>
            Advanced pain analytics require at least 3 entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Keep tracking your pain to unlock predictive insights and pattern recognition
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-5 w-5 text-green-500" />;
      case 'worsening': return <TrendingUp className="h-5 w-5 text-red-500" />;
      default: return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'worsening': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getTrendIcon(analytics.trends.overallTrend)}
            <span>Pain Trend Analysis</span>
          </CardTitle>
          <CardDescription>
            Your pain pattern analysis over recent entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(analytics.trends.overallTrend)}`}>
            {analytics.trends.overallTrend.charAt(0).toUpperCase() + analytics.trends.overallTrend.slice(1)} Trend
            <span className="ml-2">({Math.round(analytics.trends.trendStrength * 100)}% confidence)</span>
          </div>
          
          {analytics.trends.periodicPatterns.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Detected Patterns:</h4>
              <div className="space-y-2">
                {analytics.trends.periodicPatterns.map((pattern, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{pattern.pattern}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${pattern.strength * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(pattern.strength * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pain Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>7-Day Pain Forecast</span>
          </CardTitle>
          <CardDescription>
            AI-powered prediction based on your patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics.prediction.predictedPain}
              </div>
              <div className="text-sm text-muted-foreground">Predicted Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-muted-foreground">
                {Math.round(analytics.prediction.confidence * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Confidence</div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Contributing Factors:</h4>
            <div className="space-y-2">
              {analytics.prediction.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{factor.factor}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      factor.impact > 0 ? 'bg-red-100 text-red-600' :
                      factor.impact < 0 ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Recognition */}
      {analytics.patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Identified Patterns</span>
            </CardTitle>
            <CardDescription>
              AI-detected patterns in your pain data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.patterns.map((pattern) => (
                <div key={pattern.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{pattern.name}</h4>
                    <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pattern.description}
                  </p>
                  {pattern.triggers.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Triggers: </span>
                      <span className="text-xs">{pattern.triggers.join(', ')}</span>
                    </div>
                  )}
                  {pattern.recommendations.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Recommendations:</span>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        {pattern.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correlation Analysis */}
      {(analytics.correlations.symptomCorrelations.length > 0 || 
        analytics.correlations.medicationEffectiveness.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Correlation Analysis</CardTitle>
            <CardDescription>
              Relationships between symptoms, medications, and pain levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics.correlations.symptomCorrelations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">High-Pain Symptoms</h4>
                  <div className="space-y-2">
                    {analytics.correlations.symptomCorrelations.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.symptom}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${(item.painCorrelation / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.painCorrelation.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.correlations.medicationEffectiveness.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Medication Effectiveness</h4>
                  <div className="space-y-2">
                    {analytics.correlations.medicationEffectiveness.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="truncate">{item.medication}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(item.effectivenessScore / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.effectivenessScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}