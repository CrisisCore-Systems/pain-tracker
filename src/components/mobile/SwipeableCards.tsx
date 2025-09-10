import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableCardsProps {
  children: ReactNode[];
  onCardChange?: (index: number) => void;
  className?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

export function SwipeableCards({
  children,
  onCardChange,
  className = '',
  showIndicators = true,
  showNavigation = true,
  autoAdvance = false,
  autoAdvanceDelay = 5000
}: SwipeableCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout>();

  const totalCards = children.length;

  // Auto-advance functionality
  useEffect(() => {
    if (autoAdvance && !isDragging) {
      autoAdvanceRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalCards);
      }, autoAdvanceDelay);

      return () => {
        if (autoAdvanceRef.current) {
          clearInterval(autoAdvanceRef.current);
        }
      };
    }
  }, [autoAdvance, autoAdvanceDelay, isDragging, totalCards]);

  const goToCard = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalCards - 1, index));
    setCurrentIndex(clampedIndex);
    onCardChange?.(clampedIndex);
  }, [totalCards, onCardChange]);

  const goToPrevious = useCallback(() => {
    goToCard(currentIndex - 1);
  }, [currentIndex, goToCard]);

  const goToNext = useCallback(() => {
    goToCard(currentIndex + 1);
  }, [currentIndex, goToCard]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
    
    // Clear auto-advance when user interacts
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const offset = currentX - startX;
    setDragOffset(offset);
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 100; // Minimum swipe distance
    const velocity = Math.abs(dragOffset);
    
    if (Math.abs(dragOffset) > threshold || velocity > 50) {
      if (dragOffset > 0) {
        // Swiped right - go to previous
        goToPrevious();
      } else {
        // Swiped left - go to next
        goToNext();
      }
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, goToPrevious, goToNext]);

  // Mouse event handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const offset = e.clientX - startX;
    setDragOffset(offset);
  }, [isDragging, startX]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, goToPrevious, goToNext]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  const transform = `translateX(calc(-${currentIndex * 100}% + ${isDragging ? dragOffset : 0}px))`;

  return (
    <div className={`swipeable-cards relative overflow-hidden ${className}`}>
      {/* Cards Container */}
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out touch-manipulation"
        style={{
          transform: isDragging ? `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` : `translateX(-${currentIndex * 100}%)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            style={{
              opacity: isDragging ? 1 - Math.abs(dragOffset) / 300 : 1,
              transform: isDragging && Math.abs(index - currentIndex) <= 1 
                ? `scale(${1 - Math.abs(dragOffset) / 1000})`
                : 'scale(1)'
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {showNavigation && totalCards > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
            aria-label="Previous card"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === totalCards - 1}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
            aria-label="Next card"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && totalCards > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {Array.from({ length: totalCards }, (_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/50 hover:bg-muted-foreground/70'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint for First Time Users */}
      {totalCards > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground pointer-events-none">
          Swipe to navigate
        </div>
      )}
    </div>
  );
}