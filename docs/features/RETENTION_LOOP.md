# Retention Loop & Habit Formation Features

## Overview

This implementation adds user retention, habit formation, and identity lock-in features to the Pain Tracker application. These features are designed to encourage regular engagement while respecting user autonomy and maintaining the app's trauma-informed, privacy-first principles.

## Core Principles

1. **User Autonomy**: All retention features can be disabled. No forced engagement.
2. **Privacy-First**: All data stays local. No external tracking or analytics.
3. **Trauma-Informed**: Gentle, non-judgmental language. No shame or pressure.
4. **Meaningful Engagement**: Focus on value, not manipulation.

## Architecture

### Services

#### 1. RetentionLoopService

Manages daily check-ins, prompts, and return incentives.

**Key Features:**
- Daily check-in tracking with consecutive day streaks
- Context-aware prompts (morning, afternoon, evening)
- Multiple tone options (gentle, encouraging, curious, neutral)
- Win conditions (milestones at 1, 3, 7 days)
- Pending insights system (unlock at 7, 14, 30 entries)

**Usage:**
```typescript
import { retentionLoopService } from '@pain-tracker/services';

// Get today's prompt
const prompt = retentionLoopService.getDailyPrompt();

// Record a check-in
retentionLoopService.recordCheckIn();

// Get return incentive message
const incentive = retentionLoopService.getReturnIncentive(entries);

// Toggle prompts
retentionLoopService.setPromptsEnabled(false);
```

#### 2. DailyRitualService

Manages habit formation through daily rituals.

**Key Features:**
- Multiple ritual templates (morning, evening, minimal, comprehensive)
- Smart timing suggestions based on entry history
- Customizable ritual types, times, and tones
- Streak tracking and milestone celebrations
- Consistency rewards

**Usage:**
```typescript
import { dailyRitualService } from '@pain-tracker/services';

// Get timing suggestions
const suggestions = dailyRitualService.getTimingSuggestions(entries);

// Setup ritual
dailyRitualService.setupRitual({
  ritualEnabled: true,
  ritualType: 'evening',
  eveningTime: '20:00',
  ritualTone: 'gentle',
});

// Complete ritual
dailyRitualService.completeRitual();

// Get completion message
const message = dailyRitualService.getRitualCompletionMessage(streak);
```

#### 3. IdentityLockInService

Creates personal investment through identity-reinforcing language and insights.

**Key Features:**
- Journey narrative generation
- Personal pattern discovery (commitment, reflection, medication management)
- Identity milestones and achievements
- Identity-reinforcing insights
- Strengths and goals tracking

**Usage:**
```typescript
import { identityLockInService } from '@pain-tracker/services';

// Initialize journey
identityLockInService.initializeJourney(entries);

// Generate narrative
const narrative = identityLockInService.generateJourneyNarrative(entries);

// Discover patterns
const patterns = identityLockInService.discoverPatterns(entries);

// Get identity insights
const insights = identityLockInService.getIdentityInsights(entries);

// Get identity language
const language = identityLockInService.getIdentityLanguage(entries);
```

### UI Components

#### 1. DailyCheckInPrompt

Displays gentle daily prompts to encourage check-ins.

**Props:**
- `onStartCheckIn?: () => void` - Callback when user starts check-in
- `onDismiss?: () => void` - Callback when user dismisses prompt
- `className?: string` - Additional CSS classes

**Features:**
- Shows once per day
- Respects user's prompt preferences
- Multiple tone colors
- Accessible dismiss button

#### 2. ReturnIncentiveWidget

Shows pending insights and progress toward unlocking features.

**Props:**
- `entries: PainEntry[]` - User's pain entries
- `className?: string` - Additional CSS classes

**Features:**
- Progress bars for each pending insight
- Visual differentiation by insight type
- Unlock messages create curiosity loops
- Gradient design for visual appeal

#### 3. IdentityDashboard

Displays personalized journey narrative, patterns, and milestones.

**Props:**
- `entries: PainEntry[]` - User's pain entries
- `className?: string` - Additional CSS classes

**Features:**
- Journey narrative with day count
- Personal patterns discovered
- Journey insights with emojis
- Identity-reinforcing language

#### 4. RitualSetup

Onboarding flow for configuring daily ritual preferences.

