import { secureStorage } from '../lib/storage/secureStorage';

export type WcbTemplateStyle = 'standard' | 'hostile-bureaucracy';

export interface WorkflowPreferences {
  defaultWcbTemplateStyle: WcbTemplateStyle;
  industrialFieldMode: boolean;
  showFibromyalgiaHubNavItem: boolean;
}

export const DEFAULT_WORKFLOW_PREFERENCES: WorkflowPreferences = {
  defaultWcbTemplateStyle: 'hostile-bureaucracy',
  industrialFieldMode: false,
  showFibromyalgiaHubNavItem: true,
};

export const WORKFLOW_PREFERENCES_STORAGE_KEY = 'pain-tracker:workflow-preferences';
export const WORKFLOW_PREFERENCES_UPDATED_EVENT = 'workflow-preferences-updated';

function coerceWorkflowPreferences(raw: unknown): WorkflowPreferences {
  const candidate = raw as Partial<WorkflowPreferences> | null | undefined;

  return {
    defaultWcbTemplateStyle:
      candidate?.defaultWcbTemplateStyle === 'standard' ||
      candidate?.defaultWcbTemplateStyle === 'hostile-bureaucracy'
        ? candidate.defaultWcbTemplateStyle
        : DEFAULT_WORKFLOW_PREFERENCES.defaultWcbTemplateStyle,
    industrialFieldMode:
      typeof candidate?.industrialFieldMode === 'boolean'
        ? candidate.industrialFieldMode
        : DEFAULT_WORKFLOW_PREFERENCES.industrialFieldMode,
    showFibromyalgiaHubNavItem:
      typeof candidate?.showFibromyalgiaHubNavItem === 'boolean'
        ? candidate.showFibromyalgiaHubNavItem
        : DEFAULT_WORKFLOW_PREFERENCES.showFibromyalgiaHubNavItem,
  };
}

function notifyWorkflowPreferencesUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(WORKFLOW_PREFERENCES_UPDATED_EVENT));
}

export function readWorkflowPreferences(): WorkflowPreferences {
  const stored = secureStorage.safeJSON<unknown>(
    WORKFLOW_PREFERENCES_STORAGE_KEY,
    DEFAULT_WORKFLOW_PREFERENCES
  );

  return coerceWorkflowPreferences(stored);
}

export function writeWorkflowPreferences(
  updates: Partial<WorkflowPreferences>
): WorkflowPreferences {
  const current = readWorkflowPreferences();
  const next = coerceWorkflowPreferences({ ...current, ...updates });
  const writeResult = secureStorage.set(WORKFLOW_PREFERENCES_STORAGE_KEY, next);

  if (writeResult?.success === false) {
    return current;
  }

  notifyWorkflowPreferencesUpdated();
  return next;
}
