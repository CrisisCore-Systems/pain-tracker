# 🧭 Enhanced Navigation & Menu System

**Version:** 1.0  
**Created:** 2025-11-12  
**Status:** Implemented (validate before production)  

---

## 🎯 Overview

A comprehensive, accessible navigation system for Pain Tracker with full keyboard support, screen reader compatibility, and modern UX patterns.

### What's Included

✅ **EnhancedNav** - Keyboard-navigable sidebar/toolbar navigation  
✅ **Breadcrumbs** - Hierarchical context with collapsing  
✅ **CommandPalette** - ⌘K-style quick launcher  
✅ **DropdownMenu** - Accessible dropdown with type-ahead  
✅ **NavigationHistory** - Alt+Tab style view switching  

---

## 🚀 Components

### 1. EnhancedNav

Fully accessible navigation component with keyboard shortcuts.

**Features:**
- Arrow key navigation (↑↓ vertical, ←→ horizontal)
- Number keys (1-9) for quick access
- Tab/Shift+Tab support
- Enter/Space to activate
- Custom keyboard shortcuts
- Visual focus indicators
- Badge support
- ARIA-compliant
- Screen reader friendly

**Usage:**
```tsx
import { EnhancedNav, type NavItem } from '@/components/navigation';
import { LayoutDashboard, Plus, TrendingUp } from 'lucide-react';

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    description: 'View overview',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: TrendingUp,
    badge: 'Pro',
    shortcut: '⌘A',
    description: 'View analytics',
  },
];

<EnhancedNav
  items={navItems}
  activeId={currentView}
  onNavigate={setCurrentView}
  orientation="vertical"
  size="md"
  variant="default"
  showShortcuts
  enableKeyboardNav
/>
```

**Props:**
```typescript
interface EnhancedNavProps {
  items: NavItem[];              // Navigation items
  activeId?: string;             // Currently active item
  onNavigate: (id: string) => void; // Navigation handler
  orientation?: 'horizontal' | 'vertical'; // Layout direction
  size?: 'sm' | 'md' | 'lg';    // Size variant
  variant?: 'default' | 'pills' | 'underline' | 'minimal'; // Style variant
  className?: string;            // Custom classes
  showShortcuts?: boolean;       // Show keyboard shortcuts
  enableKeyboardNav?: boolean;   // Enable keyboard navigation
}
```

**Keyboard Shortcuts:**
- `↑` / `↓` or `←` / `→` - Navigate items
- `Home` - First item
- `End` - Last item
- `1-9` - Quick access to items 1-9
- `Enter` or `Space` - Activate item

---

### 2. Breadcrumbs

Hierarchical navigation with smart collapsing.

**Features:**
- Home icon shortcut
- Collapsing middle items (for long paths)
- Customizable separators
- Keyboard accessible
- Responsive (collapses on mobile)
- ARIA navigation

**Usage:**
```tsx
import { Breadcrumbs, type BreadcrumbItem } from '@/components/navigation';

const breadcrumbItems: BreadcrumbItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'charts', label: 'Pain Charts', isCurrent: true },
];

<Breadcrumbs
  items={breadcrumbItems}
  onNavigate={handleNavigate}
  showHome
  maxItems={4} // Collapse if more than 4
/>
```

**Props:**
```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];       // Breadcrumb trail
  onNavigate?: (id: string) => void; // Navigation handler
  showHome?: boolean;            // Show home icon
  separator?: React.ReactNode;   // Custom separator
  className?: string;            // Custom classes
  maxItems?: number;             // Max items before collapsing
}
```

---

### 3. CommandPalette

⌘K-style quick launcher with fuzzy search.

**Features:**
- Fuzzy search across commands
- Keyboard-first navigation
- Recent items tracking
- Favorites support
- Categorized results
- Global keyboard shortcut (⌘K / Ctrl+K)
- Type-ahead in results
- Accessible modal dialog

**Usage:**
```tsx
import { CommandPalette, type CommandItem } from '@/components/navigation';
import { useState, useEffect } from 'react';

const [commandOpen, setCommandOpen] = useState(false);

const commands: CommandItem[] = [
  {
    id: 'new-entry',
    label: 'New Pain Entry',
    description: 'Create new entry',
    icon: Plus,
    category: 'Actions',
    keywords: ['add', 'create', 'log'],
    shortcut: '⌘N',
    action: () => createNewEntry(),
  },
  // ... more commands
];

// Global keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen(true);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);

<CommandPalette
  isOpen={commandOpen}
  onClose={() => setCommandOpen(false)}
  items={commands}
  recentItems={recentCommands}
  placeholder="Type a command or search..."
/>
```

