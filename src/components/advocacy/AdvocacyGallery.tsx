import React from 'react';
import { useAdvocacyStore } from '../../stores/advocacy-store';
import { Card, CardHeader, CardTitle, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button'; // Assuming Button is available
import { AdvocacyFlashCard } from './AdvocacyFlashCard';
import { Activity, AlertTriangle, Coffee, Info, VolumeX, Plus } from 'lucide-react';
import { cn } from '../../design-system/utils';

const ICONS: Record<string, React.ElementType> = {
    'Activity': Activity,
    'AlertTriangle': AlertTriangle,
    'Coffee': Coffee,
    'Info': Info,
    'VolumeX': VolumeX
};

const MINI_THEMES: Record<string, string> = {
    default: 'border-l-4 border-l-gray-400',
    urgent: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20',
    caution: 'border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-950/20',
    calm: 'border-l-4 border-l-blue-400 bg-blue-50 dark:bg-blue-950/20',
};

export function AdvocacyGallery() {
    const cards = useAdvocacyStore(state => state.cards);
    const activeCardId = useAdvocacyStore(state => state.activeCardId);
    const setActiveCard = useAdvocacyStore(state => state.setActiveCard);

    const activeCard = cards.find(c => c.id === activeCardId);

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Digital Advocacy Cards</h2>
                    {/* Placeholder for Add button - Future Phase */}
                    {/* <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button> */}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cards.map(card => {
                        const Icon = card.icon ? ICONS[card.icon] : Info;
                        return (
                            <button
                                key={card.id}
                                onClick={() => setActiveCard(card.id)}
                                className={cn(
                                    "text-left group relative flex flex-col items-start p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all shadow-sm hover:shadow-md",
                                    MINI_THEMES[card.colorTheme]
                                )}
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="font-semibold">{card.title}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {card.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeCard && (
                <AdvocacyFlashCard 
                    card={activeCard} 
                    onClose={() => setActiveCard(null)} 
                />
            )}
        </>
    );
}
