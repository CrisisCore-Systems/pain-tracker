import React from 'react';
import { AdvocacyCard } from '../../types/advocacy';
import { X, AlertTriangle, Activity, Coffee, Info, VolumeX } from 'lucide-react';
import { cn } from '../../design-system/utils';

interface AdvocacyFlashCardProps {
    card: AdvocacyCard;
    onClose: () => void;
}

const THEME_STYLES: Record<string, string> = {
    default: 'bg-background text-foreground border-border',
    urgent: 'bg-red-600 text-white border-red-700 animate-pulse-slow',
    caution: 'bg-yellow-400 text-black border-yellow-500',
    calm: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900 dark:text-blue-100',
};

const ICONS: Record<string, React.ElementType> = {
    'Activity': Activity,
    'AlertTriangle': AlertTriangle,
    'Coffee': Coffee,
    'Info': Info,
    'VolumeX': VolumeX
};

export function AdvocacyFlashCard({ card, onClose }: AdvocacyFlashCardProps) {
    const Icon = card.icon ? ICONS[card.icon] : Info;
    const themeClass = THEME_STYLES[card.colorTheme] || THEME_STYLES.default;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-background/95 backdrop-blur-sm">
            <div 
                className={cn(
                    "w-full max-w-md h-[80vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border-4",
                    themeClass
                )}
            >
                <button 
                   onClick={onClose}
                   className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10"
                   aria-label="Close Flash Card"
                >
                    <X className="h-8 w-8" />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                    <Icon className="h-24 w-24 mb-4 stroke-[1.5]" />
                    
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                        {card.description}
                    </h1>
                    
                    {card.instructions && (
                        <div className="mt-8 p-4 bg-black/5 rounded-xl">
                             <p className="text-xl font-medium leading-relaxed">
                                {card.instructions}
                             </p>
                        </div>
                    )}
                </div>

                <div className="p-4 text-center text-sm opacity-70">
                    <p>Tap 'X' to close • Power: Advocacy Mode</p>
                </div>
            </div>
        </div>
    );
}
