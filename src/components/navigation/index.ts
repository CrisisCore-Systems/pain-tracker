/**
 * Enhanced Navigation Components
 *
 * A comprehensive suite of accessible navigation components for Pain Tracker
 *
 * Components:
 * - EnhancedNav: Keyboard-navigable navigation with shortcuts
 * - Breadcrumbs: Hierarchical navigation with collapsing
 * - CommandPalette: ⌘K-style quick navigation and search
 * - DropdownMenu: Accessible dropdown with keyboard support
 *
 * Hooks:
 * - useNavigationHistory: Track and manage navigation history with Alt+Tab quick-switch
 */

export { EnhancedNav } from './EnhancedNav';
export type { NavItem } from './EnhancedNav';

export { Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbItem } from './Breadcrumbs';

export { CommandPalette } from './CommandPalette';
export type { CommandItem, CommandGroup } from './CommandPalette';

export { DropdownMenu } from './DropdownMenu';
export type { MenuItem } from './DropdownMenu';

export { useNavigationHistory } from '../../hooks/useNavigationHistory';
export type { NavigationHistoryItem } from '../../hooks/useNavigationHistory';
