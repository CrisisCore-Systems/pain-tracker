/**
 * Enhanced Theme Switcher with Preview
 * Allows users to preview and switch between light/dark/system themes with visual preview
 */

import React, { useState } from 'react';
import { Sun, Moon, Contrast, Eye, Check } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { ThemeMode } from '../theme';
import { cn } from '../utils';
import { Button } from './Button';
import { Modal } from './Modal';
import { Scale } from './PageTransition';

export type ThemeOption = ThemeMode;

const getModeIcon = (mode: ThemeOption, sizeClass = 'h-4 w-4') => {
  switch (mode) {
    case 'light':
      return <Sun className={sizeClass} />;
    case 'dark':
      return <Moon className={sizeClass} />;
    case 'high-contrast':
      return <Contrast className={sizeClass} />;
    case 'colorblind':
      return <Eye className={sizeClass} />;
    default:
      return <Sun className={sizeClass} />;
  }
};

const previewContainerClasses: Record<ThemeOption, string> = {
  light: 'bg-white border-gray-200',
  dark: 'bg-gray-900 border-gray-800',
  'high-contrast': 'bg-black border-yellow-400',
  colorblind: 'bg-neutral-100 border-neutral-300',
};

const previewTitleClasses: Record<ThemeOption, string> = {
  light: 'text-gray-900',
  dark: 'text-white',
  'high-contrast': 'text-yellow-300',
  colorblind: 'text-neutral-900',
};

const previewDescriptionClasses: Record<ThemeOption, string> = {
  light: 'text-gray-600',
  dark: 'text-gray-400',
  'high-contrast': 'text-white',
  colorblind: 'text-neutral-700',
};

const previewPrimaryButtonClasses: Record<ThemeOption, string> = {
  light: 'bg-blue-500 text-white',
  dark: 'bg-blue-600 text-white',
  'high-contrast': 'bg-yellow-400 text-black',
  colorblind: 'bg-neutral-800 text-white',
};

const previewSecondaryButtonClasses: Record<ThemeOption, string> = {
  light: 'border-gray-300 text-gray-700',
  dark: 'border-gray-700 text-gray-300',
  'high-contrast': 'border-yellow-400 text-yellow-300',
  colorblind: 'border-neutral-400 text-neutral-600',
};

interface ThemeSwitcherProps {
  className?: string;
  showPreview?: boolean;
}

export function ThemeSwitcher({ className, showPreview = false }: ThemeSwitcherProps) {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeOption>(mode);

  const themes: Array<{
    value: ThemeOption;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      value: 'light',
      label: 'Light',
      icon: getModeIcon('light', 'h-5 w-5'),
      description: 'Clean and bright interface',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: getModeIcon('dark', 'h-5 w-5'),
      description: 'Easy on the eyes in low light',
    },
    {
      value: 'high-contrast',
      label: 'High contrast',
      icon: getModeIcon('high-contrast', 'h-5 w-5'),
      description: 'Maximum contrast for visibility',
    },
    {
      value: 'colorblind',
      label: 'Color safe',
      icon: getModeIcon('colorblind', 'h-5 w-5'),
      description: 'Optimized palette for color vision support',
    },
  ];

  const currentThemeMeta = themes.find((item) => item.value === mode) ?? themes[0];

  const handleThemeChange = (newTheme: ThemeOption) => {
    if (showPreview) {
      setPreviewTheme(newTheme);
    } else {
      setMode(newTheme);
    }
  };

  const handleApplyTheme = () => {
    setMode(previewTheme);
    setIsOpen(false);
  };

  if (showPreview) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className={cn('flex items-center space-x-2', className)}
        >
          {getModeIcon(mode)}
          <span>{currentThemeMeta.label}</span>
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setPreviewTheme(mode);
          }}
          title="Choose Theme"
          size="lg"
        >
          <div className="space-y-6">
            {/* Theme Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all',
                    'hover:shadow-md hover:-translate-y-0.5',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    previewTheme === themeOption.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-full transition-colors',
                        previewTheme === themeOption.value
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {themeOption.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{themeOption.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {themeOption.description}
                      </div>
                    </div>
                  </div>
                  {previewTheme === themeOption.value && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Preview</h4>
              <div
                className={cn(
                  'rounded-lg border-2 p-4 space-y-3 transition-all',
                  previewContainerClasses[previewTheme]
                )}
                data-theme={previewTheme}
              >
                <div className={cn('font-semibold', previewTitleClasses[previewTheme])}>
                  Preview Title
                </div>
                <div className={cn('text-sm', previewDescriptionClasses[previewTheme])}>
                  This is how your interface will look with the {previewTheme} theme.
                </div>
                <div className="flex space-x-2">
                  <div
                    className={cn(
                      'px-3 py-1 rounded text-sm font-medium',
                      previewPrimaryButtonClasses[previewTheme]
                    )}
                  >
                    Primary Button
                  </div>
                  <div
                    className={cn(
                      'px-3 py-1 rounded text-sm border',
                      previewSecondaryButtonClasses[previewTheme]
                    )}
                  >
                    Secondary Button
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setPreviewTheme(mode);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleApplyTheme}>Apply Theme</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Simple theme switcher without preview
  return (
    <div className={cn('flex items-center space-x-2 rounded-lg border p-1', className)}>
      {themes.map((themeOption) => (
        <button
          key={themeOption.value}
          onClick={() => setMode(themeOption.value)}
          className={cn(
            'p-2 rounded-md transition-all',
            'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
            mode === themeOption.value
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title={themeOption.label}
          aria-label={`Switch to ${themeOption.label} theme`}
        >
          {themeOption.icon}
        </button>
      ))}
    </div>
  );
}

// Compact Theme Switcher Button
export function CompactThemeSwitcher({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  const cycleTheme = () => {
    const modes: ThemeOption[] = ['light', 'dark', 'high-contrast', 'colorblind'];
    const currentIndex = modes.indexOf(mode);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (safeIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className={cn('flex items-center space-x-2', className)}
      aria-label={`Switch theme (current: ${mode})`}
      title={`Switch theme (current: ${mode})`}
    >
      {(['light', 'dark', 'high-contrast', 'colorblind'] as ThemeOption[]).map((themeOption) => (
        <Scale key={themeOption} show={mode === themeOption} duration={200}>
          {getModeIcon(themeOption)}
        </Scale>
      ))}
    </Button>
  );
}
