/**
 * UI/UX Showcase Component
 * Demonstrates the new modern design system in action
 */

import React from 'react';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Sparkles
} from 'lucide-react';
import {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  MetricCard,
  ActionCard
} from '../design-system';
import {
  gradients,
  textGradients,
  glassmorphism,
  shadows,
  depth
} from '../design-system/theme/index';

export function UIShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 animate-[fadeInUp_0.6s_ease-out]">
          <h1 className={`text-5xl font-bold ${textGradients.primary}`}>
            Modern UI/UX Design System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the new Pain Tracker Pro with glassmorphism, gradients, and smooth animations
          </p>
        </div>

        {/* Gradient Showcase */}
        <section className="space-y-6 animate-[fadeInUp_0.7s_ease-out]">
          <h2 className="text-3xl font-bold text-foreground">Gradient System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${gradients.primary} rounded-xl p-8 text-white transform hover:scale-105 transition-transform cursor-pointer`}>
              <h3 className="text-xl font-semibold mb-2">Primary Gradient</h3>
              <p className="text-white/90">Blue → Indigo → Purple</p>
            </div>
            <div className={`${gradients.healing} rounded-xl p-8 text-white transform hover:scale-105 transition-transform cursor-pointer`}>
              <h3 className="text-xl font-semibold mb-2">Healing Gradient</h3>
              <p className="text-white/90">Green → Emerald → Teal</p>
            </div>
            <div className={`${gradients.alert} rounded-xl p-8 text-white transform hover:scale-105 transition-transform cursor-pointer`}>
              <h3 className="text-xl font-semibold mb-2">Alert Gradient</h3>
              <p className="text-white/90">Yellow → Amber → Orange</p>
            </div>
          </div>
        </section>

        {/* Enhanced Card Variants */}
        <section className="space-y-6 animate-[fadeInUp_0.8s_ease-out]">
          <h2 className="text-3xl font-bold text-foreground">Enhanced Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Glass Card */}
            <EnhancedCard variant="glass" hoverable animated>
              <EnhancedCardHeader icon={<Sparkles className="w-5 h-5" />}>
                <div>
                  <EnhancedCardTitle>Glass Card</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Glassmorphism with backdrop blur
                  </EnhancedCardDescription>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-sm text-muted-foreground">
                  Beautiful frosted glass effect with semi-transparent background
                </p>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Gradient Card */}
            <EnhancedCard variant="gradient" hoverable animated>
              <EnhancedCardHeader icon={<TrendingUp className="w-5 h-5" />}>
                <div>
                  <EnhancedCardTitle gradient>Gradient Card</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Subtle gradient background
                  </EnhancedCardDescription>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-sm text-muted-foreground">
                  Smooth gradient transitions from card to primary colors
                </p>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Elevated Card */}
            <EnhancedCard variant="elevated" hoverable animated>
              <EnhancedCardHeader icon={<Activity className="w-5 h-5" />}>
                <div>
                  <EnhancedCardTitle>Elevated Card</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    High elevation with deep shadows
                  </EnhancedCardDescription>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-sm text-muted-foreground">
                  Enhanced shadow depth for prominent content
                </p>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Glow Card - Primary */}
            <EnhancedCard variant="glow" glowColor="primary" hoverable animated>
              <EnhancedCardHeader icon={<Heart className="w-5 h-5" />}>
                <div>
                  <EnhancedCardTitle>Glow Card</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Colored glow effect
                  </EnhancedCardDescription>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-sm text-muted-foreground">
                  Soft colored shadow creates a premium glow
                </p>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Glow Card - Success */}
            <EnhancedCard variant="glow" glowColor="success" hoverable animated>
              <EnhancedCardHeader icon={<Calendar className="w-5 h-5" />}>
                <div>
                  <EnhancedCardTitle>Success Glow</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Green glow for positive states
                  </EnhancedCardDescription>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-sm text-muted-foreground">
                  Perfect for highlighting achievements and success
                </p>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Glow Card - Warning */}
            <EnhancedCard variant="glow" glowColor="warning" hoverable animated>
              <EnhancedCardHeader icon={<BarChart3 className="w-5 h-5" />}>
                <div>
                  <EnhancedCardTitle>Warning Glow</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Amber glow for alerts
                  </EnhancedCardDescription>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-sm text-muted-foreground">
                  Draws attention to important warnings or alerts
                </p>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="space-y-6 animate-[fadeInUp_0.9s_ease-out]">
          <h2 className="text-3xl font-bold text-foreground">Metric Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Pain Level Average"
              value={5.2}
              change={{ value: -12, label: "from last week" }}
              icon={<Activity className="w-8 h-8" />}
              trend="down"
              variant="success"
            />
            <MetricCard
              title="Total Entries"
              value={128}
              change={{ value: 8, label: "this week" }}
              icon={<Calendar className="w-8 h-8" />}
              trend="up"
              variant="default"
            />
            <MetricCard
              title="Good Days"
              value={85}
              change={{ value: 15, label: "improvement" }}
              icon={<Heart className="w-8 h-8" />}
              trend="up"
              variant="success"
            />
            <MetricCard
              title="Trend Score"
              value="B+"
              icon={<TrendingUp className="w-8 h-8" />}
              trend="neutral"
              variant="default"
            />
          </div>
        </section>

        {/* Action Cards */}
        <section className="space-y-6 animate-[fadeInUp_1s_ease-out]">
          <h2 className="text-3xl font-bold text-foreground">Action Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              title="Track Your Pain"
              description="Log your current pain level and symptoms to start building your health insights"
              action={{
                label: "Start Tracking",
                onClick: () => alert("Start Tracking clicked!")
              }}
              icon={<Activity className="w-6 h-6" />}
              variant="primary"
            />
            <ActionCard
              title="View Analytics"
              description="Explore advanced insights, trends, and patterns in your pain data"
              action={{
                label: "View Dashboard",
                onClick: () => alert("View Dashboard clicked!")
              }}
              icon={<BarChart3 className="w-6 h-6" />}
              variant="secondary"
            />
          </div>
        </section>

        {/* Animation Showcase */}
        <section className="space-y-6 animate-[fadeInUp_1.1s_ease-out]">
          <h2 className="text-3xl font-bold text-foreground">Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            <div className="p-6 bg-card rounded-xl border border-border shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
              <h3 className="font-semibold mb-2">Hover Lift</h3>
              <p className="text-sm text-muted-foreground">Moves up on hover with enhanced shadow</p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h3 className="font-semibold mb-2">Hover Scale</h3>
              <p className="text-sm text-muted-foreground">Scales up slightly when hovered</p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border shadow-lg active:scale-95 transition-transform cursor-pointer">
              <h3 className="font-semibold mb-2">Active Press</h3>
              <p className="text-sm text-muted-foreground">Scales down when pressed</p>
            </div>
          </div>
        </section>

        {/* Text Gradients */}
        <section className="space-y-6 animate-[fadeInUp_1.2s_ease-out]">
          <h2 className="text-3xl font-bold text-foreground">Text Gradients</h2>
          <div className="space-y-4">
            <h3 className={`text-4xl font-bold ${textGradients.primary}`}>
              Primary Gradient Text
            </h3>
            <h3 className={`text-4xl font-bold ${textGradients.secondary}`}>
              Secondary Gradient Text
            </h3>
            <h3 className={`text-4xl font-bold ${textGradients.success}`}>
              Success Gradient Text
            </h3>
            <h3 className={`text-4xl font-bold ${textGradients.sunset}`}>
              Sunset Gradient Text
            </h3>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">
            Built with modern design principles and accessibility in mind
          </p>
          <p className="text-sm text-muted-foreground/70">
            Pain Tracker Pro v2.0 • Enhanced UI/UX • October 2025
          </p>
        </footer>

      </div>
    </div>
  );
}
