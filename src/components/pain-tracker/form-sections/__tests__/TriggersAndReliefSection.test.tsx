import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TriggersAndReliefSection } from '../TriggersAndReliefSection';

describe('TriggersAndReliefSection', () => {
  const defaultProps = {
    triggers: [] as string[],
    reliefMethods: [] as string[],
    quality: [] as string[],
    activities: [] as string[],
    activityLevel: 5,
    stress: 5,
    onChange: vi.fn(),
  };

  it('renders all section headers', () => {
    render(<TriggersAndReliefSection {...defaultProps} />);
    
    expect(screen.getByText('Triggers & Relief')).toBeInTheDocument();
    expect(screen.getByText('Activity Level Today')).toBeInTheDocument();
    expect(screen.getByText('Stress Level')).toBeInTheDocument();
  });

  it('displays trigger options as clickable checkboxes', () => {
    render(<TriggersAndReliefSection {...defaultProps} />);
    
    // Check that trigger options are rendered
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('calls onChange when a trigger is selected', () => {
    const onChange = vi.fn();
    render(<TriggersAndReliefSection {...defaultProps} onChange={onChange} />);
    
    // Click the first checkbox (a trigger)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    
    expect(onChange).toHaveBeenCalled();
    const callArg = onChange.mock.calls[0][0];
    expect(callArg).toHaveProperty('triggers');
  });

  it('renders activity level slider with correct value', () => {
    render(<TriggersAndReliefSection {...defaultProps} activityLevel={7} />);
    
    const activitySlider = screen.getByLabelText(/Activity level: 7/i);
    expect(activitySlider).toHaveValue('7');
  });

  it('calls onChange when activity slider changes', () => {
    const onChange = vi.fn();
    render(<TriggersAndReliefSection {...defaultProps} onChange={onChange} />);
    
    const activitySlider = screen.getByLabelText(/Activity level:/i);
    fireEvent.change(activitySlider, { target: { value: '8' } });
    
    expect(onChange).toHaveBeenCalledWith({ activityLevel: 8 });
  });

  it('renders stress level slider with correct value', () => {
    render(<TriggersAndReliefSection {...defaultProps} stress={3} />);
    
    const stressSlider = screen.getByLabelText(/Stress level: 3/i);
    expect(stressSlider).toHaveValue('3');
  });

  it('calls onChange when stress slider changes', () => {
    const onChange = vi.fn();
    render(<TriggersAndReliefSection {...defaultProps} onChange={onChange} />);
    
    const stressSlider = screen.getByLabelText(/Stress level:/i);
    fireEvent.change(stressSlider, { target: { value: '6' } });
    
    expect(onChange).toHaveBeenCalledWith({ stress: 6 });
  });

  it('shows selected state for pre-selected triggers', () => {
    render(
      <TriggersAndReliefSection 
        {...defaultProps} 
        triggers={['weather change']}
      />
    );
    
    const checkboxes = screen.getAllByRole('checkbox');
    const selectedCheckbox = checkboxes.find(cb => cb.getAttribute('aria-checked') === 'true');
    expect(selectedCheckbox).toBeTruthy();
  });

  it('has proper accessibility attributes for sliders', () => {
    render(<TriggersAndReliefSection {...defaultProps} />);
    
    // Check sliders have proper labels
    expect(screen.getByLabelText(/Activity level:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stress level:/i)).toBeInTheDocument();
  });

  it('renders relief method section', () => {
    render(<TriggersAndReliefSection {...defaultProps} />);
    
    expect(screen.getByText(/What has helped relieve your pain/i)).toBeInTheDocument();
  });

  it('renders pain quality section', () => {
    render(<TriggersAndReliefSection {...defaultProps} />);
    
    expect(screen.getByText(/How would you describe your pain/i)).toBeInTheDocument();
  });

  it('renders physical activities section', () => {
    render(<TriggersAndReliefSection {...defaultProps} />);
    
    expect(screen.getByText(/physical activities did you do today/i)).toBeInTheDocument();
  });
});
