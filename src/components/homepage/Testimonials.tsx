import React from 'react';
import { Quote, Star } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      quote: "EaseLearn transformed our compliance training from a dreaded requirement into an engaging experience. Our completion rates went from 60% to 98% in just three months.",
      author: "Sarah Chen",
      role: "Chief People Officer",
      company: "TechCorp Industries",
      rating: 5
    },
    {
      quote: "The AI-powered learning paths are incredible. Each employee gets exactly what they need, when they need it. We've never seen such personalized training at scale.",
      author: "Michael Rodriguez",
      role: "HR Director",
      company: "Healthcare United",
      rating: 5
    },
    {
      quote: "Implementation was seamless, and the real-time analytics give us insights we never had before. EaseLearn pays for itself through improved efficiency alone.",
      author: "Jennifer Park",
      role: "Learning & Development Manager",
      company: "Global Financial Services",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            What HR Leaders Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real results from real professionals who've transformed their training programs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Quote className="h-4 w-4 text-primary-foreground" />
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Author */}
              <div className="border-t border-border/50 pt-6">
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-primary font-medium">{testimonial.role}</div>
                <div className="text-sm text-muted-foreground">{testimonial.company}</div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Join hundreds of companies already transforming their training
          </p>
          <div className="inline-flex items-center space-x-4 text-sm text-primary">
            <span>✓ 30-day free trial</span>
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};