**Props:**
```typescript
interface CommandPaletteProps {
  isOpen: boolean;               // Open state
  onClose: () => void;           // Close handler
  items: CommandItem[];          // All commands
  recentItems?: CommandItem[];   // Recent commands
  placeholder?: string;          // Search placeholder
  emptyMessage?: string;         // No results message
  className?: string;            // Custom classes
}
```

**Keyboard Shortcuts:**
- `⌘K` or `Ctrl+K` - Open palette
- `↑` / `↓` - Navigate results
- `Enter` - Execute command
- `Esc` - Close palette
- `Home` / `End` - First/last result

---

### 4. DropdownMenu

Accessible dropdown with full keyboard support.

**Features:**
- Arrow key navigation
- Type-ahead search
- Keyboard shortcuts display
- Dividers and sections
- Selected state indicators
- Dangerous actions styling
- Auto-positioning
- ARIA-compliant
- Focus management

**Usage:**
```tsx
import { DropdownMenu, type MenuItem } from '@/components/navigation';
import { Edit, Copy, Trash } from 'lucide-react';

const menuItems: MenuItem[] = [
  {
    id: 'edit',
    label: 'Edit Entry',
    icon: Edit,
    shortcut: '⌘E',
    action: () => editEntry(),
  },
  { id: 'divider-1', divider: true },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash,
    danger: true,
    action: () => deleteEntry(),
  },
];

<DropdownMenu
  trigger={<Button>Actions</Button>}
  items={menuItems}
  align="end"
  side="bottom"
/>
```

**Props:**
```typescript
interface DropdownMenuProps {
  trigger: React.ReactNode;      // Trigger element
  items: MenuItem[];             // Menu items
  align?: 'start' | 'end';       // Horizontal alignment
  side?: 'top' | 'bottom';       // Vertical placement
  className?: string;            // Custom classes
  menuClassName?: string;        // Menu custom classes
  onOpenChange?: (open: boolean) => void; // Open state handler
  closeOnSelect?: boolean;       // Close on item select
}
```

**Keyboard Shortcuts:**
- `↑` / `↓` - Navigate items
- `Home` / `End` - First/last item
- `Enter` or `Space` - Activate item
- `Esc` - Close menu
- Type letters - Type-ahead search

---

### 5. Navigation History Hook

Track and manage navigation history with Alt+Tab quick-switch.

**Features:**
- Navigation history tracking
- Quick switch between views (Alt+Tab)
- LocalStorage persistence
- LRU eviction
- Back/forward navigation
- Keyboard shortcuts

**Usage:**
```tsx
import { useNavigationHistory } from '@/components/navigation';

const {
  history,
  currentIndex,
  goBack,
  goForward,
  canGoBack,
  canGoForward,
  pushHistory,
  quickSwitch,
  getRecentItems,
} = useNavigationHistory({
  maxHistory: 50,
  persistKey: 'pain-tracker-nav-history',
  enableQuickSwitch: true,
});

// Push navigation
const handleNavigate = (viewId: string, label: string) => {
  setCurrentView(viewId);
  pushHistory({ id: viewId, label });
};

// Back button
<button onClick={() => {
  const prev = goBack();
  if (prev) setCurrentView(prev.id);
}} disabled={!canGoBack}>
  Back
</button>
```

**API:**
```typescript
interface UseNavigationHistory {
  // State
  history: NavigationHistoryItem[];
  currentIndex: number;
  currentItem: NavigationHistoryItem | null;
  isQuickSwitching: boolean;
  
  // Capabilities
  canGoBack: boolean;
  canGoForward: boolean;
  
  // Actions
  pushHistory: (item: Omit<NavigationHistoryItem, 'timestamp'>) => void;
  goBack: () => NavigationHistoryItem | null;
  goForward: () => NavigationHistoryItem | null;
  quickSwitch: () => NavigationHistoryItem | null;
  clearHistory: () => void;
  jumpToIndex: (index: number) => NavigationHistoryItem | null;
  
  // Utilities
  getRecentItems: (count?: number) => NavigationHistoryItem[];
}
```

**Keyboard Shortcuts:**
- `Alt+←` - Go back
- `Alt+→` - Go forward
- `Alt+Tab` - Quick switch (cycle through recent views)

---

## 🎨 Styling & Theming

All components support dark mode and are fully customizable with Tailwind CSS classes.

### Variants

**EnhancedNav Variants:**
- `default` - Gradient background for active items
- `pills` - Pill-shaped items
- `underline` - Bottom border indicator
- `minimal` - Minimal styling

**Sizes:**
- `sm` - Compact (mobile-friendly)
- `md` - Default
- `lg` - Large (desktop focus)

---

## ♿ Accessibility

### WCAG 2.x AA Target

