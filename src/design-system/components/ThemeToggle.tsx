/**
 * Theme Toggle Component
 * Allows users to switch between light and dark modes
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { Button } from './Button';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { mode, toggleMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      className={className}
      aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
};
