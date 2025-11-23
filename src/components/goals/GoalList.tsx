import React, { useState, useEffect, useCallback } from 'react';
import type { Goal } from '../../types/goals';
import { goalStorage } from '../../utils/goals/storage';
import {
  GoalAnalyticsCalculator,
  calculateDaysRemaining,
  isGoalOverdue,
  getGoalStatusColor,
  formatGoalProgress,
} from '../../utils/goals/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import {
  Target,
  Calendar,
  TrendingUp,
  Award,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Search,
  Star,
  Clock,
} from 'lucide-react';

interface GoalListProps {
  onCreateGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onViewProgress: (goal: Goal) => void;
}

export const GoalList: React.FC<GoalListProps> = ({ onCreateGoal, onEditGoal, onViewProgress }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'progress' | 'due_date'>('created');

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    filterAndSortGoals();
  }, [filterAndSortGoals]);

  const loadGoals = async () => {
    try {
      const allGoals = await goalStorage.getAllGoals();
      setGoals(allGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGoals = useCallback(() => {
    let filtered = goals.filter(goal => {
      const matchesSearch =
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
      const matchesType = typeFilter === 'all' || goal.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort goals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'progress': {
          const progressA = GoalAnalyticsCalculator.calculateProgressPercentage(a, []);
          const progressB = GoalAnalyticsCalculator.calculateProgressPercentage(b, []);
          return progressB - progressA;
        }
        case 'due_date': {
          const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          return dateA - dateB;
        }
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredGoals(filtered);
  }, [goals, searchTerm, statusFilter, typeFilter, sortBy]);

  const handleStatusChange = async (goalId: string, newStatus: Goal['status']) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedGoal = {
        ...goal,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };

      await goalStorage.saveGoal(updatedGoal);
      await loadGoals();
    } catch (error) {
      console.error('Failed to update goal status:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      await goalStorage.deleteGoal(goalId);
      await loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const getGoalIcon = (type: Goal['type']) => {
    switch (type) {
      case 'pain_reduction':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'consistency':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'medication_adherence':
        return <Clock className="w-5 h-5 text-green-500" />;
      case 'activity_increase':
        return <Target className="w-5 h-5 text-orange-500" />;
      default:
        return <Star className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Goals</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and stay motivated on your health journey
          </p>
        </div>
        <Button onClick={onCreateGoal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pain_reduction">Pain Reduction</SelectItem>
                <SelectItem value="consistency">Consistency</SelectItem>
                <SelectItem value="medication_adherence">Medication</SelectItem>
                <SelectItem value="activity_increase">Activity</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value: string) =>
                setSortBy(value as 'created' | 'priority' | 'progress' | 'due_date')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {goals.length === 0
                ? 'Create your first goal to start tracking your progress'
                : 'Try adjusting your search or filters'}
            </p>
            {goals.length === 0 && (
              <Button onClick={onCreateGoal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => {
            const progress = GoalAnalyticsCalculator.calculateProgressPercentage(goal, []);
            const daysRemaining = calculateDaysRemaining(goal);
            const isOverdue = isGoalOverdue(goal);
            const statusColor = getGoalStatusColor(goal.status);

            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getGoalIcon(goal.type)}
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(goal.status)}
                          <Badge className={statusColor}>{goal.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Target */}
                  {goal.targets[0] && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Target:{' '}
                      {formatGoalProgress(goal.targets[0].targetValue, goal.targets[0].unit)}
                    </div>
                  )}

                  {/* Time Remaining */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {daysRemaining === -1
                        ? 'No deadline'
                        : daysRemaining === 0
                          ? 'Due today'
                          : daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : `${Math.abs(daysRemaining)} days overdue`}
                    </div>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{goal.priority} priority</Badge>
                    {goal.milestones.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Award className="w-4 h-4" />
                        {goal.milestones.filter(m => m.isCompleted).length}/{goal.milestones.length}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProgress(goal)}
                      className="flex-1"
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Progress
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEditGoal(goal)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {goal.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(goal.id, 'paused')}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    {goal.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(goal.id, 'active')}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Goal Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {goals.filter(g => g.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {goals.filter(g => g.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    goals.reduce((sum, g) => {
                      const progress = GoalAnalyticsCalculator.calculateProgressPercentage(g, []);
                      return sum + progress;
                    }, 0) / goals.length
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