✅ **Keyboard Navigation** - All components fully keyboard accessible  
✅ **Focus Management** - Proper focus indicators and trapping  
✅ **ARIA Labels** - Comprehensive ARIA attributes  
✅ **Screen Readers** - Descriptive labels and live regions  
✅ **Color Contrast** - Designed to meet contrast requirements (verify)  
✅ **Focus Visible** - Clear focus indicators  

### Screen Reader Support

All components include:
- Descriptive `aria-label` attributes
- `role` attributes for semantic meaning
- `aria-current` for current states
- `aria-disabled` for disabled states
- `aria-expanded` for expandable elements
- Live regions for dynamic updates

---

## 🎯 Best Practices

### 1. Always Provide Labels

```tsx
// ❌ Bad
<EnhancedNav items={items} onNavigate={handleNav} />

// ✅ Good
<nav aria-label="Main navigation">
  <EnhancedNav items={items} onNavigate={handleNav} />
</nav>
```

### 2. Use Descriptive Icons

```tsx
// ✅ Good
{
  id: 'analytics',
  name: 'Analytics',
  icon: TrendingUp,
  description: 'View detailed pain analytics', // Screen reader context
}
```

### 3. Implement Keyboard Shortcuts Consistently

```tsx
// Global shortcuts in app root
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 4. Persist Navigation State

```tsx
// Persist navigation history
const { pushHistory } = useNavigationHistory({
  persistKey: 'my-app-nav-history', // Enable persistence
});
```

### 5. Provide Breadcrumbs for Deep Navigation

```tsx
// Update breadcrumbs dynamically
const breadcrumbs = useMemo(() => {
  const items = [{ id: 'home', label: 'Home' }];
  
  if (currentSection) {
    items.push({ id: currentSection, label: sectionLabel });
  }
  
  if (currentSubsection) {
    items.push({
      id: currentSubsection,
      label: subsectionLabel,
      isCurrent: true,
    });
  }
  
  return items;
}, [currentSection, currentSubsection]);
```

---

## 🧪 Testing

### Keyboard Navigation Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedNav } from '@/components/navigation';

test('navigates with arrow keys', () => {
  const handleNavigate = jest.fn();
  render(
    <EnhancedNav items={items} activeId="item1" onNavigate={handleNavigate} />
  );
  
  const nav = screen.getByRole('navigation');
  fireEvent.keyDown(nav, { key: 'ArrowDown' });
  
  // Should focus next item
  expect(items[1].ref).toHaveFocus();
});
```

### Accessibility Tests

```typescript
import { axe } from 'jest-axe';

test('has no accessibility violations', async () => {
  const { container } = render(<NavigationDemo />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 📦 File Structure

```
src/components/navigation/
├── EnhancedNav.tsx           # Main navigation component
├── Breadcrumbs.tsx           # Breadcrumb navigation
├── CommandPalette.tsx        # ⌘K command palette
├── DropdownMenu.tsx          # Accessible dropdown
├── NavigationDemo.tsx        # Example implementation
└── index.ts                  # Exports

src/hooks/
└── useNavigationHistory.ts   # Navigation history hook
```

---

## 🚀 Getting Started

### 1. Install Dependencies

All components use existing Pain Tracker dependencies:
- React 18
- Lucide React (icons)
- Tailwind CSS (styling)

### 2. Import Components

```tsx
import {
  EnhancedNav,
  Breadcrumbs,
  CommandPalette,
  DropdownMenu,
  useNavigationHistory,
} from '@/components/navigation';
```

### 3. Implement Navigation

See `NavigationDemo.tsx` for a complete working example.

### 4. Customize Styling

All components accept `className` prop for custom Tailwind classes.

---

## 🔧 Configuration

### TypeScript Types

All components are fully typed with TypeScript interfaces.

### Custom Themes

Components respect the app's dark mode and support custom Tailwind theme colors.

---

## 📚 Related Documentation

- [ACCESSIBILITY_IMPLEMENTATION_COMPLETE.md](../accessibility/ACCESSIBILITY_IMPLEMENTATION_COMPLETE.md) - Accessibility guidelines
- [ARCHITECTURE_DEEP_DIVE.md](../../../ARCHITECTURE_DEEP_DIVE.md) - System architecture
- [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) - Development standards

---

## ✅ Checklist for Implementation

- [ ] Import navigation components
- [ ] Set up navigation state management
- [ ] Implement command palette with ⌘K shortcut
- [ ] Add breadcrumbs to header
- [ ] Enable navigation history tracking
- [ ] Test keyboard navigation
- [ ] Test screen reader support
- [ ] Add loading states
- [ ] Add error handling
- [ ] Document custom shortcuts

---

**Version:** 1.0  
**Last Updated:** 2025-11-12  
**Status:** Implemented (validate before production)
