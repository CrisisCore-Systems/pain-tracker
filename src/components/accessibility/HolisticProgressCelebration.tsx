/**
 * Holistic Progress Celebration System
 * Celebrates progress beyond clinical metrics - recognizing effort, consistency, self-care, and small victories
 */

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Heart, 
  Trophy, 
  Sun, 
  Sparkles, 
  Target, 
  Calendar, 
  Feather, 
  Shield, 
  Compass, 
  Flower,
  Mountain,
  Book,
  Rainbow,
  Flame
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { useTraumaInformed } from './TraumaInformedHooks';
import { type Achievement } from './useHolisticProgress';

interface ProgressMilestone {
  id: string;
  category: 'tracking' | 'self-advocacy' | 'coping' | 'community' | 'learning' | 'wellbeing';
  milestone: string;
  meaningfulImpact: string;
  celebrationSuggestion: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  achieved: boolean;
  achievedDate?: Date;
}

interface ProgressCelebrationProps {
  recentAchievements?: Achievement[];
  weeklyProgress?: Record<string, number>;
  consistencyDays?: number;
  selfCareActivities?: string[];
  courageousMoments?: string[];
  onCelebrationShared?: (achievement: Achievement) => void;
}

// Define meaningful achievements beyond clinical metrics
const achievementTemplates = {
  consistency: [
    {
      threshold: 3,
      title: "Showing Up for Yourself",
      description: "You've tracked your pain for 3 days in a row",
      personalMessage: "Consistency is a form of self-love. You're learning about yourself and that takes courage.",
      celebrationLevel: 'warm' as const,
      icon: Calendar,
      suggestedReward: "Treat yourself to something comforting - a warm tea, favorite song, or cozy blanket time"
    },
    {
      threshold: 7,
      title: "Building Your Story",
      description: "A full week of tracking - you're creating valuable insights about yourself",
      personalMessage: "Each day you track is a day you choose to understand yourself better. That's profound self-advocacy.",
      celebrationLevel: 'enthusiastic' as const,
      icon: Book,
      suggestedReward: "Consider sharing this win with someone who cares about you"
    },
    {
      threshold: 30,
      title: "Devoted Self-Advocate",
      description: "30 days of consistent tracking - you're truly committed to your wellbeing",
      personalMessage: "A month of choosing yourself, every single day. Your dedication to understanding your pain is inspiring.",
      celebrationLevel: 'profound' as const,
      icon: Mountain,
      suggestedReward: "This deserves a special celebration - something that honors your commitment to yourself"
    }
  ],
  selfCare: [
    {
      title: "Gentle With Yourself",
      description: "You practiced self-care during a difficult pain day",
      personalMessage: "Being kind to yourself when you're hurting isn't selfish - it's necessary. You're learning to be your own best friend.",
      celebrationLevel: 'warm' as const,
      icon: Heart,
      suggestedReward: "You deserve extra gentleness today"
    },
    {
      title: "Wisdom in Rest",
      description: "You chose rest when your body needed it",
      personalMessage: "Listening to your body and choosing rest is an act of wisdom and courage. Productivity culture has nothing on your self-awareness.",
      celebrationLevel: 'warm' as const,
      icon: Feather,
      suggestedReward: "Your body is grateful for this choice"
    },
    {
      title: "Comfort Kit Champion",
      description: "You used your comfort strategies during a tough moment",
      personalMessage: "You remembered that you have tools, and you used them. That's growth and self-compassion in action.",
      celebrationLevel: 'enthusiastic' as const,
      icon: Shield,
      suggestedReward: "Add a new item to your comfort kit to celebrate this success"
    }
  ],
  courage: [
    {
      title: "Speaking Your Truth",
      description: "You communicated about your pain with someone",
      personalMessage: "Sharing your experience takes tremendous courage. You're breaking the isolation that pain tries to create.",
      celebrationLevel: 'profound' as const,
      icon: Flame,
      suggestedReward: "Your courage helps others feel less alone too"
    },
    {
      title: "Asking for Help",
      description: "You reached out when you needed support",
      personalMessage: "Asking for help isn't weakness - it's strength and self-awareness. You're building your support network.",
      celebrationLevel: 'warm' as const,
      icon: Compass,
      suggestedReward: "Thank the person who helped you - connection strengthens both of you"
    },
    {
      title: "Setting Boundaries",
      description: "You honored your limits and said no to something",
      personalMessage: "Protecting your energy and honoring your limits is an act of self-respect. Your boundaries matter.",
      celebrationLevel: 'enthusiastic' as const,
      icon: Shield,
      suggestedReward: "Reflect on how setting this boundary felt - your future self will thank you"
    }
  ],
  growth: [
    {
      title: "Learning About Yourself",
      description: "You identified a new pattern or trigger",
      personalMessage: "Self-awareness is a superpower. Each pattern you notice gives you more control over your experience.",
      celebrationLevel: 'warm' as const,
      icon: Target,
      suggestedReward: "Document this insight - you're building wisdom"
    },
    {
      title: "Trying Something New",
      description: "You experimented with a new coping strategy",
      personalMessage: "Innovation in your own care shows incredible resilience. Whether it worked or not, you're expanding your toolkit.",
      celebrationLevel: 'enthusiastic' as const,
      icon: Sparkles,
      suggestedReward: "Celebrate the courage to try, regardless of the outcome"
    }
  ],
  connection: [
    {
      title: "Community Builder",
      description: "You connected with others who understand",
      personalMessage: "Finding your people and building community is healing for everyone involved. You're not walking this path alone.",
      celebrationLevel: 'profound' as const,
      icon: Rainbow,
      suggestedReward: "Nurture these connections - they're precious"
    },
    {
      title: "Supporting Others",
      description: "You offered support or encouragement to someone else",
      personalMessage: "Even while managing your own challenges, you showed up for someone else. That's the heart of community.",
      celebrationLevel: 'warm' as const,
      icon: Heart,
      suggestedReward: "Your kindness ripples outward in ways you may never know"
    }
  ],
  resilience: [
    {
      title: "Getting Through a Hard Day",
      description: "You survived a particularly difficult day",
      personalMessage: "You made it through. That's not small - that's everything. Your resilience is remarkable.",
      celebrationLevel: 'profound' as const,
      icon: Mountain,
      suggestedReward: "Rest. You've earned it."
    },
    {
      title: "Finding Joy Despite Pain",
      description: "You experienced a moment of joy or peace",
      personalMessage: "Pain doesn't have to steal all your joy. This moment proves that you can hold both - difficulty and delight.",
      celebrationLevel: 'enthusiastic' as const,
      icon: Flower,
      suggestedReward: "Savor this feeling and remember that more moments like this are possible"
    }
  ]
};

