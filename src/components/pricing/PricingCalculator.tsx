import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, Calculator, TrendingDown, Check, Shield, Award, Zap } from "lucide-react";
import { CoursePackage } from "@/hooks/usePricingData";

interface PricingCalculatorProps {
  employeeCount: number | string;
  selectedPackageId: string;
  isThreeYear: boolean;
  packages: CoursePackage[] | undefined;
  onEmployeeCountChange: (value: string) => void;
  onEmployeeCountBlur: () => void;
  onPackageSelect: (packageId: string) => void;
  onTermChange: (isThreeYear: boolean) => void;
}

export const PricingCalculator = ({
  employeeCount,
  selectedPackageId,
  isThreeYear,
  packages,
  onEmployeeCountChange,
  onEmployeeCountBlur,
  onPackageSelect,
  onTermChange
}: PricingCalculatorProps) => {
  return (
    <Card className="p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 lg:mb-16 bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-100 shadow-xl">
      <CardHeader className="text-center pb-4 sm:pb-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Calculate Your Pricing
          </CardTitle>
        </div>
        <CardDescription className="text-sm sm:text-base lg:text-lg text-gray-600">
          See live pricing for all plans based on your team size and subscription term
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Employee Count */}
          <div className="space-y-4">
            <Label htmlFor="employees" className="text-base sm:text-lg font-semibold flex items-center gap-2 sm:gap-3 text-gray-800">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-sm sm:text-base">Number of Employees</span>
            </Label>
            <Input
              id="employees"
              type="number"
              min="5"
              value={employeeCount}
              onChange={(e) => onEmployeeCountChange(e.target.value)}
              onBlur={onEmployeeCountBlur}
              className="text-lg sm:text-xl p-4 sm:p-6 h-12 sm:h-14 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
              placeholder="Min 5 employees"
            />
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-xs sm:text-sm">Minimum 5 employees required</span>
            </p>
          </div>

          {/* Course Package Selection */}
          <div className="space-y-4">
            <Label className="text-base sm:text-lg font-semibold text-gray-800">Training Package</Label>
            <div className="space-y-3">
              {packages?.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className={`cursor-pointer transition-all duration-300 p-3 sm:p-4 rounded-xl border-2 ${
                      selectedPackageId === pkg.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => onPackageSelect(pkg.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}>
                          {index === 0 ? <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> : 
                           index === 1 ? <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> :
                           <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-gray-900">{pkg.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{pkg.course_count === 999 ? 'All Courses' : `${pkg.course_count} Course${pkg.course_count > 1 ? 's' : ''}`}</p>
                        </div>
                      </div>
                      {selectedPackageId === pkg.id && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Term Selection */}
          <div className="space-y-4">
            <Label className="text-base sm:text-lg font-semibold text-gray-800">Subscription Term</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <span className={`text-sm sm:text-base ${!isThreeYear ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                    1 Year
                  </span>
                  <Switch
                    checked={isThreeYear}
                    onCheckedChange={onTermChange}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                  />
                  <span className={`text-sm sm:text-base ${isThreeYear ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                    3 Years
                  </span>
                </div>
              </div>
              {isThreeYear && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shadow-lg w-full justify-center">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  15% Off 3-Year Plans
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};