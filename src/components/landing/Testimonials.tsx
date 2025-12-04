import React from 'react';
import { Star, MessageCircle, Sparkles } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Chronic Pain Patient',
    avatar: '👩‍🦽',
    rating: 5,
    quote: 'Finally, a pain tracker that actually understands what I\'m going through. The trauma-informed design makes it feel safe.',
    highlight: 'Identified hidden triggers',
  },
  {
    name: 'Dr. James Chen',
    role: 'Pain Management Specialist',
    avatar: '👨‍⚕️',
    rating: 5,
    quote: 'The clinician portal saves me hours every week. AI pattern detection and one-click WorkSafe BC reports are game-changers.',
    highlight: 'Saves 25+ hours/week',
  },
  {
    name: 'Michael R.',
    role: 'WorkSafe BC Claimant',
    avatar: '🦾',
    rating: 5,
    quote: 'The automated WCB reporting feature is incredible. What used to take me days of paperwork now takes one click.',
    highlight: 'One-click WCB reports',
  },
  {
    name: 'Dr. Emily Wong',
    role: 'Occupational Therapist',
    avatar: '👩‍⚕️',
    rating: 5,
    quote: 'I recommend this to all my chronic pain patients. The offline capability means they can track anywhere.',
    highlight: 'Recommended by pros',
  },
  {
    name: 'David L.',
    role: 'Fibromyalgia Patient',
    avatar: '🧑‍🦯',
    rating: 5,
    quote: 'The accessibility features are outstanding. High contrast mode and panic mode have been essential during flare-ups.',
    highlight: 'Best accessibility',
  },
  {
    name: 'Lisa K.',
    role: 'Migraine Sufferer',
    avatar: '👩',
    rating: 5,
    quote: 'I\'ve tried every pain tracker out there. This is the only one with truly private local storage and AI that actually works.',
    highlight: 'Most accurate AI',
  },
];

const stats = [
  { value: '100%', label: 'Privacy Protected', colorClass: 'stat-counter-emerald' },
  { value: '25+', label: 'Hours Saved/Week', colorClass: 'stat-counter-sky' },
  { value: '8', label: 'AI Algorithms', colorClass: 'stat-counter-purple' },
  { value: '95%', label: 'Time Reduction', colorClass: 'stat-counter-amber' },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/80 to-slate-900" />
      
      {/* Decorative orbs */}
      <div className="orb-container">
        <div 
          className="orb-glow orb-glow-purple" 
          style={{ width: '500px', height: '500px', top: '5%', left: '20%' }}
        />
        <div 
          className="orb-glow orb-glow-sky" 
          style={{ width: '400px', height: '400px', bottom: '10%', right: '15%', animationDelay: '12s' }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto stagger-fade-up">
          <div className="badge-glow-purple inline-flex items-center gap-2 mb-6">
            <MessageCircle className="h-4 w-4" />
            <span>Testimonials</span>
          </div>
          
          <h2 className="landing-headline landing-headline-lg mb-6">
            <span className="text-white">Trusted by </span>
            <span className="gradient-text-animated">Patients & Clinicians</span>
          </h2>
          <p className="landing-subhead text-lg lg:text-xl">
            Real stories from people managing chronic pain and healthcare professionals providing care.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mb-20 stagger-fade-up">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card-editorial group"
            >
              <div className="relative space-y-5">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))' }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Highlight Badge */}
                <div className="badge-glow-purple inline-flex text-xs">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  {testimonial.highlight}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="glass-card-premium p-8 lg:p-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className={`stat-counter ${stat.colorClass}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
