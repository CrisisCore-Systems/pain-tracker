import { useEffect } from 'react';
import { usePainTrackerStore } from '../stores/pain-tracker-store';
import { PainTrackerLayout } from '../components/layouts/PainTrackerLayout';
import { OnboardingFlow } from '../components/onboarding';
import { Walkthrough } from '../components/tutorials';
import { useToast } from '../components/feedback';
import { walkthroughSteps } from '../data/sampleData';

export function PainTrackerContainer() {
  const {
    entries,
    ui,
    error,
    addEntry,
    setShowOnboarding,
    setShowWalkthrough,
    setError,
    loadSampleData
  } = usePainTrackerStore();

  const toast = useToast();

  // Check for first-time user
  useEffect(() => {
    try {
      const hasSeenOnboarding = localStorage.getItem('pain-tracker-onboarding-completed');
      const hasEntries = entries.length > 0;
      
      if (!hasSeenOnboarding && !hasEntries) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.warn('Unable to check onboarding status:', err);
    }
  }, [entries.length, setShowOnboarding]);

  const handleOnboardingComplete = (setupWithSampleData: boolean) => {
    try {
      localStorage.setItem('pain-tracker-onboarding-completed', 'true');
    } catch (err) {
      console.warn('Unable to save onboarding status:', err);
    }
    
    setShowOnboarding(false);
    
    if (setupWithSampleData) {
      loadSampleData();
      toast.success('Sample data loaded!', 'Explore the features with example pain entries. You can clear this data anytime.');
    } else {
      toast.info('Welcome to Pain Tracker!', 'Start by recording your first pain entry above.');
    }
  };

  const handleOnboardingSkip = () => {
    try {
      localStorage.setItem('pain-tracker-onboarding-completed', 'true');
    } catch (err) {
      console.warn('Unable to save onboarding status:', err);
    }
    
    setShowOnboarding(false);
    toast.info('Onboarding skipped', 'You can always access help from the help menu.');
  };

  const handleStartWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    toast.success('Tutorial completed!', 'You\'re all set to start tracking your pain effectively.');
  };

  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false);
  };

  const validatePainEntry = (entry: any): boolean => {
    if (!entry.baselineData) return false;
    
    const { pain } = entry.baselineData;
    if (typeof pain !== 'number' || pain < 0 || pain > 10) return false;

    if (entry.qualityOfLife) {
      const { sleepQuality, moodImpact } = entry.qualityOfLife;
      if (
        typeof sleepQuality !== 'number' || sleepQuality < 0 || sleepQuality > 10 ||
        typeof moodImpact !== 'number' || moodImpact < 0 || moodImpact > 10
      ) {
        return false;
      }
    }

    return true;
  };

  const handleAddEntry = (entryData: any) => {
    try {
      if (!validatePainEntry(entryData)) {
        setError("Invalid pain entry data. Please check your input values.");
        toast.error('Invalid Entry', 'Please check your input values and try again.');
        return;
      }

      addEntry(entryData);
      setError(null);
      toast.success('Entry Saved', 'Your pain entry has been recorded successfully.');
    } catch (err) {
      setError("Failed to add pain entry. Please try again.");
      toast.error('Save Failed', 'Unable to add pain entry. Please try again.');
      console.error("Error adding pain entry:", err);
    }
  };

  return (
    <>
      <PainTrackerLayout
        entries={entries}
        error={error}
        onAddEntry={handleAddEntry}
        onStartWalkthrough={handleStartWalkthrough}
      />

      {/* Onboarding Flow */}
      {ui.showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Interactive Walkthrough */}
      <Walkthrough
        steps={walkthroughSteps}
        isActive={ui.showWalkthrough}
        onComplete={handleWalkthroughComplete}
        onSkip={handleWalkthroughSkip}
      />
    </>
  );
}