import type {
  Notification,
  NotificationPreferences,
  NotificationSchedule,
  NotificationStatus,
  NotificationType
} from '../../types/notifications';
// Lightweight fallback encryption shim; replace with real implementation if available
const encryptData = (data: string) => data;
const decryptData = (data: string) => data;

const STORAGE_KEYS = {
  NOTIFICATIONS: 'pain_tracker_notifications',
  PREFERENCES: 'pain_tracker_notification_preferences',
  SCHEDULES: 'pain_tracker_notification_schedules',
  LAST_BACKUP: 'pain_tracker_notifications_last_backup'
} as const;

// Storage utilities for notifications
export class NotificationStorage {
  private static instance: NotificationStorage;

  private constructor() {}

  static getInstance(): NotificationStorage {
    if (!NotificationStorage.instance) {
      NotificationStorage.instance = new NotificationStorage();
    }
    return NotificationStorage.instance;
  }

  // Notification CRUD operations
  async saveNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const existingIndex = notifications.findIndex(n => n.id === notification.id);

      if (existingIndex >= 0) {
        notifications[existingIndex] = { ...notification, updatedAt: new Date().toISOString() };
      } else {
        notifications.push(notification);
      }

      await this.saveNotificationsToStorage(notifications);
    } catch (error) {
      console.error('Failed to save notification:', error);
      throw new Error('Failed to save notification');
    }
  }

  async getNotification(id: string): Promise<Notification | null> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.find(n => n.id === id) || null;
    } catch (error) {
      console.error('Failed to get notification:', error);
      return null;
    }
  }

  async getAllNotifications(): Promise<Notification[]> {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!encrypted) return [];

      const decrypted = await decryptData(encrypted);
      const notifications = JSON.parse(decrypted) as Notification[];

      // Validate and filter out corrupted notifications
      return notifications.filter(this.isValidNotification);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  }

  async getNotificationsByStatus(status: NotificationStatus): Promise<Notification[]> {
    const notifications = await this.getAllNotifications();
    return notifications.filter(n => n.status === status);
  }

  async getNotificationsByType(type: NotificationType): Promise<Notification[]> {
    const notifications = await this.getAllNotifications();
    return notifications.filter(n => n.type === type);
  }

  async updateNotificationStatus(id: string, status: NotificationStatus): Promise<void> {
    try {
      const notification = await this.getNotification(id);
      if (!notification) return;

      const updatedNotification: Notification = {
        ...notification,
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'read' && { readAt: new Date().toISOString() }),
        ...(status === 'dismissed' && { dismissedAt: new Date().toISOString() })
      };

      await this.saveNotification(updatedNotification);
    } catch (error) {
      console.error('Failed to update notification status:', error);
      throw new Error('Failed to update notification status');
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const filtered = notifications.filter(n => n.id !== id);
      await this.saveNotificationsToStorage(filtered);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async bulkUpdateStatus(ids: string[], status: NotificationStatus): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updated = notifications.map(n =>
        ids.includes(n.id)
          ? {
              ...n,
              status,
              updatedAt: new Date().toISOString(),
              ...(status === 'read' && { readAt: new Date().toISOString() }),
              ...(status === 'dismissed' && { dismissedAt: new Date().toISOString() })
            }
          : n
      );
      await this.saveNotificationsToStorage(updated);
    } catch (error) {
      console.error('Failed to bulk update notifications:', error);
      throw new Error('Failed to bulk update notifications');
    }
  }

  async archiveOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const updated = notifications.map(n =>
        new Date(n.createdAt) < cutoffDate && n.status === 'read'
          ? { ...n, status: 'archived' as NotificationStatus, updatedAt: new Date().toISOString() }
          : n
      );

      await this.saveNotificationsToStorage(updated);
    } catch (error) {
      console.error('Failed to archive old notifications:', error);
    }
  }

  // Preferences management
  async savePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      const encrypted = await encryptData(JSON.stringify(preferences));
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, encrypted);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      throw new Error('Failed to save notification preferences');
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!encrypted) return this.getDefaultPreferences();

      const decrypted = await decryptData(encrypted);
      const preferences = JSON.parse(decrypted) as NotificationPreferences;

      // Validate preferences structure
      return this.validatePreferences(preferences);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  // Schedule management
  async saveSchedule(schedule: NotificationSchedule): Promise<void> {
    try {
      const schedules = await this.getAllSchedules();
      const existingIndex = schedules.findIndex(s => s.id === schedule.id);

      if (existingIndex >= 0) {
        schedules[existingIndex] = { ...schedule, updatedAt: new Date().toISOString() };
      } else {
        schedules.push(schedule);
      }

      await this.saveSchedulesToStorage(schedules);
    } catch (error) {
      console.error('Failed to save notification schedule:', error);
      throw new Error('Failed to save notification schedule');
    }
  }

  async getAllSchedules(): Promise<NotificationSchedule[]> {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      if (!encrypted) return [];

      const decrypted = await decryptData(encrypted);
      const schedules = JSON.parse(decrypted) as NotificationSchedule[];

      return schedules.filter(this.isValidSchedule);
    } catch (error) {
      console.error('Failed to load notification schedules:', error);
      return [];
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      const schedules = await this.getAllSchedules();
      const filtered = schedules.filter(s => s.id !== id);
      await this.saveSchedulesToStorage(filtered);
    } catch (error) {
      console.error('Failed to delete notification schedule:', error);
      throw new Error('Failed to delete notification schedule');
    }
  }

  // Utility methods
  private async saveNotificationsToStorage(notifications: Notification[]): Promise<void> {
    const encrypted = await encryptData(JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, encrypted);
  }

  private async saveSchedulesToStorage(schedules: NotificationSchedule[]): Promise<void> {
    const encrypted = await encryptData(JSON.stringify(schedules));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, encrypted);
  }

  private isValidNotification(notification: unknown): notification is Notification {
    const n = notification as Record<string, unknown>;
    return (
      n &&
      typeof n === 'object' &&
      typeof n.id === 'string' &&
      typeof n.title === 'string' &&
      typeof n.message === 'string' &&
      ['low', 'medium', 'high', 'urgent'].includes(n.priority as string) &&
      ['pending', 'sent', 'read', 'dismissed', 'archived'].includes(n.status as string) &&
      Array.isArray(n.deliveryMethods) &&
      typeof n.createdAt === 'string'
    );
  }

  private isValidSchedule(schedule: unknown): schedule is NotificationSchedule {
  const s = schedule as Record<string, unknown> | null | undefined;
  if (!s || typeof s !== 'object') return false;
  const hasId = typeof s.id === 'string';
  const hasName = typeof s.name === 'string';
  const hasType = typeof s.type === 'string';
  const hasTrigger = !!s.trigger;
  const hasTemplate = !!s.template;
  const hasIsActive = typeof s.isActive === 'boolean';
  const hasCreatedAt = typeof s.createdAt === 'string';

  return Boolean(hasId && hasName && hasType && hasTrigger && hasTemplate && hasIsActive && hasCreatedAt);
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      deliveryMethods: {
        browser: true,
        in_app: true,
        email: false,
        sms: false
      },
      categories: {
        pain_reminders: true,
        medication_alerts: true,
        appointment_reminders: true,
        goal_achievements: true,
        progress_checkins: true,
        system_updates: false,
        custom: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      frequencyLimits: {
        maxPerDay: 10,
        maxPerHour: 3
      }
    };
  }

  private validatePreferences(preferences: unknown): NotificationPreferences {
    const prefs = preferences as Record<string, unknown>;
    const defaults = this.getDefaultPreferences();

    if (!prefs || typeof prefs !== 'object') {
      return defaults;
    }

    return {
      enabled: typeof prefs.enabled === 'boolean' ? prefs.enabled : defaults.enabled,
      deliveryMethods: {
        browser: typeof (prefs.deliveryMethods as Record<string, unknown>)?.browser === 'boolean' ? (prefs.deliveryMethods as Record<string, unknown>).browser as boolean : defaults.deliveryMethods.browser,
        in_app: typeof (prefs.deliveryMethods as Record<string, unknown>)?.in_app === 'boolean' ? (prefs.deliveryMethods as Record<string, unknown>).in_app as boolean : defaults.deliveryMethods.in_app,
        email: typeof (prefs.deliveryMethods as Record<string, unknown>)?.email === 'boolean' ? (prefs.deliveryMethods as Record<string, unknown>).email as boolean : defaults.deliveryMethods.email,
        sms: typeof (prefs.deliveryMethods as Record<string, unknown>)?.sms === 'boolean' ? (prefs.deliveryMethods as Record<string, unknown>).sms as boolean : defaults.deliveryMethods.sms
      },
      categories: {
        pain_reminders: typeof (prefs.categories as Record<string, unknown>)?.pain_reminders === 'boolean' ? (prefs.categories as Record<string, unknown>).pain_reminders as boolean : defaults.categories.pain_reminders,
        medication_alerts: typeof (prefs.categories as Record<string, unknown>)?.medication_alerts === 'boolean' ? (prefs.categories as Record<string, unknown>).medication_alerts as boolean : defaults.categories.medication_alerts,
        appointment_reminders: typeof (prefs.categories as Record<string, unknown>)?.appointment_reminders === 'boolean' ? (prefs.categories as Record<string, unknown>).appointment_reminders as boolean : defaults.categories.appointment_reminders,
        goal_achievements: typeof (prefs.categories as Record<string, unknown>)?.goal_achievements === 'boolean' ? (prefs.categories as Record<string, unknown>).goal_achievements as boolean : defaults.categories.goal_achievements,
        progress_checkins: typeof (prefs.categories as Record<string, unknown>)?.progress_checkins === 'boolean' ? (prefs.categories as Record<string, unknown>).progress_checkins as boolean : defaults.categories.progress_checkins,
        system_updates: typeof (prefs.categories as Record<string, unknown>)?.system_updates === 'boolean' ? (prefs.categories as Record<string, unknown>).system_updates as boolean : defaults.categories.system_updates,
        custom: typeof (prefs.categories as Record<string, unknown>)?.custom === 'boolean' ? (prefs.categories as Record<string, unknown>).custom as boolean : defaults.categories.custom
      },
      quietHours: {
        enabled: typeof (prefs.quietHours as Record<string, unknown>)?.enabled === 'boolean' ? (prefs.quietHours as Record<string, unknown>).enabled as boolean : defaults.quietHours.enabled,
        start: typeof (prefs.quietHours as Record<string, unknown>)?.start === 'string' ? (prefs.quietHours as Record<string, unknown>).start as string : defaults.quietHours.start,
        end: typeof (prefs.quietHours as Record<string, unknown>)?.end === 'string' ? (prefs.quietHours as Record<string, unknown>).end as string : defaults.quietHours.end
      },
      frequencyLimits: {
        maxPerDay: typeof (prefs.frequencyLimits as Record<string, unknown>)?.maxPerDay === 'number' ? (prefs.frequencyLimits as Record<string, unknown>).maxPerDay as number : defaults.frequencyLimits.maxPerDay,
        maxPerHour: typeof (prefs.frequencyLimits as Record<string, unknown>)?.maxPerHour === 'number' ? (prefs.frequencyLimits as Record<string, unknown>).maxPerHour as number : defaults.frequencyLimits.maxPerHour
      }
    };
  }

  // Cleanup and maintenance
  async cleanup(): Promise<void> {
    try {
      // Archive old notifications
      await this.archiveOldNotifications(30);

      // Remove expired notifications
      const notifications = await this.getAllNotifications();
      const now = new Date();
      const activeNotifications = notifications.filter(n =>
        !n.expiresAt || new Date(n.expiresAt) > now
      );

      if (activeNotifications.length !== notifications.length) {
        await this.saveNotificationsToStorage(activeNotifications);
      }
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
      localStorage.removeItem(STORAGE_KEYS.LAST_BACKUP);
    } catch (error) {
      console.error('Failed to clear notification data:', error);
      throw new Error('Failed to clear notification data');
    }
  }
}

// Export singleton instance
export const notificationStorage = NotificationStorage.getInstance();
