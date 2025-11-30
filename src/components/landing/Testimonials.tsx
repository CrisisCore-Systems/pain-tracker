import React from 'react';
import { Star, Quote, MessageCircle } from 'lucide-react';

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
  { value: '100%', label: 'Privacy Protected', color: '#34d399' },
  { value: '25+', label: 'Hours Saved/Week', color: '#38bdf8' },
  { value: '8', label: 'AI Algorithms', color: '#c084fc' },
  { value: '95%', label: 'Time Reduction', color: '#fbbf24' },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
               style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <MessageCircle className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Testimonials</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Trusted by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Patients & Clinicians</span>
          </h2>
          <p className="text-lg text-slate-400">
            Real stories from people managing chronic pain and healthcare professionals providing care.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="h-12 w-12 text-purple-400" />
              </div>

              <div className="relative space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      style={{ color: '#fbbf24', fill: '#fbbf24', filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))' }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 text-sm leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Highlight Badge */}
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}
                >
                  {testimonial.highlight}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="text-3xl">{testimonial.avatar}</div>
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
        <div className="rounded-2xl p-8"
             style={{
               background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
               border: '1px solid rgba(255, 255, 255, 0.1)',
               backdropFilter: 'blur(20px)',
             }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div 
                  className="text-4xl sm:text-5xl font-extrabold"
                  style={{ color: stat.color, textShadow: `0 4px 20px ${stat.color}40` }}
                >
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
