import React from 'react';

export const NeuralBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Enhanced Neural Network Animation */}
      <div className="absolute inset-0">
        {/* Primary neural nodes */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`node-${i}`}
            className="absolute bg-primary/30 rounded-full animate-neural-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Secondary glow nodes */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute bg-primary-glow/20 rounded-full animate-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Floating particles */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary/15 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-neural opacity-40" />
    </div>
  );
};