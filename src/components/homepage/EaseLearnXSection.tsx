import React from 'react';
import { Brain, Zap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EaseLearnXSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-primary-glow/5 to-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full text-primary font-semibold text-sm mb-4">
                Introducing EaseLearnX
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  AI Coaching.
                </span>
                <br />
                <span className="text-foreground">Adaptive Training.</span>
                <br />
                <span className="text-foreground">Future-Ready.</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Our next-generation AI engine doesn't just deliver content—it understands how your team learns, 
                adapts in real-time, and coaches each individual to mastery.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-3 flex-shrink-0">
                  <Brain className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Neural Learning Paths</h3>
                  <p className="text-muted-foreground">AI analyzes learning patterns to create unique pathways for each employee</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-3 flex-shrink-0">
                  <Zap className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Real-time Adaptation</h3>
                  <p className="text-muted-foreground">Content difficulty adjusts instantly based on comprehension and engagement</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-3 flex-shrink-0">
                  <Rocket className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Predictive Analytics</h3>
                  <p className="text-muted-foreground">Forecast training needs and prevent compliance gaps before they occur</p>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-accent transition-all duration-300"
            >
              Experience EaseLearnX
            </Button>
          </div>
          
          {/* Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/10 via-primary-glow/10 to-accent/10 rounded-3xl p-8 backdrop-blur-sm border border-border/50">
              {/* Animated neural network visualization */}
              <div className="relative h-80 w-full overflow-hidden rounded-2xl">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                
                {/* Animated nodes */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-primary rounded-full animate-pulse"
                    style={{
                      left: `${20 + (i % 4) * 20}%`,
                      top: `${20 + Math.floor(i / 4) * 25}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '2s',
                    }}
                  />
                ))}
                
                {/* Connecting lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line
                      key={i}
                      x1={`${20 + (i % 4) * 20}%`}
                      y1={`${20 + Math.floor(i / 4) * 25}%`}
                      x2={`${20 + ((i + 1) % 4) * 20}%`}
                      y2={`${20 + Math.floor((i + 1) / 4) * 25}%`}
                      stroke="url(#lineGradient)"
                      strokeWidth="1"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </svg>
                
                {/* Floating text indicators */}
                <div className="absolute top-4 left-4 text-xs font-medium text-primary opacity-80">
                  AI Processing...
                </div>
                <div className="absolute bottom-4 right-4 text-xs font-medium text-accent opacity-80">
                  Learning Optimized
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};