import React, { useState, useEffect } from 'react';
import type { Goal } from '../../types/goals';
import { goalStorage } from '../../utils/goals/storage';
import { goalAnalytics } from '../../utils/goals/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Target,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Award
} from 'lucide-react';

interface GoalDashboardWidgetProps {
  onOpenManager: () => void;
  className?: string;
  compact?: boolean;
}

export const GoalDashboardWidget: React.FC<GoalDashboardWidgetProps> = ({
  onOpenManager,
  className = '',
  compact = false
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalGoals?: number;
    activeGoals?: number;
    completedGoals?: number;
    avgProgress?: number;
    totalEntries?: number;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoalsData();
  }, []);

  const loadGoalsData = async () => {
    try {
      setLoading(true);
      const allGoals = await goalStorage.getAllGoals();
      setGoals(allGoals);

      // Calculate overall analytics
      const activeGoals = allGoals.filter(g => g.status === 'active');
      const completedGoals = allGoals.filter(g => g.status === 'completed');

      // Calculate average progress across all goals
      let totalProgress = 0;
      let totalEntries = 0;

      for (const goal of allGoals) {
        const progress = await goalStorage.getGoalProgress(goal.id);
        const goalAnalyticsData = await goalAnalytics.calculateGoalAnalytics(goal, progress);

        if (goalAnalyticsData.progressPercentage !== undefined) {
          totalProgress += goalAnalyticsData.progressPercentage;
        }
        totalEntries += progress.length;
      }

      const avgProgress = allGoals.length > 0 ? totalProgress / allGoals.length : 0;

      setAnalytics({
        totalGoals: allGoals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        avgProgress: Math.round(avgProgress),
        totalEntries
      });
    } catch (error) {
      console.error('Failed to load goals data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
  case 'abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderCompactView = () => (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Goals
          </div>
          <Button variant="ghost" size="sm" onClick={onOpenManager}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        ) : analytics.totalGoals === 0 ? (
          <div className="text-center py-6">
            <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-3">No goals yet</p>
            <Button onClick={onOpenManager} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{analytics.activeGoals}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{analytics.completedGoals}</div>
                <div className="text-xs text-gray-600">Done</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{analytics.totalEntries}</div>
                <div className="text-xs text-gray-600">Entries</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{analytics.avgProgress}%</span>
              </div>
              <Progress value={analytics.avgProgress} className="h-2" />
            </div>

            <Button onClick={onOpenManager} variant="outline" className="w-full" size="sm">
              Manage Goals
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderFullView = () => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Goal Dashboard
          </div>
          <Button variant="outline" size="sm" onClick={onOpenManager}>
            <ArrowRight className="w-4 h-4 mr-2" />
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : analytics.totalGoals === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Set meaningful goals to track your progress and celebrate your achievements.
            </p>
            <Button onClick={onOpenManager}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalGoals}</div>
                <div className="text-sm text-gray-600">Total Goals</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.activeGoals}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analytics.completedGoals}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analytics.avgProgress}%</div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>

            {/* Recent Goals */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Goals
              </h4>
              <div className="space-y-3">
                {goals
                  .filter(g => g.status === 'active')
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 3)
                  .map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(goal.priority)}`}
                      onClick={onOpenManager}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{goal.title}</h5>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Started {formatDate(goal.startDate)}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Track Progress</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button onClick={onOpenManager} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
              <Button variant="outline" onClick={onOpenManager} className="flex-1">
                <Award className="w-4 h-4 mr-2" />
                View Achievements
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return compact ? renderCompactView() : renderFullView();
};
