import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calculator, TrendingDown, Check } from "lucide-react";
import { usePricingData, useCoursePackages, calculatePricing } from "@/hooks/usePricingData";
import { useNavigate } from "react-router-dom";

export const PricingCalculator = () => {
  const [employeeCount, setEmployeeCount] = useState(25);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isThreeYear, setIsThreeYear] = useState(false);
  
  const navigate = useNavigate();
  const { data: pricingData, isLoading: pricingLoading } = usePricingData();
  const { data: packages, isLoading: packagesLoading } = useCoursePackages();

  // Set default package when packages load
  React.useEffect(() => {
    if (packages && packages.length > 0 && !selectedPackageId) {
      // Default to "Easier" package (most popular)
      const defaultPackage = packages.find(pkg => pkg.name === 'Easier') || packages[0];
      setSelectedPackageId(defaultPackage.id);
    }
  }, [packages, selectedPackageId]);

  const selectedPackage = packages?.find(pkg => pkg.id === selectedPackageId);
  
  const pricing = useMemo(() => {
    if (!pricingData || !selectedPackageId || employeeCount < 5) return null;
    return calculatePricing(employeeCount, selectedPackageId, isThreeYear ? 3 : 1, pricingData);
  }, [pricingData, selectedPackageId, employeeCount, isThreeYear]);

  const handleEmployeeCountChange = (value: string) => {
    const count = parseInt(value) || 5;
    setEmployeeCount(Math.max(5, count));
  };

  if (pricingLoading || packagesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Calculate Your Training Investment
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Flexible per-seat pricing that grows with your business. Get instant pricing based on your team size.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Calculator Controls */}
          <Card className="p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Pricing Calculator
              </CardTitle>
              <CardDescription>
                Customize your training package and see real-time pricing
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-0 space-y-8">
              {/* Employee Count */}
              <div className="space-y-3">
                <Label htmlFor="employees" className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Number of Employees
                </Label>
                <Input
                  id="employees"
                  type="number"
                  min="5"
                  value={employeeCount}
                  onChange={(e) => handleEmployeeCountChange(e.target.value)}
                  className="text-lg p-4 h-12"
                  placeholder="Minimum 5 employees"
                />
                <p className="text-sm text-gray-500">Minimum 5 employees required</p>
              </div>

              {/* Course Package Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Choose Your Training Package</Label>
                <div className="grid grid-cols-1 gap-3">
                  {packages?.map((pkg) => {
                    // Calculate per-seat pricing for this package
                    const packagePricing = pricingData && employeeCount >= 5 
                      ? calculatePricing(employeeCount, pkg.id, isThreeYear ? 3 : 1, pricingData)
                      : null;
                    
                    console.log(`Pricing for ${pkg.name}:`, packagePricing);
                    
                    return (
                      <Card
                        key={pkg.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedPackageId === pkg.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                                {pkg.name === 'Easier' && (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">Most Popular</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {pkg.description || `${pkg.course_count} training course${pkg.course_count !== 1 ? 's' : ''} included`}
                              </p>
                              
                              {/* Per-seat pricing display */}
                              {packagePricing ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-primary">
                                    ${packagePricing.pricePerUser.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-gray-500">per seat/month</span>
                                  {isThreeYear && packagePricing.discountPercentage > 0 && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                      -{packagePricing.discountPercentage}% with 3-year
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400">
                                    Calculating pricing...
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedPackageId === pkg.id && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Per-seat pricing explanation */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Per-seat pricing:</strong> Each employee gets access to all courses in the selected package. 
                    Pricing shown is per employee per month.
                  </p>
                </div>
              </div>

              {/* Term Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Subscription Term</Label>
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className={!isThreeYear ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                      1 Year
                    </span>
                    <Switch
                      checked={isThreeYear}
                      onCheckedChange={setIsThreeYear}
                    />
                    <span className={isThreeYear ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                      3 Years
                    </span>
                  </div>
                  {isThreeYear && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      15% Off
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Display */}
          <Card className="p-8 sticky top-6">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange rounded-lg flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-orange bg-clip-text text-transparent">
                  Here is your instant quote
                </CardTitle>
              </div>
              <CardDescription>
                {selectedPackage?.name} for {employeeCount} employees
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-0">
              {pricing ? (
                <div className="space-y-6">
                  {/* Main Pricing */}
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <div className="text-5xl font-bold text-primary mb-2">
                      ${pricing.monthlyPrice.toFixed(2)}
                    </div>
                    <div className="text-gray-600 mb-4">per month</div>
                    
                    {isThreeYear && pricing.savings > 0 && (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-semibold">
                          Save ${pricing.savings.toFixed(2)} over 3 years!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per employee:</span>
                      <span className="font-semibold">${pricing.pricePerUser.toFixed(2)}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base monthly total:</span>
                      <span>${pricing.basePrice.toFixed(2)}</span>
                    </div>
                    {isThreeYear && pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>3-year discount ({pricing.discountPercentage}%):</span>
                        <span>-${pricing.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total {isThreeYear ? '3-year' : '1-year'} cost:</span>
                      <span>${pricing.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started Today
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Start with a free trial • No setup fees • Cancel anytime
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your employee count to see pricing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};