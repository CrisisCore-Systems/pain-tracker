import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../../design-system';

interface FormSection {
  id: string;
  title: string;
  component: React.ReactNode;
  isValid?: boolean;
}

interface MobileFormNavigationProps {
  sections: FormSection[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  onSubmit: () => void;
  submitLabel?: string;
  className?: string;
}

export function MobileFormNavigation({
  sections,
  currentSection,
  onSectionChange,
  onSubmit,
  submitLabel = 'Submit',
  className = ''
}: MobileFormNavigationProps) {
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  // Mark section as completed when user moves past it
  useEffect(() => {
    if (currentSection > 0) {
      setCompletedSections(prev => new Set([...prev, currentSection - 1]));
    }
  }, [currentSection]);

  const handlePrevious = () => {
    if (currentSection > 0) {
      onSectionChange(currentSection - 1);
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      onSectionChange(currentSection + 1);
    }
  };

  const isLastSection = currentSection === sections.length - 1;
  const canGoNext = currentSection < sections.length - 1;
  const canGoPrevious = currentSection > 0;

  return (
    <div className={`mobile-form-navigation ${className}`}>
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          {/* Progress Bar */}
          <div className="flex items-center mb-3">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              />
            </div>
            <span className="ml-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
              {currentSection + 1} of {sections.length}
            </span>
          </div>

          {/* Section Title */}
          <h2 className="text-lg font-semibold text-foreground">
            {sections[currentSection]?.title}
          </h2>

          {/* Section Indicators */}
          <div className="flex items-center space-x-2 mt-2 overflow-x-auto pb-1">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(index)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  index === currentSection
                    ? 'bg-primary text-primary-foreground'
                    : completedSections.has(index)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : index < currentSection
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : 'bg-muted/50 text-muted-foreground/70'
                }`}
              >
                {completedSections.has(index) && (
                  <Check className="h-3 w-3" />
                )}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 py-6">
        {sections[currentSection]?.component}
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="flex items-center space-x-2 min-w-fit"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <div className="flex-1 text-center">
              {/* Quick jump to sections */}
              <div className="flex justify-center space-x-1">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onSectionChange(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSection
                        ? 'bg-primary w-4'
                        : completedSections.has(index)
                        ? 'bg-green-400'
                        : index < currentSection
                        ? 'bg-muted'
                        : 'bg-muted/50'
                    }`}
                    aria-label={`Go to ${sections[index].title}`}
                  />
                ))}
              </div>
            </div>

            {isLastSection ? (
              <Button
                type="submit"
                onClick={onSubmit}
                className="flex items-center space-x-2 min-w-fit bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                <span>{submitLabel}</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                className="flex items-center space-x-2 min-w-fit"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Section completion status */}
          <div className="mt-3 flex justify-center">
            <div className="text-xs text-muted-foreground">
              {completedSections.size} of {sections.length} sections completed
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Gesture Hints */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs animate-pulse">
          Swipe left/right to navigate
        </div>
      </div>
    </div>
  );
}

// Hook for keyboard navigation support
export function useKeyboardNavigation(
  currentSection: number,
  sectionsLength: number,
  onSectionChange: (index: number) => void,
  onSubmit: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentSection > 0) {
            onSectionChange(currentSection - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentSection < sectionsLength - 1) {
            onSectionChange(currentSection + 1);
          }
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (currentSection === sectionsLength - 1) {
              onSubmit();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, sectionsLength, onSectionChange, onSubmit]);
}