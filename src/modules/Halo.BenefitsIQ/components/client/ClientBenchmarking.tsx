// Client Benchmarking - Compare plans against industry standards
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Info,
  Download,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientBenchmarkingProps {
  companyId: string;
}

interface BenchmarkData {
  category: string;
  yourValue: number;
  industryAverage: number;
  regionalAverage: number;
  percentile: number;
  status: 'above' | 'below' | 'average';
}

interface IndustryComparison {
  metric: string;
  yourCompany: number;
  industryP25: number;
  industryP50: number;
  industryP75: number;
  unit: string;
  description: string;
}

export const ClientBenchmarking: React.FC<ClientBenchmarkingProps> = ({ 
  companyId 
}) => {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [industryComparisons, setIndustryComparisons] = useState<IndustryComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [selectedRegion, setSelectedRegion] = useState('west-coast');

  useEffect(() => {
    loadBenchmarkData();
  }, [companyId, selectedIndustry, selectedRegion]);

  const loadBenchmarkData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real app, this would come from benefit_benchmarks table
      setBenchmarkData([
        {
          category: 'Medical Premium (Employee)',
          yourValue: 450,
          industryAverage: 425,
          regionalAverage: 465,
          percentile: 65,
          status: 'above'
        },
        {
          category: 'Employer Contribution %',
          yourValue: 80,
          industryAverage: 75,
          regionalAverage: 78,
          percentile: 72,
          status: 'above'
        },
        {
          category: 'Deductible Amount',
          yourValue: 1000,
          industryAverage: 1250,
          regionalAverage: 1100,
          percentile: 25,
          status: 'below'
        },
        {
          category: 'Annual Out-of-Pocket Max',
          yourValue: 3000,
          industryAverage: 3500,
          regionalAverage: 3200,
          percentile: 35,
          status: 'below'
        }
      ]);

      setIndustryComparisons([
        {
          metric: 'Total Benefits Cost per Employee',
          yourCompany: 12500,
          industryP25: 10000,
          industryP50: 12000,
          industryP75: 15000,
          unit: '$',
          description: 'Annual employer cost for all benefits per employee'
        },
        {
          metric: 'Medical Plan Richness Score',
          yourCompany: 85,
          industryP25: 75,
          industryP50: 80,
          industryP75: 90,
          unit: 'pts',
          description: 'Comprehensive score based on coverage levels and cost-sharing'
        },
        {
          metric: 'Employee Satisfaction Score',
          yourCompany: 4.2,
          industryP25: 3.8,
          industryP50: 4.0,
          industryP75: 4.3,
          unit: '/5',
          description: 'Average employee rating of benefits package'
        },
        {
          metric: 'Voluntary Benefits Adoption',
          yourCompany: 65,
          industryP25: 45,
          industryP50: 55,
          industryP75: 70,
          unit: '%',
          description: 'Percentage of employees enrolled in voluntary benefits'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading benchmark data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'above': return 'text-green-600 bg-green-50';
      case 'below': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'above': return 'Above Average';
      case 'below': return 'Below Average';
      case 'average': return 'Average';
      default: return 'Unknown';
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'text-green-600';
    if (percentile >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculatePercentilePosition = (company: number, p25: number, p50: number, p75: number) => {
    if (company <= p25) return 25;
    if (company <= p50) return 25 + ((company - p25) / (p50 - p25)) * 25;
    if (company <= p75) return 50 + ((company - p50) / (p75 - p50)) * 25;
    return 75 + Math.min(((company - p75) / (p75 * 0.5)) * 25, 25);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Benefits Benchmarking
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compare your benefits package against industry and regional standards
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
              </select>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="west-coast">West Coast</option>
                <option value="east-coast">East Coast</option>
                <option value="midwest">Midwest</option>
                <option value="south">South</option>
                <option value="national">National</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {benchmarkData.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{item.category}</h3>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusText(item.status)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Company</span>
                    <span className="font-bold">${item.yourValue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Industry Avg</span>
                    <span>${item.industryAverage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Regional Avg</span>
                    <span>${item.regionalAverage}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Percentile</span>
                    <span className={`text-xs font-medium ${getPercentileColor(item.percentile)}`}>
                      {item.percentile}th
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Industry Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Industry Position Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {industryComparisons.map((comparison, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{comparison.metric}</h3>
                    <p className="text-sm text-muted-foreground">{comparison.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {comparison.unit === '$' ? '$' : ''}{comparison.yourCompany.toLocaleString()}{comparison.unit !== '$' ? comparison.unit : ''}
                    </div>
                    <div className="text-sm text-muted-foreground">Your Company</div>
                  </div>
                </div>
                
                {/* Percentile Visualization */}
                <div className="relative">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>25th</span>
                    <span>50th</span>
                    <span>75th</span>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full">
                    {/* Quartile markers */}
                    <div className="absolute left-1/4 top-0 h-full w-0.5 bg-gray-400"></div>
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-400"></div>
                    <div className="absolute left-3/4 top-0 h-full w-0.5 bg-gray-400"></div>
                    
                    {/* Company position */}
                    <div 
                      className="absolute top-1 h-4 w-4 bg-blue-600 rounded-full transform -translate-x-1/2"
                      style={{ 
                        left: `${Math.min(Math.max(calculatePercentilePosition(
                          comparison.yourCompany, 
                          comparison.industryP25, 
                          comparison.industryP50, 
                          comparison.industryP75
                        ), 5), 95)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>{comparison.unit === '$' ? '$' : ''}{comparison.industryP25.toLocaleString()}{comparison.unit !== '$' ? comparison.unit : ''}</span>
                    <span>{comparison.unit === '$' ? '$' : ''}{comparison.industryP50.toLocaleString()}{comparison.unit !== '$' ? comparison.unit : ''}</span>
                    <span>{comparison.unit === '$' ? '$' : ''}{comparison.industryP75.toLocaleString()}{comparison.unit !== '$' ? comparison.unit : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Benchmarking Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">Strong Performance</h3>
                <p className="text-sm text-green-700">
                  Your employer contribution percentage (80%) ranks in the 72nd percentile, 
                  demonstrating strong commitment to employee benefits.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Competitive Advantage</h3>
                <p className="text-sm text-blue-700">
                  Your lower deductible ($1,000 vs $1,250 industry average) provides 
                  better financial protection for employees.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <Target className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900">Optimization Opportunity</h3>
                <p className="text-sm text-orange-700">
                  Consider exploring carrier alternatives to potentially reduce premium costs 
                  while maintaining current coverage levels.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};