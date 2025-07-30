import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Award, Zap, Calculator, Plus } from "lucide-react";
import { CoursePackage } from "@/hooks/usePricingData";
import { getPlanDetails } from "@/utils/planDetails";
import { StripeCheckout } from "@/components/StripeCheckout";
import iconEasier from "@/assets/icon-easier.png";

interface PricingCardProps {
  pkg: CoursePackage;
  index: number;
  planPricing: any;
  isThreeYear: boolean;
  pricingLoading: boolean;
  packagesLoading: boolean;
  isSelected?: boolean;
  employeeCount?: number;
}

export const PricingCard = ({
  pkg,
  index,
  planPricing,
  isThreeYear,
  pricingLoading,
  packagesLoading,
  isSelected = false,
  employeeCount = 0
}: PricingCardProps) => {
  const navigate = useNavigate();
  const planDetails = getPlanDetails(pkg.name);

  // Get card styling based on selection and plan type
  const getCardStyle = () => {
    if (isSelected) {
      // Selected card gets special highlighting
      switch (pkg.name) {
        case 'Easy':
          return 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/50 shadow-xl ring-2 ring-blue-500/30';
        case 'Easier':
          return 'bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/50 shadow-xl ring-2 ring-primary/30';
        case 'Easiest':
          return 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/50 shadow-xl ring-2 ring-orange-500/30';
        default:
          return 'bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/50 shadow-xl ring-2 ring-primary/30';
      }
    } else if (planDetails.popular) {
      return 'bg-gradient-to-br from-primary/10 to-orange/10 border-2 border-primary/30 shadow-xl relative';
    } else {
      return 'bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-100 shadow-lg';
    }
  };

  return (
    <Card 
      className={`p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 flex flex-col h-full ${getCardStyle()}`}
    >
      {planDetails.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-primary to-orange text-white px-6 py-2 text-sm font-bold shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            index === 0 ? 'bg-blue-500' :
            index === 1 ? 'bg-purple-500' :
            'bg-orange-500'
          }`}>
            {index === 0 ? <img src={iconEasier} alt="Easier" className="w-8 h-8" /> :
             index === 1 ? <img src={iconEasier} alt="Easier" className="w-8 h-8" /> :
             <img src={iconEasier} alt="Easier" className="w-8 h-8" />}
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{pkg.name}</CardTitle>
        <CardDescription className="text-base text-gray-600">{pkg.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-grow flex flex-col">
        {/* Pricing Display */}
        {pricingLoading || packagesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            {planPricing ? (
              <>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${planPricing.pricePerUser.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-gray-600 mb-3">per seat/year</div>
                <div className="space-y-2 mb-4">
                  <div className="text-lg font-semibold text-gray-700 p-2 bg-blue-50 rounded-lg">
                    Annual Cost: ${planPricing.annualPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                {isThreeYear && planPricing.savings > 0 && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Save ${planPricing.savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Badge>
                )}
              </>
            ) : (
              <div className="text-gray-500">
                <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Enter employee count</p>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-3 flex-grow">
          <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
          {planDetails.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}
          
          {/* More Features Accordion */}
          {planDetails.moreFeatures && planDetails.moreFeatures.length > 0 && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="more-features" className="border-none">
                <AccordionTrigger className="text-sm text-primary hover:text-primary/80 py-2 font-medium">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    View {planDetails.moreFeatures.length} more features
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {planDetails.moreFeatures.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary/60 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        {/* CTA Button - Always at bottom */}
        <div className="mt-auto pt-6">
          {planPricing && employeeCount >= 5 ? (
            <StripeCheckout
              packageId={pkg.id}
              packageName={pkg.name}
              employeeCount={employeeCount}
              pricePerUser={planPricing.pricePerUser}
              totalPrice={planPricing.totalPrice}
              isThreeYear={isThreeYear}
              paymentType="subscription"
              className={`w-full text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                planDetails.popular 
                  ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white' 
                  : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white'
              }`}
            >
              <Button 
                size="lg" 
                className="w-full text-lg py-6 bg-transparent hover:bg-transparent border-0"
              >
                {planDetails.popular ? <Zap className="w-5 h-5 mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
                {isThreeYear ? 'Subscribe (3 Years)' : 'Subscribe Annually'}
              </Button>
            </StripeCheckout>
          ) : (
            <Button 
              size="lg" 
              className={`w-full text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                planDetails.popular 
                  ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white' 
                  : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white'
              }`}
              onClick={() => navigate('/auth')}
            >
              {planDetails.popular ? <Zap className="w-5 h-5 mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
              Get Started
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};