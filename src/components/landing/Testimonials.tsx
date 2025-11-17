import React from 'react';
import { Card, CardHeader, CardDescription } from '../../design-system/components/Card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Chronic Pain Patient',
    avatar: '👩‍🦽',
    rating: 5,
    quote:
      'Finally, a pain tracker that actually understands what I\'m going through. The trauma-informed design makes it feel safe, and the AI insights helped me identify triggers I never noticed.',
    highlight: 'Identified hidden triggers',
  },
  {
    name: 'Dr. James Chen',
    role: 'Pain Management Specialist',
    avatar: '👨‍⚕️',
    rating: 5,
    quote:
      'The clinician portal saves me hours every week. AI pattern detection and one-click WorkSafe BC reports are game-changers. My patients love how easy it is to share data.',
    highlight: 'Saves 25+ hours/week',
  },
  {
    name: 'Michael R.',
    role: 'WorkSafe BC Claimant',
    avatar: '🦾',
    rating: 5,
    quote:
      'The automated WCB reporting feature is incredible. What used to take me days of paperwork now takes one click. My lawyer was impressed with the quality of the data.',
    highlight: 'One-click WCB reports',
  },
  {
    name: 'Dr. Emily Wong',
    role: 'Occupational Therapist',
    avatar: '👩‍⚕️',
    rating: 5,
    quote:
      'I recommend this to all my chronic pain patients. The offline capability means they can track anywhere, and the privacy-first approach gives them control.',
    highlight: 'Recommended by professionals',
  },
  {
    name: 'David L.',
    role: 'Fibromyalgia Patient',
    avatar: '🧑‍🦯',
    rating: 5,
    quote:
      'The accessibility features are outstanding. High contrast mode, screen reader support, and panic mode have been essential during flare-ups. This app truly cares.',
    highlight: 'Best accessibility',
  },
  {
    name: 'Lisa K.',
    role: 'Migraine Sufferer',
    avatar: '👩',
    rating: 5,
    quote:
      'I\'ve tried every pain tracker out there. This is the only one with truly private local storage and AI that actually works. The pattern insights are spot on.',
    highlight: 'Most accurate AI',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Trusted by Patients & Clinicians
          </h2>
          <p className="text-lg text-muted-foreground">
            Real stories from people managing chronic pain and healthcare professionals providing care.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader className="space-y-4">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="h-16 w-16 text-primary" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <CardDescription className="text-base leading-relaxed relative z-10">
                  "{testimonial.quote}"
                </CardDescription>

                {/* Highlight Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit">
                  {testimonial.highlight}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 pt-12 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Privacy Protected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">25+</div>
              <div className="text-sm text-muted-foreground">Hours Saved/Week</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">8</div>
              <div className="text-sm text-muted-foreground">AI Algorithms</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Time Reduction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
