import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { secureStorage } from '../../lib/storage/secureStorage';
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationPreferences } from '../../types/notifications';
import { Switch } from '../ui/switch';

const STORAGE_KEY = 'pain-tracker:notification-preferences';

/** Deeply merge stored prefs with defaults to handle missing nested properties */
function loadPrefs(): NotificationPreferences {
  const stored = secureStorage.safeJSON<Partial<NotificationPreferences>>(STORAGE_KEY, {});
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...stored,
    deliveryMethods: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.deliveryMethods,
      ...(stored.deliveryMethods ?? {}),
    },
    categories: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
      ...(stored.categories ?? {}),
    },
    quietHours: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.quietHours,
      ...(stored.quietHours ?? {}),
    },
    frequencyLimits: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.frequencyLimits,
      ...(stored.frequencyLimits ?? {}),
    },
  };
}

export default function NotificationPreferencesPanel() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(loadPrefs);

  useEffect(() => {
    secureStorage.set(STORAGE_KEY, prefs);
  }, [prefs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable notifications</span>
            <Switch checked={prefs.enabled} onCheckedChange={checked => setPrefs({ ...prefs, enabled: checked })} />
          </label>

          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Browser notifications</span>
              <Switch
                checked={prefs.deliveryMethods.browser}
                onCheckedChange={checked => setPrefs({ ...prefs, deliveryMethods: { ...prefs.deliveryMethods, browser: checked } })}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">In-app notifications</span>
              <Switch
                checked={prefs.deliveryMethods.in_app}
                onCheckedChange={checked => setPrefs({ ...prefs, deliveryMethods: { ...prefs.deliveryMethods, in_app: checked } })}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Email</span>
              <Switch
                checked={prefs.deliveryMethods.email}
                onCheckedChange={checked => setPrefs({ ...prefs, deliveryMethods: { ...prefs.deliveryMethods, email: checked } })}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">SMS</span>
              <Switch
                checked={prefs.deliveryMethods.sms}
                onCheckedChange={checked => setPrefs({ ...prefs, deliveryMethods: { ...prefs.deliveryMethods, sms: checked } })}
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
