
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DailyLiving from './DailyLiving';

describe('DailyLiving Component', () => {
  const mockQualityOfLife = {
    sleepQuality: 7,
    moodImpact: 6,
    socialImpact: ['Reduced Social Activities', 'Limited Family Time']
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders without crashing', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    expect(screen.getByText('Sleep Quality')).toBeInTheDocument();
    expect(screen.getByText('Mood Impact')).toBeInTheDocument();
    expect(screen.getByText('Social Impact')).toBeInTheDocument();
  });

  it('displays current sleep quality', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    expect(screen.getByText('Good')).toBeInTheDocument(); // Sleep quality 7 maps to 'Good'
  });

  it('displays current mood impact', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    expect(screen.getByText('Slightly Positive')).toBeInTheDocument(); // Mood impact 6 maps to 'Slightly Positive'
  });

  it('displays existing social impacts', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    expect(screen.getByText('Reduced Social Activities')).toBeInTheDocument();
    expect(screen.getByText('Limited Family Time')).toBeInTheDocument();
  });

  it('allows updating sleep quality', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    
    const slider = screen.getByRole('slider', { name: '' });
    fireEvent.change(slider, { target: { value: '8' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockQualityOfLife,
      sleepQuality: 8
    });
  });

  it('allows updating mood impact', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[1], { target: { value: '7' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockQualityOfLife,
      moodImpact: 7
    });
  });

  it('allows adding custom social impact', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('Add custom social impact...');
    fireEvent.change(input, { target: { value: 'New Impact' } });
    
    const addButton = screen.getByRole('button', { name: 'Add impact' });
    fireEvent.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockQualityOfLife,
      socialImpact: [...mockQualityOfLife.socialImpact, 'New Impact']
    });
  });

  it('allows removing social impact', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    
    const removeButtons = screen.getAllByRole('button', { name: 'Remove impact' });
    fireEvent.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockQualityOfLife,
      socialImpact: ['Limited Family Time']
    });
  });

  it('allows toggling common social impacts', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    
    const isolationButton = screen.getByRole('button', { name: 'Isolation' });
    fireEvent.click(isolationButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockQualityOfLife,
      socialImpact: [...mockQualityOfLife.socialImpact, 'Isolation']
    });
  });

  it('shows correct number of social impacts in summary', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    expect(screen.getByText('Social Impacts: 2 reported')).toBeInTheDocument();
  });

  it('prevents adding empty social impact', () => {
    render(<DailyLiving qualityOfLife={mockQualityOfLife} onChange={mockOnChange} />);
    
    const addButton = screen.getByRole('button', { name: 'Add impact' });
    fireEvent.click(addButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });
}); 