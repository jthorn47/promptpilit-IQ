import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { usePricingData, useCoursePackages, calculatePricing } from "@/hooks/usePricingData";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingCalculator } from "@/components/pricing/PricingCalculator";
import { PricingCard } from "@/components/pricing/PricingCard";
import { InstantQuoteHeader } from "@/components/pricing/InstantQuoteHeader";
import { PlanComparison } from "@/components/pricing/PlanComparison";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShoppingCart as ShoppingCartIcon, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy load ShoppingCart to improve initial load time
const ShoppingCart = lazy(() => import("@/components/ShoppingCart").then(module => ({ default: module.ShoppingCart })));

export interface CartItem {
  id: string;
  type: 'plan' | 'training';
  name: string;
  price: number;
  quantity: number;
  requiresPlan?: boolean;
  siteSpecific?: boolean;
}


const Pricing = () => {
  
  const [employeeCount, setEmployeeCount] = useState<number | string>(5);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isThreeYear, setIsThreeYear] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: pricingData, isLoading: pricingLoading } = usePricingData();
  const { data: packages, isLoading: packagesLoading } = useCoursePackages();

  console.log('Pricing component loaded:', { packages, pricingData, pricingLoading, packagesLoading });

  // Set default package when packages load
  useEffect(() => {
    console.log('useEffect triggered:', packages);
    if (packages && packages.length > 0 && !selectedPackageId) {
      // Default to "Easier" package (most popular)
      const defaultPackage = packages.find(pkg => pkg.name === 'Easier') || packages[0];
      console.log('Setting default package:', defaultPackage);
      setSelectedPackageId(defaultPackage.id);
    }
  }, [packages, selectedPackageId]);

  // Handle scrolling to calculator section when URL has #calculator hash
  useEffect(() => {
    if (window.location.hash === '#calculator') {
      setTimeout(() => {
        const calculatorElement = document.getElementById('calculator');
        if (calculatorElement) {
          calculatorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  }, [packages, pricingData]); // Wait for data to load before scrolling

  const selectedPackage = packages?.find(pkg => pkg.id === selectedPackageId);
  
  const pricing = useMemo(() => {
    const numEmployees = typeof employeeCount === 'string' ? parseInt(employeeCount) || 0 : employeeCount;
    if (!pricingData || !selectedPackageId || numEmployees < 5) return null;
    return calculatePricing(numEmployees, selectedPackageId, isThreeYear ? 3 : 1, pricingData);
  }, [pricingData, selectedPackageId, employeeCount, isThreeYear]);

  // Calculate pricing for all packages
  const allPackagesPricing = useMemo(() => {
    const numEmployees = typeof employeeCount === 'string' ? parseInt(employeeCount) || 25 : employeeCount;
    if (!pricingData || !packages || numEmployees < 5) return {};
    
    const pricingMap: Record<string, any> = {};
    packages.forEach(pkg => {
      const pricing = calculatePricing(numEmployees, pkg.id, isThreeYear ? 3 : 1, pricingData);
      if (pricing) {
        pricingMap[pkg.id] = pricing;
      }
    });
    return pricingMap;
  }, [pricingData, packages, employeeCount, isThreeYear]);

  if (pricingLoading || packagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Pricing Information</h2>
          <p className="text-muted-foreground">Please wait while we fetch the latest pricing data...</p>
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No pricing packages found</p>
        </div>
      </div>
    );
  }

  const handleEmployeeCountChange = (value: string) => {
    if (value === '') {
      setEmployeeCount('');
      return;
    }
    const count = parseInt(value);
    if (!isNaN(count)) {
      setEmployeeCount(count);
    }
  };

  const handleEmployeeCountBlur = () => {
    const numEmployees = typeof employeeCount === 'string' ? parseInt(employeeCount) || 0 : employeeCount;
    if (employeeCount === '' || numEmployees < 5) {
      setEmployeeCount(5);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    // Check if trying to add a training package when one already exists
    if (item.type === 'training') {
      const existingTraining = cartItems.find(cartItem => cartItem.type === 'training');
      if (existingTraining && existingTraining.id !== item.id) {
        // Replace existing training package with new one (only one training type per cart)
        toast({
          title: "Training Package Replaced",
          description: `${existingTraining.name} has been replaced with ${item.name}. Only one training package type is allowed per order.`,
          duration: 4000,
        });
        
        setCartItems(cartItems.map(cartItem => 
          cartItem.type === 'training' 
            ? { ...item, quantity: 1 }
            : cartItem
        ));
        return;
      }
    }

    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      // For site-specific training items (Easier, Easiest), allow multiple quantities (multiple sites)
      // For non-site-specific training items (Easy), don't allow quantity increase
      if (item.type === 'training' && !item.siteSpecific) {
        toast({
          title: "Training Already in Cart",
          description: `${item.name} is already in your cart. This training package doesn't support multiple quantities.`,
          duration: 3000,
        });
        return;
      }
      
      // For site-specific items and non-training items, increment quantity
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
      
      // Show toast for quantity increase
      toast({
        title: "Quantity Updated",
        description: `${item.name} quantity increased to ${existingItem.quantity + 1}.`,
        duration: 3000,
      });
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
      
      // Show success toast for new items
      toast({
        title: "Added to Cart",
        description: `${item.name} has been added to your cart.`,
        duration: 3000,
      });
    }
  };

  const addPlanToCart = () => {
    addToCart({
      id: 'workplace-violence-plan',
      type: 'plan',
      name: 'Workplace Violence\nPrevention\nPlan',
      price: 995,
      siteSpecific: true
    });
  };

  const addTrainingToCart = (pkg: any, planPricing: any) => {
    if (!planPricing) return;
    
    addToCart({
      id: pkg.id,
      type: 'training',
      name: pkg.name,
      price: planPricing.annualPrice || 0,
      requiresPlan: pkg.name === 'Easier' || pkg.name === 'Easiest',
      siteSpecific: pkg.name === 'Easier' || pkg.name === 'Easiest'
    });
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  console.log('Pricing page rendering with new styles');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PricingHeader />

      <BreadcrumbNav items={[{ label: "Pricing" }]} />

      {/* Shopping Cart */}
      <Suspense fallback={<div>Loading cart...</div>}>
        <ShoppingCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          setItems={setCartItems}
          initialEmployeeCount={typeof employeeCount === 'number' ? employeeCount : parseInt(employeeCount) || 5}
        />
      </Suspense>

      {/* Fixed Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsCartOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-full p-3 relative"
          size="lg"
        >
          <ShoppingCartIcon className="w-6 h-6" />
          {cartItemsCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
              {cartItemsCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 sm:mb-6">
            Find the Right Plan for Your Business
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-700 max-w-3xl mx-auto px-4">
            Choose the perfect training solution that scales with your team and meets your compliance needs
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Badge variant="outline" className="text-xs sm:text-sm px-3 sm:px-4 py-2">
              ⚡ Easier & Easiest Require Plan
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm px-3 sm:px-4 py-2">
              💰 Volume Discounts Available
            </Badge>
          </div>
        </div>

        <div id="calculator">
          <PricingCalculator
            employeeCount={employeeCount}
            selectedPackageId={selectedPackageId}
            isThreeYear={isThreeYear}
            packages={packages}
            onEmployeeCountChange={handleEmployeeCountChange}
            onEmployeeCountBlur={handleEmployeeCountBlur}
            onPackageSelect={setSelectedPackageId}
            onTermChange={setIsThreeYear}
          />
        </div>

        <InstantQuoteHeader show={!!pricing} selectedPackage={selectedPackage} />

        {/* Regular Training Plans - Moved above the plan section */}
        <div id="training-plans" className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
            Employee Training Packages
          </h2>
          <p className="text-base sm:text-lg text-slate-600 px-4">
            Comprehensive training programs for your employees (Plan sold separately below)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {packages?.map((pkg, index) => (
            <div key={pkg.id} className="relative group">
              <div className={`h-full p-4 sm:p-6 lg:p-8 rounded-2xl border transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] ${
                pkg.name === 'Easier' 
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg hover:shadow-xl hover:shadow-blue-200/50' 
                  : 'border-slate-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:shadow-slate-200/50'
              }`}>
                
                {/* Popular Badge */}
                {pkg.name === 'Easier' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Package Header */}
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">{pkg.description}</p>
                  
                  {/* Site-specific badge */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {(pkg.name === 'Easier' || pkg.name === 'Easiest') && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        ⚡ Requires Plan
                      </Badge>
                    )}
                    {pkg.name === 'Easy' && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        📚 Training Only
                      </Badge>
                    )}
                  </div>

                  {/* Pricing */}
                  {allPackagesPricing[pkg.id] && (
                    <div className="mb-4 sm:mb-6">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                        ${allPackagesPricing[pkg.id].annualPrice?.toLocaleString()}
                        <span className="text-sm sm:text-base lg:text-lg font-normal text-muted-foreground">/year</span>
                      </div>
                      
                      {/* Per-seat pricing */}
                      <div className="text-base sm:text-lg font-semibold text-primary mb-2">
                        ${allPackagesPricing[pkg.id].pricePerUser?.toFixed(2)} per seat/month
                      </div>
                      
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {typeof employeeCount === 'string' ? parseInt(employeeCount) || 0 : employeeCount} employees
                      </p>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <div className="mb-4 sm:mb-6">
                  <Button
                    onClick={() => addTrainingToCart(pkg, allPackagesPricing[pkg.id])}
                    disabled={!allPackagesPricing[pkg.id]}
                    className={`w-full py-2 sm:py-3 text-base sm:text-lg ${
                      pkg.name === 'Easier' 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {/* Course Count */}
                <div className="text-center text-xs sm:text-sm text-gray-600">
                  <p>{pkg.course_count} Training Courses</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workplace Violence Prevention Plan - Featured Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Workplace Violence Prevention Plan
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Get a comprehensive, customized Workplace Violence Prevention Plan created specifically for your organization
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Left Side - Plan Details */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Professional Plan Creation</h3>
                    <p className="text-red-600 font-semibold">One-time investment</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">Customized plan tailored to your industry and organization</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">Comprehensive threat assessment and risk analysis</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">Emergency response procedures and protocols</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">Employee communication templates and policies</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">Implementation guide and best practices</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">1 hour phone consultation for plan completion help</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Pricing Options */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="space-y-4">
                  {/* Plan Only - Primary Option */}
                  <div className="text-center p-6 border-2 border-red-500 rounded-lg bg-red-50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-4xl font-bold text-gray-900">$995</div>
                      <Badge variant="secondary" className="text-xs">
                        Per Site
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4">Workplace Violence Prevention Plan</p>
                    <Button 
                      onClick={addPlanToCart}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Plan to Cart
                    </Button>
                  </div>
                  
                  {/* Divider */}
                  <div className="text-center py-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">Need Employee Training Too?</span>
                      </div>
                    </div>
                  </div>

                  {/* Training Info */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">
                      Add employee training to your plan purchase:
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Choose from Easy, Easier, or Easiest training packages above
                    </p>
                    <p className="text-xs text-orange-600 font-medium mb-3">
                      💡 Easier & Easiest packages automatically include the plan
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const trainingSection = document.getElementById('training-plans');
                        trainingSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      View Training Options ↑
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Secure payment • Volume discounts: 15% off (1-3 sites) • 25% off (4-10 sites)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PlanComparison />
      </div>
    </div>
  );
};

export default Pricing;