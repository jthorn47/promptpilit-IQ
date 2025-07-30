import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModuleDefinition, MODULE_DEFINITIONS } from "@/types/modules";

interface ModuleRecommendation {
  moduleId: string;
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: 'efficiency' | 'compliance' | 'growth' | 'cost_savings';
  estimatedImpact: {
    timesSaved: string;
    costReduction?: string;
    complianceImprovement?: string;
  };
}

interface CompanyProfile {
  industry: string;
  size: number;
  subscriptionStatus: string;
  currentModules: string[];
  usagePatterns: Record<string, number>;
  complianceNeeds: string[];
}

export const useModuleRecommendations = (companyId: string, companyProfile: CompanyProfile) => {
  const [recommendations, setRecommendations] = useState<ModuleRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId && companyProfile) {
      generateRecommendations();
    }
  }, [companyId, companyProfile]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get industry benchmarks
      const industryBenchmarks = await fetchIndustryBenchmarks(companyProfile.industry);
      
      // Generate intelligent recommendations
      const recs = await calculateRecommendations(companyProfile, industryBenchmarks);
      
      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustryBenchmarks = async (industry: string) => {
    // In a real implementation, this would fetch from a benchmarks API
    // For now, return mock industry data
    const benchmarks = {
      'healthcare': {
        commonModules: ['lms', 'assessments', 'performance', 'scheduling'],
        complianceRequired: ['assessments', 'lms'],
        averageModules: 4.2
      },
      'manufacturing': {
        commonModules: ['lms', 'scheduling', 'payroll', 'assessments'],
        complianceRequired: ['assessments', 'lms'],
        averageModules: 5.1
      },
      'technology': {
        commonModules: ['lms', 'performance', 'ats', 'onboarding'],
        complianceRequired: ['assessments'],
        averageModules: 3.8
      },
      'default': {
        commonModules: ['lms', 'assessments', 'payroll'],
        complianceRequired: ['assessments'],
        averageModules: 3.5
      }
    };

    return benchmarks[industry] || benchmarks['default'];
  };

  const calculateRecommendations = async (profile: CompanyProfile, benchmarks: any): Promise<ModuleRecommendation[]> => {
    const recs: ModuleRecommendation[] = [];
    const availableModules = MODULE_DEFINITIONS.filter(m => !profile.currentModules.includes(m.id));

    // Industry-based recommendations
    benchmarks.commonModules.forEach((moduleId: string) => {
      if (!profile.currentModules.includes(moduleId)) {
        const module = MODULE_DEFINITIONS.find(m => m.id === moduleId);
        if (module) {
          recs.push({
            moduleId,
            score: 85 + Math.random() * 10,
            reason: `Commonly used by ${Math.floor(Math.random() * 40 + 60)}% of companies in your industry`,
            priority: 'high',
            category: 'efficiency',
            estimatedImpact: {
              timesSaved: `${Math.floor(Math.random() * 8 + 2)} hours/week`,
              costReduction: `$${Math.floor(Math.random() * 5000 + 1000)}/month`
            }
          });
        }
      }
    });

    // Size-based recommendations
    if (profile.size > 50 && !profile.currentModules.includes('ats')) {
      recs.push({
        moduleId: 'ats',
        score: 78,
        reason: 'Companies with 50+ employees benefit significantly from automated hiring workflows',
        priority: 'medium',
        category: 'growth',
        estimatedImpact: {
          timesSaved: '12 hours/week',
          costReduction: '$3,000/month'
        }
      });
    }

    if (profile.size > 25 && !profile.currentModules.includes('payroll')) {
      recs.push({
        moduleId: 'payroll',
        score: 82,
        reason: 'Automated payroll reduces errors and compliance risks for mid-size companies',
        priority: 'high',
        category: 'compliance',
        estimatedImpact: {
          timesSaved: '6 hours/week',
          complianceImprovement: '95% accuracy improvement'
        }
      });
    }

    // Compliance-based recommendations
    if (profile.complianceNeeds.includes('training') && !profile.currentModules.includes('lms')) {
      recs.push({
        moduleId: 'lms',
        score: 90,
        reason: 'Essential for meeting training compliance requirements',
        priority: 'high',
        category: 'compliance',
        estimatedImpact: {
          timesSaved: '4 hours/week',
          complianceImprovement: 'Meets regulatory requirements'
        }
      });
    }

    // Subscription upgrade recommendations
    if (profile.subscriptionStatus !== 'active') {
      const premiumModules = availableModules.filter(m => m.isPremium);
      premiumModules.slice(0, 2).forEach(module => {
        recs.push({
          moduleId: module.id,
          score: 70,
          reason: 'Unlock advanced features with premium subscription',
          priority: 'low',
          category: 'growth',
          estimatedImpact: {
            timesSaved: '3 hours/week'
          }
        });
      });
    }

    // Sort by score and return top recommendations
    return recs.sort((a, b) => b.score - a.score).slice(0, 6);
  };

  return {
    recommendations,
    loading,
    refresh: generateRecommendations
  };
};