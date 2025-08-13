/**
 * ContextualHelp - Component for providing context-sensitive help and guidance
 */

import { useState } from 'react';
import { HelpCircle, BookOpen, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';

interface HelpSection {
  title: string;
  content: string;
  type: 'info' | 'tip' | 'warning';
}

interface ContextualHelpProps {
  sections: HelpSection[];
  title: string;
  className?: string;
}

export function ContextualHelp({ sections, title, className = '' }: ContextualHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (type: HelpSection['type']) => {
    switch (type) {
      case 'info':
        return <BookOpen className="h-4 w-4" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4" />;
      case 'warning':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTypeStyles = (type: HelpSection['type']) => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30';
      case 'tip':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30';
      case 'warning':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30';
      default:
        return 'border-border bg-muted/50';
    }
  };

  const getIconStyles = (type: HelpSection['type']) => {
    switch (type) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'tip':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={className}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={isExpanded}
        aria-controls="contextual-help-content"
      >
        <HelpCircle className="h-4 w-4" />
        <span>{isExpanded ? 'Hide' : 'Show'} help for {title}</span>
      </button>

      {isExpanded && (
        <div id="contextual-help-content" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>{title} Help</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getTypeStyles(section.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${getIconStyles(section.type)}`}>
                      {getIcon(section.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{section.title}</h4>
                      <p className="text-sm text-muted-foreground">{section.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}