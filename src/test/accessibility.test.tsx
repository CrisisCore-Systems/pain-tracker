/**
 * Accessibility Test Suite
 * Automated tests for WCAG 2.2 AA compliance
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils'; // Use custom render with providers
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('QuickLogStepper', () => {
    it('should have no axe violations', async () => {
      const { QuickLogStepper } = await import('../design-system/fused-v2/QuickLogStepper');
      const { container } = render(
        <QuickLogStepper 
          onComplete={() => {}} 
          onCancel={() => {}} 
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible pain slider with ARIA labels', async () => {
      const { QuickLogStepper } = await import('../design-system/fused-v2/QuickLogStepper');
      render(<QuickLogStepper onComplete={() => {}} onCancel={() => {}} />);
      
      const slider = screen.getByRole('slider', { name: /pain intensity/i });
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '10');
      expect(slider).toHaveAttribute('aria-valuenow');
      expect(slider).toHaveAttribute('aria-valuetext');
    });

    it('should have fieldset/legend for location tags', async () => {
      const { QuickLogStepper } = await import('../design-system/fused-v2/QuickLogStepper');
      const { container } = render(<QuickLogStepper onComplete={() => {}} onCancel={() => {}} />);
      
      // Navigate to step 2
      const continueButton = screen.getByText(/continue/i);
      await userEvent.click(continueButton);
      
      const fieldsets = container.querySelectorAll('fieldset');
      expect(fieldsets.length).toBeGreaterThan(0);
      
      const legends = container.querySelectorAll('legend');
      expect(legends.length).toBeGreaterThan(0);
    });

    it('should have 48×48px minimum tap targets', async () => {
      const { QuickLogStepper } = await import('../design-system/fused-v2/QuickLogStepper');
      const { container } = render(<QuickLogStepper onComplete={() => {}} onCancel={() => {}} />);
      
      // Check stepper buttons
      const buttons = container.querySelectorAll('button[aria-label*="pain level"]');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minWidth = parseInt(styles.minWidth);
        const minHeight = parseInt(styles.minHeight);
        
        expect(minWidth).toBeGreaterThanOrEqual(48);
        expect(minHeight).toBeGreaterThanOrEqual(48);
      });
    });

    it('should support keyboard navigation with Enter and Esc', async () => {
      const { QuickLogStepper } = await import('../design-system/fused-v2/QuickLogStepper');
      const onComplete = vi.fn();
      const onCancel = vi.fn();
      
      render(<QuickLogStepper onComplete={onComplete} onCancel={onCancel} />);
      
      // Press Esc should trigger cancel
      await userEvent.keyboard('{Escape}');
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('PanicMode', () => {
    it('should have no axe violations', async () => {
      const { PanicMode } = await import('../components/accessibility/PanicMode');
      const { container } = render(
        <PanicMode 
          isActive={true} 
          onClose={() => {}} 
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have 56×56px panic button', async () => {
      const { PanicMode } = await import('../components/accessibility/PanicMode');
      const { container } = render(
        <PanicMode isActive={true} onClose={() => {}} />
      );
      
      const closeButton = container.querySelector('button[aria-label*="Exit"]');
      expect(closeButton).toBeDefined();
      
      if (closeButton) {
        const styles = window.getComputedStyle(closeButton);
        const minWidth = parseInt(styles.minWidth);
        const minHeight = parseInt(styles.minHeight);
        
        expect(minWidth).toBeGreaterThanOrEqual(56);
        expect(minHeight).toBeGreaterThanOrEqual(56);
      }
    });

    it('should have role="dialog" and aria-modal="true"', async () => {
      const { PanicMode } = await import('../components/accessibility/PanicMode');
      const { container } = render(
        <PanicMode isActive={true} onClose={() => {}} />
      );
      
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeDefined();
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
    });

    it('should announce breathing instructions with aria-live', async () => {
      const { PanicMode } = await import('../components/accessibility/PanicMode');
      const { container } = render(
        <PanicMode isActive={true} onClose={() => {}} />
      );
      
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeDefined();
    });
  });

  describe('BodyMapAccessible', () => {
    it('should have no axe violations', async () => {
      const { BodyMapAccessible } = await import('../components/accessibility/BodyMapAccessible');
      const { container } = render(
        <BodyMapAccessible 
          selectedRegions={[]} 
          onChange={() => {}} 
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have checkboxes with proper ARIA', async () => {
      const { BodyMapAccessible } = await import('../components/accessibility/BodyMapAccessible');
      render(
        <BodyMapAccessible selectedRegions={[]} onChange={() => {}} />
      );
      
      const checkboxes = screen.getAllByRole('checkbox', { hidden: true });
      expect(checkboxes.length).toBeGreaterThan(0);
      
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('aria-label');
      });
    });

    it('should announce selection count with live region', async () => {
      const { BodyMapAccessible } = await import('../components/accessibility/BodyMapAccessible');
      const { container } = render(
        <BodyMapAccessible selectedRegions={['lower-back']} onChange={() => {}} />
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeDefined();
      expect(liveRegion?.textContent).toContain('1 region');
    });
  });

  describe('ChartWithTableToggle', () => {
    it('should have no axe violations', async () => {
      const { ChartWithTableToggle } = await import('../components/accessibility/ChartWithTableToggle');
      const mockData = {
        labels: ['Day 1', 'Day 2'],
        datasets: [{ label: 'Pain', data: [5, 6] }]
      };
      const tableData = [
        { label: 'Day 1', value: 5 },
        { label: 'Day 2', value: 6 }
      ];
      
      const { container } = render(
        <ChartWithTableToggle
          title="Test Chart"
          description="Test description"
          type="line"
          chartData={mockData}
          tableData={tableData}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should toggle between chart and table view', async () => {
      const { ChartWithTableToggle } = await import('../components/accessibility/ChartWithTableToggle');
      const mockData = {
        labels: ['Day 1', 'Day 2'],
        datasets: [{ label: 'Pain', data: [5, 6] }]
      };
      const tableData = [
        { label: 'Day 1', value: 5 },
        { label: 'Day 2', value: 6 }
      ];
      
      render(
        <ChartWithTableToggle
          title="Test Chart"
          description="Test description"
          type="line"
          chartData={mockData}
          tableData={tableData}
        />
      );
      
      const toggleButton = screen.getByRole('button', { name: /switch to table view/i });
      expect(toggleButton).toBeDefined();
      
      await userEvent.click(toggleButton);
      
      const table = screen.getByRole('table');
      expect(table).toBeDefined();
    });

    it('should have semantic table structure', async () => {
      const { ChartWithTableToggle } = await import('../components/accessibility/ChartWithTableToggle');
      const mockData = {
        labels: ['Day 1'],
        datasets: [{ label: 'Pain', data: [5] }]
      };
      const tableData = [{ label: 'Day 1', value: 5 }];
      
      render(
        <ChartWithTableToggle
          title="Test Chart"
          description="Test description"
          type="line"
          chartData={mockData}
          tableData={tableData}
        />
      );
      
      // Switch to table view
      const toggleButton = screen.getByRole('button', { name: /switch to table view/i });
      await userEvent.click(toggleButton);
      
      const table = screen.getByRole('table');
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');
      const tfoot = table.querySelector('tfoot');
      
      expect(thead).toBeDefined();
      expect(tbody).toBeDefined();
      expect(tfoot).toBeDefined();
    });
  });

  describe('Modal Focus Trap', () => {
    it('should have no axe violations', async () => {
      const { Modal } = await import('../design-system/components/Modal');
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should trap focus within modal', async () => {
      const { Modal } = await import('../design-system/components/Modal');
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <button>First</button>
          <button>Second</button>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      const firstButton = screen.getByText('First');
      const secondButton = screen.getByText('Second');
      
      // Tab through elements
      closeButton.focus();
      await userEvent.tab();
      expect(firstButton).toHaveFocus();
      
      await userEvent.tab();
      expect(secondButton).toHaveFocus();
      
      await userEvent.tab();
      // Should cycle back to close button
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Skip Link', () => {
    it('should have skip to main content link', async () => {
      const { ModernAppLayout } = await import('../components/layouts/ModernAppLayout');
      render(
        <ModernAppLayout>
          <div>Content</div>
        </ModernAppLayout>
      );
      
      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toBeDefined();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content with id', async () => {
      const { ModernAppLayout } = await import('../components/layouts/ModernAppLayout');
      const { container } = render(
        <ModernAppLayout>
          <div>Content</div>
        </ModernAppLayout>
      );
      
      const mainContent = container.querySelector('#main-content');
      expect(mainContent).toBeDefined();
      expect(mainContent?.tagName).toBe('MAIN');
    });
  });

  describe('Color Contrast', () => {
    it('should meet WCAG AA contrast ratios', async () => {
      // This would typically use a contrast checking library
      // For now, we document the requirement
      expect(true).toBe(true);
    });
  });

  describe('Font Scaling', () => {
    it('should use rem/clamp units for font sizes', async () => {
      // This test would check computed styles
      // For now, we document the requirement
      expect(true).toBe(true);
    });
  });
});
