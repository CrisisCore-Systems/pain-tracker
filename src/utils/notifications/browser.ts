import React from 'react';
import type { Notification as AppNotification } from '../../types/notifications';

export type NotificationPermission = 'granted' | 'denied' | 'default';

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: unknown;
}

// Note: Removed NotificationAction because actions are not supported in standard NotificationOptions typings

class BrowserNotificationManager {
  private static instance: BrowserNotificationManager;
  private permission: NotificationPermission = 'default';
  private notificationQueue: BrowserNotificationOptions[] = [];

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): BrowserNotificationManager {
    if (!BrowserNotificationManager.instance) {
      BrowserNotificationManager.instance = new BrowserNotificationManager();
    }
    return BrowserNotificationManager.instance;
  }

  // Check if browser notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
  }

  // Request permission from user
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Browser notifications are not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission as NotificationPermission;

      // If permission was granted, process any queued notifications
      if (this.permission === 'granted') {
        this.processQueue();
      }

      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // Check current permission status
  private checkPermission(): void {
    if (this.isSupported()) {
      this.permission = Notification.permission as NotificationPermission;
    }
  }

  // Show a browser notification
  async show(options: BrowserNotificationOptions): Promise<globalThis.Notification | null> {
    if (!this.isSupported()) {
      console.warn('Browser notifications are not supported');
      return null;
    }

    // If permission not granted, queue the notification
    if (this.permission !== 'granted') {
      this.notificationQueue.push(options);
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/notification-icon.png',
        badge: options.badge || '/icons/badge-icon.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        data: options.data,
      });

      // Auto-close notification after 5 seconds unless it requires interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle notification click
      notification.onclick = () => {
        // Focus the window
        window.focus();

        // Handle action data if present
        if (options.data && typeof options.data === 'object' && 'actionUrl' in options.data) {
          const actionUrl = (options.data as { actionUrl: string }).actionUrl;
          if (actionUrl) {
            window.location.href = actionUrl;
          }
        }

        notification.close();
      };

      // Handle notification close
      notification.onclose = () => {
        // Could emit an event or call a callback here
      };

      // Handle notification error
      notification.onerror = error => {
        console.error('Notification error:', error);
      };

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Show notification from our Notification type
  async showFromNotification(
    notification: AppNotification
  ): Promise<globalThis.Notification | null> {
    const options: BrowserNotificationOptions = {
      title: notification.title,
      body: notification.message,
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent' || notification.priority === 'high',
      data: {
        actionUrl: notification.actionUrl,
        notificationId: notification.id,
      },
    };

    return this.show(options);
  }

  // Process queued notifications
  private processQueue(): void {
    while (this.notificationQueue.length > 0) {
      const options = this.notificationQueue.shift();
      if (options) {
        this.show(options);
      }
    }
  }

  // Close all notifications with a specific tag
  closeByTag(tag: string): void {
    if (!this.isSupported()) return;

    // Note: Modern browsers don't provide a direct way to close notifications by tag
    // This method is kept for future implementation or alternative approaches
    console.log(`Attempting to close notifications with tag: ${tag}`);
  }

  // Get notification settings/status
  getStatus(): {
    supported: boolean;
    permission: NotificationPermission;
    queueLength: number;
  } {
    return {
      supported: this.isSupported(),
      permission: this.permission,
      queueLength: this.notificationQueue.length,
    };
  }

  // Clear notification queue
  clearQueue(): void {
    this.notificationQueue = [];
  }

  // Test notification (useful for debugging)
  async test(): Promise<boolean> {
    const testOptions: BrowserNotificationOptions = {
      title: 'Test Notification',
      body: 'This is a test notification to verify browser notification functionality.',
      tag: 'test-notification',
      requireInteraction: false,
    };

    const notification = await this.show(testOptions);
    return notification !== null;
  }
}

// Export singleton instance
export const browserNotificationManager = BrowserNotificationManager.getInstance();

// Utility functions for common notification patterns
export const showPainReminderNotification = async (painLevel?: number): Promise<void> => {
  const options: BrowserNotificationOptions = {
    title: 'Pain Check-in Reminder',
    body: painLevel
      ? `How is your pain level now? Last recorded: ${painLevel}/10`
      : 'Time for your regular pain check-in',
    tag: 'pain-reminder',
    requireInteraction: false,
    data: { actionUrl: '/app/checkin' },
  };

  await browserNotificationManager.show(options);
};

export const showMedicationReminderNotification = async (
  medicationName: string,
  dosage: string
): Promise<void> => {
  const options: BrowserNotificationOptions = {
    title: 'Medication Reminder',
    body: `Time to take ${medicationName} (${dosage})`,
    tag: 'medication-reminder',
    requireInteraction: true,
    data: { actionUrl: '/medications' },
  };

  await browserNotificationManager.show(options);
};

export const showAppointmentReminderNotification = async (
  providerName: string,
  hoursUntil: number
): Promise<void> => {
  const options: BrowserNotificationOptions = {
    title: 'Appointment Reminder',
    body: `You have an appointment with ${providerName} in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
    tag: 'appointment-reminder',
    requireInteraction: true,
    data: { actionUrl: '/appointments' },
  };

  await browserNotificationManager.show(options);
};

export const showGoalAchievementNotification = async (goalDescription: string): Promise<void> => {
  const options: BrowserNotificationOptions = {
    title: 'Goal Achievement! 🎉',
    body: `Congratulations! You've achieved your goal: ${goalDescription}`,
    tag: 'goal-achievement',
    requireInteraction: true,
    data: { actionUrl: '/goals' },
  };

  await browserNotificationManager.show(options);
};

// Hook for React components to use browser notifications
export const useBrowserNotifications = () => {
  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    setSupported(browserNotificationManager.isSupported());
    setPermission(browserNotificationManager.getPermission());
  }, []);

  const requestPermission = React.useCallback(async () => {
    const newPermission = await browserNotificationManager.requestPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  const showNotification = React.useCallback(async (options: BrowserNotificationOptions) => {
    return browserNotificationManager.show(options);
  }, []);

  const testNotification = React.useCallback(async () => {
    return browserNotificationManager.test();
  }, []);

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
    testNotification,
  };
};