// Progress milestones that matter beyond pain reduction
const meaningfulMilestones: ProgressMilestone[] = [
  {
    id: 'first-week',
    category: 'tracking',
    milestone: 'Completed your first week of tracking',
    meaningfulImpact: 'You\'ve begun the journey of understanding your pain patterns',
    celebrationSuggestion: 'Take a moment to appreciate your commitment to self-knowledge',
    icon: Calendar,
    color: 'text-blue-600',
    achieved: false
  },
  {
    id: 'self-advocacy',
    category: 'self-advocacy',
    milestone: 'Communicated your needs to someone',
    meaningfulImpact: 'You\'re building skills in advocating for yourself',
    celebrationSuggestion: 'Recognize that speaking up for yourself takes courage',
    icon: Flame,
    color: 'text-red-600',
    achieved: false
  },
  {
    id: 'comfort-strategy',
    category: 'coping',
    milestone: 'Used a comfort strategy during pain',
    meaningfulImpact: 'You\'re developing an active relationship with your wellbeing',
    celebrationSuggestion: 'Honor your wisdom in caring for yourself',
    icon: Heart,
    color: 'text-pink-600',
    achieved: false
  },
  {
    id: 'connection',
    category: 'community',
    milestone: 'Connected with someone who understands',
    meaningfulImpact: 'You\'re breaking the isolation that pain can create',
    celebrationSuggestion: 'Appreciate the courage it takes to reach out',
    icon: Rainbow,
    color: 'text-purple-600',
    achieved: false
  },
  {
    id: 'learning',
    category: 'learning',
    milestone: 'Learned something new about your pain',
    meaningfulImpact: 'Knowledge is power - you\'re becoming an expert on yourself',
    celebrationSuggestion: 'Celebrate your growing self-awareness',
    icon: Book,
    color: 'text-green-600',
    achieved: false
  },
  {
    id: 'joy-moment',
    category: 'wellbeing',
    milestone: 'Found a moment of joy despite pain',
    meaningfulImpact: 'You\'re proving that pain doesn\'t have to steal all happiness',
    celebrationSuggestion: 'This moment shows your resilience and capacity for joy',
    icon: Sun,
    color: 'text-yellow-600',
    achieved: false
  }
];

