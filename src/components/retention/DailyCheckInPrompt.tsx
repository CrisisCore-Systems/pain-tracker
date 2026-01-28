/**
 * Daily Check-In Prompt Component
 * 
 * Displays gentle daily prompts to encourage regular check-ins.
 * Supports multiple tones and respects user preferences.
 */

import React, { useEffect, useState } from 'react';
import { retentionLoopService } from '@pain-tracker/services';
import type { DailyPrompt } from '@pain-tracker/services';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { MessageCircle, X, CheckCircle } from 'lucide-react';

interface DailyCheckInPromptProps {
  onStartCheckIn?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const DailyCheckInPrompt: React.FC<DailyCheckInPromptProps> = ({
  onStartCheckIn,
  onDismiss,
  className = '',
}) => {
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dailyPrompt = retentionLoopService.getDailyPrompt();
    if (dailyPrompt) {
      setPrompt(dailyPrompt);
      setIsVisible(true);
    }
  }, []);

  const handleStartCheckIn = () => {
    if (prompt) {
      retentionLoopService.markPromptShown();
      retentionLoopService.recordCheckIn();
    }
    setIsVisible(false);
    onStartCheckIn?.();
  };

  const handleDismiss = () => {
    if (prompt) {
      retentionLoopService.markPromptShown();
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
