import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

interface PricingSectionProps {
  plans: PricingPlan[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  onGetStarted?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plans,
  theme,
  onGetStarted
}) => {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Simple Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your organization. All plans include our core features with no hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-primary bg-card shadow-lg shadow-primary/10 scale-105'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-muted-foreground ml-1">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onGetStarted}
                className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white'
                    : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ SSL Security</span>
            <span>✓ 24/7 Support</span>
            <span>✓ Regular Updates</span>
            <span>✓ Data Backup</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};