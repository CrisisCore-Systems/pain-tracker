import React, { useState, useEffect, useCallback } from 'react';
import { formatNumber } from '../../utils/formatting';
import type { Goal, GoalProgress, GoalMilestone } from '../../types/goals';
import { goalStorage } from '../../utils/goals/storage';
import { goalAnalytics } from '../../utils/goals/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  Plus,
  ArrowLeft,
  BarChart3,
  Award
} from 'lucide-react';

interface GoalProgressTrackerProps {
  goal: Goal;
  onBack: () => void;
}

export const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({
  goal,
  onBack
}) => {
  const [progress, setProgress] = useState<GoalProgress[]>([]);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [analytics, setAnalytics] = useState<{
    progressPercentage?: number;
    trend?: 'improving' | 'declining' | 'stable';
    insights?: string[];
    bestStreak?: number;
    currentStreak?: number;
    totalEntries?: number;
    averageProgress?: number;
  } | null>(null);
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [newProgressValue, setNewProgressValue] = useState('');
  const [newProgressNotes, setNewProgressNotes] = useState('');

  const loadProgressData = useCallback(async () => {
    try {
      const goalProgress = await goalStorage.getGoalProgress(goal.id);
      const goalMilestones = await goalStorage.getGoalMilestones(goal.id);
      const goalAnalyticsData = await goalAnalytics.calculateGoalAnalytics(goal, goalProgress);

      setProgress(goalProgress);
      setMilestones(goalMilestones);
      setAnalytics(goalAnalyticsData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  }, [goal]);

  useEffect(() => {
    loadProgressData();
  }, [goal.id, loadProgressData]);

  const handleAddProgress = async () => {
    if (!newProgressValue.trim()) return;

    try {
      const nowIso = new Date().toISOString();
      const progressEntry: GoalProgress = {
        id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        goalId: goal.id,
        value: parseFloat(newProgressValue),
        notes: newProgressNotes.trim() || undefined,
        timestamp: nowIso,
        date: nowIso,
        isManualEntry: true
      };

      await goalStorage.saveGoalProgress(progressEntry);
      setNewProgressValue('');
      setNewProgressNotes('');
      setIsAddingProgress(false);
      await loadProgressData();
    } catch (error) {
      console.error('Failed to add progress:', error);
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
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderGoalOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{goal.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(goal.status)}>
              {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
            </Badge>
            <Badge className={getPriorityColor(goal.priority)}>
              {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
            </Badge>
            <Badge variant="outline">
              {goal.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
              <div className="font-medium">{formatDate(goal.startDate)}</div>
            </div>
            {goal.endDate && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                <div className="font-medium">{formatDate(goal.endDate)}</div>
              </div>
            )}
          </div>

          {goal.tags && goal.tags.length > 0 && (
            <div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {goal.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics && (
            <>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(analytics.progressPercentage ?? 0)}%</span>
                </div>
                <Progress value={analytics.progressPercentage ?? 0} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
                  <div className="font-medium">{analytics.currentStreak} days</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Best Streak:</span>
                  <div className="font-medium">{analytics.bestStreak} days</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Entries:</span>
                  <div className="font-medium">{analytics.totalEntries}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg. Progress:</span>
                  <div className="font-medium">{analytics.averageProgress ? formatNumber(analytics.averageProgress, 1) : 'N/A'}</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProgressEntries = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progress Entries
          </div>
          <Button
            onClick={() => setIsAddingProgress(true)}
            size="sm"
            disabled={goal.status !== 'active'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Progress
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAddingProgress && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <h4 className="font-medium mb-3">Add New Progress</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Progress Value</label>
                <Input
                  type="number"
                  placeholder="Enter progress value"
                  value={newProgressValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProgressValue(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this progress..."
                  value={newProgressNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProgressNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddProgress} size="sm">
                  Save Progress
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingProgress(false);
                    setNewProgressValue('');
                    setNewProgressNotes('');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {progress.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No progress entries yet</p>
            <p className="text-sm mt-1">Start tracking your progress by adding your first entry!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {progress
              .sort((a, b) => new Date(b.timestamp ?? b.date).getTime() - new Date(a.timestamp ?? a.date).getTime())
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Progress: {entry.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(entry.timestamp ?? entry.date)}
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{entry.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMilestones = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No milestones set</p>
            <p className="text-sm mt-1">Milestones help you track significant achievements!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</div>
                  {milestone.targetDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Target: {formatDate(milestone.targetDate)}
                    </div>
                  )}
                </div>
                {milestone.completed && milestone.completedAt && (
                  <div className="text-xs text-green-600">
                    Completed {formatDate(milestone.completedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goals
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Goal Progress</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and analyze your goal progress</p>
        </div>
      </div>

      {renderGoalOverview()}

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          {renderProgressEntries()}
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          {renderMilestones()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
