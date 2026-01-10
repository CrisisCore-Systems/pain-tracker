import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { BreathingPacer } from './BreathingPacer';
import { Wind, Headphones, Anchor } from 'lucide-react';
import { Modal } from '../../design-system/components/Modal';

export function InterventionVault() {
    const [selectedTool, setSelectedTool] = useState<'breathing' | null>(null);

    return (
        <Card className="h-full border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Anchor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Crisis Intervention</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button 
                    onClick={() => setSelectedTool('breathing')}
                    variant="outline" 
                    className="w-full justify-start h-14 space-x-4 border-blue-200 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900"
                >
                    <Wind className="h-6 w-6 text-blue-500" />
                    <div className="flex flex-col items-start">
                         <span className="font-semibold">Box Breathing</span>
                         <span className="text-xs font-normal opacity-70">Calm your nervous system (4-4-4)</span>
                    </div>
                </Button>

                <Modal 
                    isOpen={selectedTool === 'breathing'} 
                    onClose={() => setSelectedTool(null)}
                    title="Breathing Pacer"
                >
                    <BreathingPacer />
                </Modal>

                {/* Placeholders for Phase 4.3 continued */}
                <Button variant="ghost" disabled className="w-full justify-start h-14 space-x-4 opacity-50">
                    <Headphones className="h-6 w-6" />
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Audio Grounding</span>
                        <span className="text-xs font-normal">Coming Soon</span>
                    </div>
                </Button>
            </CardContent>
        </Card>
    );
}
