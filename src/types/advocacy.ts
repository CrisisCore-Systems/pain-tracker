export interface AdvocacyCard {
    id: string;
    title: string;
    description: string; // The main big text
    instructions?: string; // Smaller detailed instructions
    icon?: string; // Icon name from lucide-react
    colorTheme: 'default' | 'urgent' | 'caution' | 'calm';
    isDefault?: boolean;
}

export const DEFAULT_ADVOCACY_CARDS: AdvocacyCard[] = [
    {
        id: 'chronic-pain',
        title: 'Non-Verbal / Pain Episode',
        description: 'I am having a Chronic Pain Flare.',
        instructions: 'I am safe. I do not need an ambulance. Please allow me to rest quietly.',
        colorTheme: 'caution',
        icon: 'Activity',
        isDefault: true
    },
    {
        id: 'seizure-alert',
        title: 'Seizure / Faint',
        description: 'I have a medical condition that causes fainting.',
        instructions: 'Please clear space. Do not restrain me. Call 911 if recovery takes > 5 mins.',
        colorTheme: 'urgent',
        icon: 'AlertTriangle',
        isDefault: true
    }
];
