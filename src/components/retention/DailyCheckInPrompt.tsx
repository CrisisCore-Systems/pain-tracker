/**
 * Daily Check-In Prompt Component
 * 
 * Displays gentle daily prompts to encourage regular check-ins.
 * Enhanced with adaptive selection, smooth animations, and comprehensive accessibility.
 */

import React, { useEffect, useState, useRef } from 'react';
import { retentionLoopService } from '@pain-tracker/services';
import type { DailyPrompt } from '@pain-tracker/services';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { MessageCircle, X, CheckCircle } from 'lucide-react';
import { getAnimationConfig, celebrateMilestone } from '../../utils/retention-animations';

interface DailyCheckInPromptProps {
  entries?: any[]; // For adaptive prompt selection
  onStartCheckIn?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const DailyCheckInPrompt: React.FC<DailyCheckInPromptProps> = ({
  entries = [],
  onStartCheckIn,
  onDismiss,
  className = '',
}) => {
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dailyPrompt = retentionLoopService.getDailyPrompt(entries);
    if (dailyPrompt) {
      setPrompt(dailyPrompt);
      setIsVisible(true);
      setIsAnimating(true);
      
      // Announce to screen readers
      if (announcementRef.current) {
        announcementRef.current.textContent = `New check-in prompt: ${dailyPrompt.text}`;
      }
      
      // Remove animation class after animation completes
      setTimeout(() => setIsAnimating(false), 400);
    }
  }, [entries]);

  const handleStartCheckIn = () => {
    if (prompt) {
      retentionLoopService.markPromptShown(prompt.id, true);
      retentionLoopService.recordCheckIn();
      
      // Celebrate milestone if applicable
      const state = retentionLoopService.getState();
      if (state.consecutiveDays === 3 || state.consecutiveDays === 7) {
        if (cardRef.current) {
          celebrateMilestone(
            cardRef.current,
            `${state.consecutiveDays} days in a row! 🎉`
          );
        }
      }
    }
    
    setIsVisible(false);
    onStartCheckIn?.();
  };

  const handleDismiss = () => {
    if (prompt) {
      retentionLoopService.markPromptShown(prompt.id, false);
    }
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !prompt) {
    return null;
  }

  const getToneColor = (tone: DailyPrompt['tone']) => {
    switch (tone) {
      case 'gentle':
        return 'bg-purple-50 border-purple-200';
      case 'encouraging':
        return 'bg-green-50 border-green-200';
      case 'curious':
        return 'bg-blue-50 border-blue-200';
      case 'neutral':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIcon = () => {
    switch (prompt.category) {
      case 'check-in':
        return <MessageCircle className="w-5 h-5" aria-hidden="true" />;
      case 'celebration':
        return <CheckCircle className="w-5 h-5" aria-hidden="true" />;
      default:
        return <MessageCircle className="w-5 h-5" aria-hidden="true" />;
    }
  };

  const animationClass = isAnimating ? 'animate-slide-in-top' : '';

  return (
    <>
      {/* Screen reader announcement */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      <Card 
        ref={cardRef}
        className={`${getToneColor(prompt.tone)} border-2 ${animationClass} ${className}`}
        role="region"
        aria-label="Daily check-in prompt"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getIcon()}
              <CardTitle className="text-lg" id="prompt-title">Daily Check-In</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              aria-label="Dismiss daily check-in prompt"
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base mb-4 text-gray-700" id="prompt-text">
            {prompt.text}
          </p>
          <div className="flex gap-2" role="group" aria-labelledby="prompt-title">
            <Button 
              onClick={handleStartCheckIn} 
              className="flex-1 transition-all hover:scale-105"
              aria-describedby="prompt-text"
            >
              Start Check-In
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="transition-all hover:scale-105"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
  };

  if (!isVisible || !prompt) {
    return null;
  }

  const getToneColor = (tone: DailyPrompt['tone']) => {
    switch (tone) {
      case 'gentle':
        return 'bg-purple-50 border-purple-200';
      case 'encouraging':
        return 'bg-green-50 border-green-200';
      case 'curious':
        return 'bg-blue-50 border-blue-200';
      case 'neutral':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIcon = () => {
    switch (prompt.category) {
      case 'check-in':
        return <MessageCircle className="w-5 h-5" />;
      case 'celebration':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  return (
    <Card className={`${getToneColor(prompt.tone)} border-2 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">Daily Check-In</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            aria-label="Dismiss prompt"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base mb-4 text-gray-700">{prompt.text}</p>
        <div className="flex gap-2">
          <Button onClick={handleStartCheckIn} className="flex-1">
            Start Check-In
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
