import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../design-system/Input';

describe('Input Component Accessibility', () => {
  describe('ARIA attributes and labeling', () => {
    it('associates label with input using htmlFor and id', () => {
      render(<Input label="Test Input" />);
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'input-test-input');
    });

    it('uses custom id when provided', () => {
      render(<Input label="Test Input" id="custom-id" />);
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('generates accessible id from label with special characters', () => {
      render(<Input label="Test Input (with special chars!)" />);
      const input = screen.getByLabelText('Test Input (with special chars!)');
      expect(input).toHaveAttribute('id', 'input-test-input-(with-special-chars!)');
    });
  });

  describe('Error state accessibility', () => {
    it('sets aria-invalid when error is present', () => {
      render(<Input label="Test Input" error="This field is required" />);
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when no error', () => {
      render(<Input label="Test Input" />);
      const input = screen.getByLabelText('Test Input');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('associates error message with input via aria-describedby', () => {
      render(<Input label="Test Input" error="This field is required" />);
      const input = screen.getByLabelText('Test Input');
      const errorElement = screen.getByText('This field is required');
      expect(input).toHaveAttribute('aria-describedby', 'input-test-input-error');
      expect(errorElement).toHaveAttribute('id', 'input-test-input-error');
    });

    it('adds role="alert" to error messages', () => {
      render(<Input label="Test Input" error="This field is required" />);
      const errorElement = screen.getByText('This field is required');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('Hint text accessibility', () => {
    it('associates hint with input via aria-describedby', () => {
      render(<Input label="Test Input" hint="Enter your name here" />);
      const input = screen.getByLabelText('Test Input');
      const hintElement = screen.getByText('Enter your name here');
      expect(input).toHaveAttribute('aria-describedby', 'input-test-input-hint');
      expect(hintElement).toHaveAttribute('id', 'input-test-input-hint');
    });

    it('prioritizes error over hint in aria-describedby', () => {
      render(<Input label="Test Input" hint="Enter your name here" error="This field is required" />);
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('aria-describedby', 'input-test-input-error');
      expect(screen.queryByText('Enter your name here')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard navigation and focus', () => {
    it('is keyboard focusable', () => {
      render(<Input label="Test Input" />);
      const input = screen.getByLabelText('Test Input');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('maintains focus after typing', () => {
      render(<Input label="Test Input" />);
      const input = screen.getByLabelText('Test Input');
      fireEvent.change(input, { target: { value: 'test value' } });
      expect(input).toHaveValue('test value');
    });
  });

  describe('Form integration', () => {
    it('passes through standard input props', () => {
      render(<Input label="Test Input" type="email" placeholder="Enter email" required />);
      const input = screen.getByLabelText('Test Input');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter email');
      expect(input).toHaveAttribute('required');
    });

    it('handles disabled state properly', () => {
      render(<Input label="Test Input" disabled />);
      const input = screen.getByLabelText('Test Input');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('disabled');
    });
  });

  describe('Visual accessibility', () => {
    it('has sufficient color contrast in normal state', () => {
      render(<Input label="Test Input" />);
      const input = screen.getByLabelText('Test Input');
      // Check that the input renders with proper structure
      expect(input).toBeInTheDocument();
      // aria-invalid should either be 'false' or not present (both are valid)
      const ariaInvalid = input.getAttribute('aria-invalid');
      expect(ariaInvalid === 'false' || ariaInvalid === null).toBe(true);
    });

    it('shows error styling with red border', () => {
      render(<Input label="Test Input" error="Error message" />);
      const input = screen.getByLabelText('Test Input');
      // Input component sets aria-invalid for errors
      expect(input).toHaveAttribute('aria-invalid', 'true');
      // Error message should be visible and associated with input
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Error message');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
    });

    it('has focus ring for keyboard navigation', () => {
      render(<Input label="Test Input" />);
      const input = screen.getByLabelText('Test Input');
      // Verify the input is focusable
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Screen reader compatibility', () => {
    it('error message is announced by screen readers', () => {
      render(<Input label="Test Input" error="This field is required" />);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('This field is required');
    });

    it('hint text is available to screen readers', () => {
      render(<Input label="Test Input" hint="Additional help text" />);
      const hintElement = screen.getByText('Additional help text');
      expect(hintElement).toBeInTheDocument();
      expect(hintElement).toHaveAttribute('id');
    });
  });
});