export function HolisticProgressCelebration({
  recentAchievements = [],
  weeklyProgress = {},
  consistencyDays = 0,
  selfCareActivities = [],
  courageousMoments = [],
  onCelebrationShared
}: ProgressCelebrationProps) {
  const { preferences } = useTraumaInformed();
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [milestones] = useState<ProgressMilestone[]>(meaningfulMilestones);

  // Check for new achievements based on progress data
  useEffect(() => {
    const newAchievements: Achievement[] = [];

    // Check consistency achievements
    if (consistencyDays > 0) {
      achievementTemplates.consistency.forEach((template) => {
        if (consistencyDays >= template.threshold) {
          const achievement: Achievement = {
            id: `consistency-${template.threshold}`,
            type: 'consistency',
            title: template.title,
            description: template.description,
            icon: template.icon,
            celebrationLevel: template.celebrationLevel,
            personalMessage: template.personalMessage,
            suggestedReward: template.suggestedReward,
            shareableText: `I've been consistently tracking my pain for ${consistencyDays} days. Small steps, big commitment! 💙`,
            timestamp: new Date()
          };
          
          // Only add if not already in recent achievements
          if (!recentAchievements.find(a => a.id === achievement.id)) {
            newAchievements.push(achievement);
          }
        }
      });
    }

    // Check self-care achievements
    if (selfCareActivities.length > 0) {
      const achievement: Achievement = {
        id: `self-care-${Date.now()}`,
        type: 'self-care',
        title: achievementTemplates.selfCare[0].title,
        description: achievementTemplates.selfCare[0].description,
        icon: achievementTemplates.selfCare[0].icon,
        celebrationLevel: achievementTemplates.selfCare[0].celebrationLevel,
        personalMessage: achievementTemplates.selfCare[0].personalMessage,
        suggestedReward: achievementTemplates.selfCare[0].suggestedReward,
        shareableText: "I practiced self-care today. Taking care of myself isn't selfish - it's necessary. 🌸",
        timestamp: new Date()
      };
      newAchievements.push(achievement);
    }

    // Check courage achievements
    if (courageousMoments.length > 0) {
      const achievement: Achievement = {
        id: `courage-${Date.now()}`,
        type: 'courage',
        title: achievementTemplates.courage[0].title,
        description: achievementTemplates.courage[0].description,
        icon: achievementTemplates.courage[0].icon,
        celebrationLevel: achievementTemplates.courage[0].celebrationLevel,
        personalMessage: achievementTemplates.courage[0].personalMessage,
        suggestedReward: achievementTemplates.courage[0].suggestedReward,
        shareableText: "I found the courage to speak about my experience today. My voice matters. 🔥",
        timestamp: new Date()
      };
      newAchievements.push(achievement);
    }

    // Show the most recent achievement
    if (newAchievements.length > 0 && !preferences.simplifiedMode) {
      const latestAchievement = newAchievements[newAchievements.length - 1];
      setCurrentAchievement(latestAchievement);
      setShowCelebration(true);
    }
  }, [consistencyDays, selfCareActivities, courageousMoments, recentAchievements, preferences.simplifiedMode]);

  return (
    <div className="holistic-progress-celebration">
      {/* Current Achievement Celebration */}
      {showCelebration && currentAchievement && (
        <AchievementCelebrationCard
          achievement={currentAchievement}
          onClose={() => setShowCelebration(false)}
          onShare={() => {
            if (onCelebrationShared) onCelebrationShared(currentAchievement);
            setShowCelebration(false);
          }}
        />
      )}

      {/* Progress Overview */}
      <ProgressOverview 
        milestones={milestones}
        weeklyProgress={weeklyProgress}
      />

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <RecentAchievements achievements={recentAchievements} />
      )}
    </div>
  );
}

