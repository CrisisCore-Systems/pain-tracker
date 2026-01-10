import React, { useState, useEffect } from 'react';
import { Button } from '../../design-system/components/Button';
import { Card, CardContent } from '../../design-system/components/Card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '../../design-system/utils';

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASES: Record<Phase, { label: string; duration: number; instructions: string }> = {
    'inhale': { label: 'Inhale', duration: 4000, instructions: 'Breathe in slowly through your nose' },
    'hold-in': { label: 'Hold', duration: 4000, instructions: 'Hold your breath gently' },
    'exhale': { label: 'Exhale', duration: 4000, instructions: 'Breathe out slowly through your mouth' },
    'hold-out': { label: 'Hold', duration: 4000, instructions: 'Pause before the next breath' },
};

export function BreathingPacer() {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('inhale');
    
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isActive) {
            const currentDuration = PHASES[phase].duration;
            timeout = setTimeout(() => {
                setPhase((p) => {
                    if (p === 'inhale') return 'hold-in';
                    if (p === 'hold-in') return 'exhale';
                    if (p === 'exhale') return 'hold-out';
                    return 'inhale';
                });
            }, currentDuration);
        }

        return () => clearTimeout(timeout);
    }, [isActive, phase]);

    const reset = () => {
        setIsActive(false);
        setPhase('inhale');
    };

    const getScale = () => {
        if (phase === 'inhale') return 'scale-150'; // Growing
        if (phase === 'hold-in') return 'scale-150'; // Stay big
        if (phase === 'exhale') return 'scale-100'; // Shrinking
        return 'scale-100'; // Stay small
    };

    return (
        <Card className="w-full max-w-md mx-auto text-center border-2 border-primary/20">
            <CardContent className="pt-8 pb-8 space-y-8">
                <div className="h-64 flex items-center justify-center relative">
                    {/* Background rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                         <div className="w-32 h-32 rounded-full border-4 border-primary" />
                         <div className="w-48 h-48 rounded-full border-2 border-primary absolute" />
                    </div>

                    {/* Active circle */}
                    <div 
                        className={cn(
                            "w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm transition-all duration-[4000ms] ease-in-out font-bold text-2xl text-primary",
                            isActive ? getScale() : "scale-100"
                        )}
                    >
                        {isActive ? PHASES[phase].label : 'Ready'}
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-lg font-medium text-muted-foreground min-h-[1.75rem]">
                        {isActive ? PHASES[phase].instructions : 'Press play to begin Box Breathing (4-4-4-4)'}
                    </p>

                    <div className="flex justify-center space-x-4">
                        <Button 
                            onClick={() => setIsActive(!isActive)} 
                            size="lg"
                            variant={isActive ? "secondary" : "default"}
                        >
                            {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {isActive ? 'Pause' : 'Start'}
                        </Button>
                        <Button onClick={reset} variant="outline" size="lg" disabled={!isActive && phase === 'inhale'}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
