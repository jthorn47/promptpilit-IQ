import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play } from 'lucide-react';

interface HeroSectionProps {
  config: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
  };
  onNavigateToAuth?: () => void;
  onGetStarted?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  theme,
  onNavigateToAuth,
  onGetStarted
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-72 h-72 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            {theme.logoUrl && (
              <img src={theme.logoUrl} alt="Logo" className="h-8 w-auto" />
            )}
            <span className="text-xl font-bold text-foreground">EaseLearn</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <Button 
              variant="outline" 
              onClick={onNavigateToAuth}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Sign In
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-6 leading-tight">
            {config.title}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            {config.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {config.ctaText}
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 group"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: "10,000+", label: "Active Learners" },
            { value: "500+", label: "Training Modules" },
            { value: "99.9%", label: "Uptime" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};