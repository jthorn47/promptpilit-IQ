import React from 'react';
import { Search, Target, TrendingUp } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Assess',
      description: 'AI analyzes your team\'s knowledge gaps and compliance requirements',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Assign',
      description: 'Smart algorithms create personalized learning paths for each employee',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Improve',
      description: 'Real-time analytics track progress and ensure continuous improvement',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your team's learning experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10 z-0" />
              )}
              
              {/* Step card */}
              <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} p-4 mb-6`}>
                  <step.icon className="w-full h-full text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};