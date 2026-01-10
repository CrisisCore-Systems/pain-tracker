import React, { useState } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { useEnergyStore } from '../../stores/energy-store';
import { EnergyCategory } from '../../types/energy';
import { Zap, Brain, Heart, Users, Bed } from 'lucide-react';
import { cn } from '../../design-system/utils';

interface EnergyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: EnergyCategory; label: string; icon: React.ElementType }[] = [
    { id: 'physical', label: 'Physical', icon: Zap },
    { id: 'cognitive', label: 'Mental', icon: Brain },
    { id: 'emotional', label: 'Emotional', icon: Heart },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'rest', label: 'Rest', icon: Bed },
];

export function EnergyLogModal({ isOpen, onClose }: EnergyLogModalProps) {
    const logTransaction = useEnergyStore(s => s.logTransaction);
    const [activityName, setActivityName] = useState('');
    const [cost, setCost] = useState(1);
    const [category, setCategory] = useState<EnergyCategory>('physical');
    const [isRestorative, setIsRestorative] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCost = isRestorative ? -Math.abs(cost) : Math.abs(cost);
        
        logTransaction({
            activityName,
            cost: finalCost,
            category
        });
        
        // Reset
        setActivityName('');
        setCost(1);
        setIsRestorative(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Energy Activity">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <Input 
                   label="Activity Name"
                   value={activityName} 
                   onChange={(e) => setActivityName(e.target.value)}
                   placeholder="e.g., Grocery Shopping"
                   required
                   autoFocus
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">Category</label>
                 <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={cn(
                              "flex flex-col items-center justify-center p-2 rounded-md border text-sm transition-colors",
                              category === cat.id 
                                ? "bg-primary text-primary-foreground border-primary"
                                : "hover:bg-muted border-transparent"
                          )}
                        >
                            <cat.icon className="h-5 w-5 mb-1" />
                            {cat.label}
                        </button>
                    ))}
                 </div>
               </div>

               <div>
                 <label htmlFor="energy-impact" className="block text-sm font-medium mb-1">
                    Energy Impact ({isRestorative ? 'Gain' : 'Drain'})
                 </label>
                 <div className="flex items-center gap-4">
                     <div className="flex-1">
                        <input 
                            id="energy-impact"
                            type="range" 
                            min="0.5" 
                            max="10" 
                            step="0.5"
                            value={cost}
                            onChange={(e) => setCost(parseFloat(e.target.value))}
                            className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                     </div>
                     <span className="font-mono font-bold w-12 text-center text-lg">{cost}</span>
                 </div>
                 
                 <div className="mt-2 flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="isRestorative"
                        checked={isRestorative} 
                        onChange={(e) => setIsRestorative(e.target.checked)}
                        className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isRestorative" className="text-sm select-none">This activity restored energy</label>
                 </div>
               </div>
               
               <div className="flex justify-end pt-4">
                   <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
                   <Button type="submit" disabled={!activityName}>Save Entry</Button>
               </div>
            </form>
        </Modal>
    );
}
