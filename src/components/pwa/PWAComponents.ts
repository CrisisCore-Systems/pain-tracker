/**
 * PWA Status Component - Vanilla JS implementation
 * Provides a React-like component for PWA status without TypeScript issues
 */

// Simple PWA status component factory
import { secureStorage } from '../../lib/storage/secureStorage';

export function createPWAStatusComponent() {
  return function PWAStatus({ className = '', style = {} }) {
    // Use the PWA status from the global PWA manager
    const getPWAStatus = () => {
      const isOnline = navigator.onLine;
      const pendingSync = parseInt(secureStorage.get<string>('pwa-pending-sync') || '0');
      const isSyncing = secureStorage.get<string>('pwa-is-syncing') === 'true';
      const isInstalled = secureStorage.get<string>('pwa-is-installed') === 'true';

      return { isOnline, pendingSync, isSyncing, isInstalled };
    };

    const status = getPWAStatus();

    // Create status indicator
    const createStatusIndicator = () => {
      if (status.isOnline && status.pendingSync === 0 && !status.isSyncing) {
        return null; // All good, no indicator needed
      }

      const statusText = !status.isOnline
        ? 'Offline - Data saved locally'
        : status.isSyncing
          ? 'Syncing data...'
          : status.pendingSync > 0
            ? `${status.pendingSync} items pending sync`
            : 'Online';

      const statusColor = !status.isOnline
        ? '#ef4444'
        : status.isSyncing
          ? '#3b82f6'
          : status.pendingSync > 0
            ? '#f59e0b'
            : '#10b981';

      return {
        type: 'div',
        props: {
          className: `pwa-status-indicator ${className}`,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            borderRadius: '0.375rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            ...style,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  animation: status.isSyncing ? 'pulse 2s infinite' : 'none',
                },
              },
            },
            {
              type: 'span',
              props: {
                style: {
                  fontWeight: '500',
                  color: '#374151',
                },
                children: statusText,
              },
            },
          ],
        },
      };
    };

    return createStatusIndicator();
  };
}

// Simple PWA install button component factory
export function createPWAInstallButton() {
  return function PWAInstallButton({
    className = '',
    style = {},
    children = 'Install App',
    onInstall = () => {},
  }) {
    const canInstall = secureStorage.get<string>('pwa-can-install') === 'true';
    const isInstalled = secureStorage.get<string>('pwa-is-installed') === 'true';

    if (!canInstall || isInstalled) {
      return null;
    }

    const handleClick = async () => {
      try {
        if (window.pwaManager && window.pwaManager.showInstallPrompt) {
          await window.pwaManager.showInstallPrompt();
          onInstall();
        }
      } catch (error) {
        console.error('PWA: Install failed:', error);
      }
    };

    return {
      type: 'button',
      props: {
        className: `pwa-install-button ${className}`,
        style: {
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          ...style,
        },
        onClick: handleClick,
        children: [
          {
            type: 'span',
            props: {
              children: '📱',
            },
          },
          {
            type: 'span',
            props: {
              children: children,
            },
          },
        ],
      },
    };
  };
}

// Simple sync button component factory
export function createPWASyncButton() {
  return function PWASyncButton({
    className = '',
    style = {},
    children = 'Sync Now',
    onSync = () => {},
  }) {
    const isOnline = navigator.onLine;
    const pendingSync = parseInt(secureStorage.get<string>('pwa-pending-sync') || '0');
    const isSyncing = secureStorage.get<string>('pwa-is-syncing') === 'true';

    if (!isOnline || (pendingSync === 0 && !isSyncing)) {
      return null;
    }

    const handleClick = async () => {
      try {
        if (window.forcePWASync) {
          await window.forcePWASync();
          onSync();
        }
      } catch (error) {
        console.error('PWA: Sync failed:', error);
      }
    };

    return {
      type: 'button',
      props: {
        className: `pwa-sync-button ${className}`,
        style: {
          backgroundColor: isSyncing ? '#6b7280' : '#10b981',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: isSyncing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: isSyncing ? 0.7 : 1,
          ...style,
        },
        onClick: handleClick,
        disabled: isSyncing,
        children: [
          {
            type: 'span',
            props: {
              children: isSyncing ? '⏳' : '🔄',
            },
          },
          {
            type: 'span',
            props: {
              children: isSyncing ? 'Syncing...' : children,
            },
          },
        ],
      },
    };
  };
}

// Types for PWA component configuration
interface PWAComponentProps {
  style?: Record<string, string>;
  className?: string;
  children?: string | PWAComponentConfig | PWAComponentConfig[];
  onClick?: () => void;
  [key: string]: unknown;
}

interface PWAComponentConfig {
  type: string;
  props?: PWAComponentProps;
}

// Helper function to render components
export function renderPWAComponent(component: PWAComponentConfig, container: HTMLElement) {
  if (!component || !container) return;

  function createElement(config: PWAComponentConfig): HTMLElement | null {
    if (!config) return null;

    const element = document.createElement(config.type);

    if (config.props) {
      // Handle style
      if (config.props.style) {
        Object.assign(element.style, config.props.style);
      }

      // Handle className
      if (config.props.className) {
        element.className = config.props.className;
      }

      // Handle other attributes
      Object.keys(config.props).forEach(key => {
        if (key !== 'style' && key !== 'className' && key !== 'children' && key !== 'onClick') {
          const value = config.props![key];
          if (typeof value === 'string' || typeof value === 'number') {
            element.setAttribute(key, String(value));
          }
        }
      });

      // Handle click events
      if (config.props.onClick) {
        element.addEventListener('click', config.props.onClick);
      }

      // Handle children
      if (config.props.children) {
        if (typeof config.props.children === 'string') {
          element.textContent = config.props.children;
        } else if (Array.isArray(config.props.children)) {
          config.props.children.forEach((child: PWAComponentConfig) => {
            const childElement = createElement(child);
            if (childElement) {
              element.appendChild(childElement);
            }
          });
        } else if (typeof config.props.children === 'object') {
          const childElement = createElement(config.props.children);
          if (childElement) {
            element.appendChild(childElement);
          }
        }
      }
    }

    return element;
  }

  const element = createElement(component);
  if (element) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(element);
  }
}

// Export factory functions
export default {
  createPWAStatusComponent,
  createPWAInstallButton,
  createPWASyncButton,
  renderPWAComponent,
};
