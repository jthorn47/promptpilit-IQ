import { useState } from 'react';
import { RiskAnalysis } from '../types';

export const useRiskAnalysis = () => {
  const [loading, setLoading] = useState(false);

  const analyzeRisk = async (responses: any): Promise<RiskAnalysis> => {
    setLoading(true);
    try {
      // Mock risk analysis - in production this would be more sophisticated
      const totalQuestions = Object.keys(responses).length;
      const riskResponses = Object.values(responses).filter((response: any) => 
        response === 'high_risk' || response === 'yes' || response === 'often'
      ).length;
      
      const score = Math.round((riskResponses / totalQuestions) * 100);
      
      let level: RiskAnalysis['level'];
      if (score >= 75) level = 'critical';
      else if (score >= 50) level = 'high';
      else if (score >= 25) level = 'medium';
      else level = 'low';

      const analysis: RiskAnalysis = {
        score,
        level,
        categories: {
          'Safety Procedures': Math.random() * 100,
          'Training': Math.random() * 100,
          'Compliance': Math.random() * 100,
          'Communication': Math.random() * 100,
        },
        recommendations: [
          'Implement comprehensive safety training program',
          'Update workplace violence prevention policies',
          'Establish clear reporting procedures',
          'Conduct regular safety assessments',
        ],
        priority_actions: [
          'Schedule immediate safety training for all staff',
          'Review and update emergency procedures',
          'Install additional security measures',
        ],
      };

      return analysis;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeRisk,
    loading,
  };
};