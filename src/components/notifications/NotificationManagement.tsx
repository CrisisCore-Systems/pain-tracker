import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectTrigger } from '../ui/select';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Archive,
  Search,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';
import type { Notification, NotificationStatus, NotificationType } from '../../types/notifications';
import { notificationStorage } from '../../utils/notifications/storage';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDismiss: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDismiss,
  onArchive,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case 'read':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'dismissed':
        return <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 ${
        notification.status === 'read' ? 'bg-gray-50' : 'bg-white shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">{getPriorityIcon(notification.priority)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4
                className={`text-sm font-medium truncate ${
                  notification.status === 'read' ? 'text-gray-600' : 'text-gray-900'
                }`}
              >
                {notification.title}
              </h4>
              <Badge variant="outline" className="text-xs">
                {notification.type.replace('_', ' ')}
              </Badge>
              {getStatusIcon(notification.status)}
            </div>
            <p
              className={`text-sm ${
                notification.status === 'read' ? 'text-gray-500' : 'text-gray-700'
              }`}
            >
              {isExpanded ? notification.message : notification.message.substring(0, 100)}
              {notification.message.length > 100 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-500 hover:text-blue-700 ml-1 text-xs"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(notification.createdAt)}</span>
              </span>
              {notification.actionLabel && (
                <button className="text-blue-500 hover:text-blue-700">
                  {notification.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-4">
          {notification.status === 'sent' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          {notification.status === 'read' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsUnread(notification.id)}
              className="h-8 w-8 p-0"
            >
              <Bell className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(notification.id)}
            className="h-8 w-8 p-0"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NotificationFilters {
  status: NotificationStatus | 'all';
  type: NotificationType | 'all';
  search: string;
}

interface NotificationManagementProps {
  className?: string;
}

export const NotificationManagement: React.FC<NotificationManagementProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({
    status: 'all',
    type: 'all',
    search: '',
  });

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const allNotifications = await notificationStorage.getAllNotifications();
      setNotifications(
        allNotifications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (filters.status !== 'all' && notification.status !== filters.status) return false;
      if (filters.type !== 'all' && notification.type !== filters.type) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [notifications, filters]);

  // Bulk actions
  const handleBulkMarkAsRead = async () => {
    try {
      await notificationStorage.bulkUpdateStatus(Array.from(selectedNotifications), 'read');
      await loadNotifications();
      setSelectedNotifications(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleBulkArchive = async () => {
    try {
      await notificationStorage.bulkUpdateStatus(Array.from(selectedNotifications), 'archived');
      await loadNotifications();
      setSelectedNotifications(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to archive notifications:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedNotifications) {
        await notificationStorage.deleteNotification(id);
      }
      await loadNotifications();
      setSelectedNotifications(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  // Individual actions
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationStorage.updateNotificationStatus(id, 'read');
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      await notificationStorage.updateNotificationStatus(id, 'sent');
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await notificationStorage.updateNotificationStatus(id, 'dismissed');
      await loadNotifications();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await notificationStorage.updateNotificationStatus(id, 'archived');
      await loadNotifications();
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationStorage.deleteNotification(id);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleSelectNotification = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedNotifications);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedNotifications(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
    setShowBulkActions(selected);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading notifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
          <Badge variant="secondary">{filteredNotifications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search notifications..."
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          <Select>
            <SelectTrigger
              value={filters.status}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, status: value as NotificationStatus | 'all' }))
              }
            >
              <option value="all">All Status</option>
              <option value="sent">Unread</option>
              <option value="read">Read</option>
              <option value="dismissed">Dismissed</option>
              <option value="archived">Archived</option>
            </SelectTrigger>
          </Select>
          <Select>
            <SelectTrigger
              value={filters.type}
              onValueChange={value =>
                setFilters(prev => ({ ...prev, type: value as NotificationType | 'all' }))
              }
            >
              <option value="all">All Types</option>
              <option value="pain_reminder">Pain Reminders</option>
              <option value="medication_alert">Medication Alerts</option>
              <option value="appointment_reminder">Appointment Reminders</option>
              <option value="goal_achievement">Goal Achievements</option>
              <option value="progress_checkin">Progress Check-ins</option>
              <option value="system_update">System Updates</option>
              <option value="custom">Custom</option>
            </SelectTrigger>
          </Select>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark as Read
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkArchive}>
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {/* Select All */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={
                selectedNotifications.size === filteredNotifications.length &&
                filteredNotifications.length > 0
              }
              onChange={e => handleSelectAll(e.target.checked)}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Select all</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No notifications found</p>
              <p className="text-sm">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div key={notification.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.has(notification.id)}
                  onChange={e => handleSelectNotification(notification.id, e.target.checked)}
                  className="mt-4"
                />
                <div className="flex-1">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAsUnread={handleMarkAsUnread}
                    onDismiss={handleDismiss}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