**Props:**
- `entries: PainEntry[]` - User's pain entries
- `onComplete?: () => void` - Callback when setup is complete
- `className?: string` - Additional CSS classes

**Features:**
- Multi-step wizard (type → time → tone)
- Smart timing suggestions based on history
- Visual ritual type selection
- Tone customization
- Celebration on completion

## Integration Guide

### Dashboard Integration

```typescript
import {
  DailyCheckInPrompt,
  ReturnIncentiveWidget,
  IdentityDashboard,
} from '../components/retention';

export const Dashboard = () => {
  const { entries } = usePainTrackerStore();

  return (
    <div>
      {/* Show daily prompt */}
      <DailyCheckInPrompt
        onStartCheckIn={() => navigate('/entry')}
      />

      {/* Show return incentives */}
      <ReturnIncentiveWidget entries={entries} />

      {/* Show identity dashboard */}
      <IdentityDashboard entries={entries} />
    </div>
  );
};
```

### Onboarding Integration

```typescript
import { RitualSetup } from '../components/retention';

export const Onboarding = () => {
  const { entries } = usePainTrackerStore();

  return (
    <div>
      {/* Include ritual setup in onboarding */}
      <RitualSetup
        entries={entries}
        onComplete={() => navigate('/dashboard')}
      />
    </div>
  );
};
```

### Settings Integration

Add controls for retention preferences in settings:

```typescript
import { retentionLoopService, dailyRitualService } from '@pain-tracker/services';

// Toggle daily prompts
retentionLoopService.setPromptsEnabled(enabled);

// Toggle ritual
dailyRitualService.setRitualEnabled(enabled);

// Set preferred time
retentionLoopService.setPreferredCheckInTime(time);
```

## Data Storage

All retention data is stored locally using localStorage:

- `retention-loop-state` - Check-in history, prompts, pending insights
- `daily-ritual-state` - Ritual configuration and completion history
- `user-identity-state` - Journey narrative, patterns, milestones

## Privacy Considerations

✅ **What is stored:**
- Check-in timestamps (dates only, no content)
- Streak counts and milestone achievements
- Ritual configuration preferences
- Pattern discoveries (metadata only)

❌ **What is NOT stored:**
- Pain entry content or details
- Personal health information
- Identifying information
- External analytics or tracking

## Accessibility

All components follow WCAG 2.2 AA guidelines:

- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast
- Touch targets meet minimum size
- Focus indicators visible
- No motion-only feedback

## Testing

Run tests with:

```bash
npm test -- src/services/RetentionLoopService.test.ts
npm test -- src/services/DailyRitualService.test.ts
npm test -- src/services/IdentityLockInService.test.ts
```

**Test Coverage:**
- 67 tests passing
- All core service functionality covered
- Edge cases handled

## Customization

### Adding New Prompts

Edit `RetentionLoopService.getPromptLibrary()` to add custom prompts:

```typescript
{
  id: 'custom-1',
  text: 'Your custom prompt text',
  tone: 'gentle',
  category: 'check-in',
  timing: 'morning',
}
```

### Adding New Ritual Templates

Edit `DailyRitualService.getRitualTemplates()` to add templates:

```typescript
{
  id: 'custom-ritual',
  name: 'Custom Ritual',
  description: 'Your custom ritual',
  type: 'anytime',
  estimatedDuration: 5,
  steps: [
    {
      id: 'step-1',
      label: 'Step label',
      description: 'Step description',
      optional: false,
      order: 1,
    },
  ],
}
```

### Customizing Identity Patterns

Edit `IdentityLockInService.discoverPatterns()` to add pattern detection:

```typescript
if (customCondition) {
  newPatterns.push({
    id: 'custom-pattern',
    type: 'success',
    title: 'Custom Achievement',
    description: 'Description',
    discoveredDate: new Date().toISOString(),
    significance: 'high',
    personalMeaning: 'What it means',
  });
}
```

## Roadmap

### Future Enhancements

- [ ] Push notification integration (opt-in)
- [ ] Advanced pattern recognition with ML (local-only)
- [ ] Social features (anonymous community benchmarks)
- [ ] Export retention metrics with reports
- [ ] A/B testing framework for prompts (local)
- [ ] Gamification elements (badges, levels)

## Support

For issues or questions:
- Create an issue on GitHub
- Check existing documentation
- Review integration examples

## License

MIT License - See LICENSE file for details