// Individual achievement celebration card
function AchievementCelebrationCard({
  achievement,
  onClose,
  onShare
}: {
  achievement: Achievement;
  onClose: () => void;
  onShare: () => void;
}) {
  const Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> = achievement.icon;
  
  const celebrationStyles = {
    gentle: 'bg-blue-50 border-blue-200 text-blue-800',
    warm: 'bg-green-50 border-green-200 text-green-800',
    enthusiastic: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    profound: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const celebrationEmojis = {
    gentle: '🌸',
    warm: '💚',
    enthusiastic: '🎉',
    profound: '✨'
  };

  return (
    <div className={`
      rounded-lg border-2 p-6 mb-6 transition-all duration-500
      ${celebrationStyles[achievement.celebrationLevel]}
      animate-pulse
    `}>
      <div className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Icon className="w-12 h-12 mx-auto" />
            <span className="absolute -top-2 -right-2 text-2xl">
              {celebrationEmojis[achievement.celebrationLevel]}
            </span>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-2">
          {achievement.title}
        </h2>
        
        <p className="text-sm mb-4">
          {achievement.description}
        </p>
      </div>

      <div className="bg-white/70 rounded-lg p-4 mb-4">
        <p className="text-sm leading-relaxed italic">
          {achievement.personalMessage}
        </p>
        
        {achievement.suggestedReward && (
          <div className="mt-3 p-3 bg-white/50 rounded-md">
            <p className="text-xs font-medium text-gray-700 mb-1">💝 Consider this:</p>
            <p className="text-xs text-gray-600">{achievement.suggestedReward}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <TouchOptimizedButton
          variant="primary"
          onClick={onShare}
          className="flex-1"
        >
          <Heart className="w-4 h-4 mr-2" />
          I'm proud of this
        </TouchOptimizedButton>
        
        <TouchOptimizedButton
          variant="secondary"
          onClick={onClose}
          className="px-4"
        >
          ✕
        </TouchOptimizedButton>
      </div>
    </div>
  );
}

// Progress overview with meaningful milestones
function ProgressOverview({
  milestones
}: {
  milestones: ProgressMilestone[];
  weeklyProgress: Record<string, number>;
}) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  return (
    <div className="progress-overview bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
        Your Journey of Growth
      </h3>
      
      <div className="grid gap-4">
        {milestones.map((milestone) => {
          const Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> = milestone.icon;
          const isExpanded = expandedMilestone === milestone.id;
          
          return (
            <div
              key={milestone.id}
              className={`
                border rounded-lg p-3 transition-all cursor-pointer
                ${milestone.achieved 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                }
              `}
              onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {milestone.achieved ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <Icon className={`w-6 h-6 ${milestone.color}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {milestone.milestone}
                  </h4>
                  
                  {isExpanded && (
                    <div className="mt-2 space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Impact:</span> {milestone.meaningfulImpact}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Reflection:</span> {milestone.celebrationSuggestion}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {milestone.achieved && (
                    <span className="text-xs text-green-600 font-medium">Achieved!</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Recent achievements display
function RecentAchievements({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="recent-achievements bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
        Recent Celebrations
      </h3>
      
      <div className="space-y-3">
        {achievements.slice(0, 5).map((achievement) => {
          const Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> = achievement.icon;
          
          return (
            <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
              <Icon className="w-5 h-5 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                <p className="text-xs text-gray-600">{achievement.description}</p>
              </div>
              <div className="text-xs text-gray-500">
                {achievement.timestamp.toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
