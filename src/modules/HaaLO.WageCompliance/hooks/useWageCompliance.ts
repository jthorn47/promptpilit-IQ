/**
 * useWageCompliance - React hook for wage compliance functionality
 */

import { useState, useEffect } from 'react';
import { WageService } from '../services/WageService';
import { OvertimeService } from '../services/OvertimeService';
import type { 
  WageComplianceDashboardData,
  WageComplianceCheck,
  OvertimeViolation,
  ComplianceAlert,
  ViolationType
} from '../types';

const wageService = new WageService();
const overtimeService = new OvertimeService();

export const useWageCompliance = () => {
  const [dashboardData, setDashboardData] = useState<WageComplianceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch wage compliance data
      const wageChecks = await wageService.getAllEmployeeWageChecks();
      const wageStats = await wageService.getWageComplianceStats();
      
      // Fetch overtime data
      const overtimeViolations = await overtimeService.getAllOvertimeViolations();
      const overtimeStats = await overtimeService.getOvertimeStats();

      // Calculate overall compliance score
      const totalViolations = wageStats.violations + overtimeStats.totalViolations;
      const totalEmployees = wageStats.totalEmployees;
      const overallScore = Math.max(0, 100 - (totalViolations / totalEmployees) * 20);

      // Mock recent findings
      const recentFindings = [
        {
          type: 'minimum-wage' as ViolationType,
          severity: 'high' as const,
          count: wageStats.violations,
          description: `${wageStats.violations} employees below minimum wage`,
          affectedEmployees: wageChecks.filter(c => c.status === 'violation').map(c => c.employeeId),
          potentialPenalty: wageStats.totalUnderpayment * 2, // Example penalty calculation
          recommendedFix: 'Increase wages to meet minimum requirements',
        },
        {
          type: 'overtime' as ViolationType,
          severity: 'medium' as const,
          count: overtimeStats.totalViolations,
          description: `${overtimeStats.totalViolations} overtime violations`,
          affectedEmployees: overtimeViolations.map(v => v.employeeId),
          potentialPenalty: overtimeStats.totalOwed * 1.5,
          recommendedFix: 'Review time tracking and pay owed overtime',
        },
      ];

      // Mock trend data (last 12 weeks)
      const trendData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (11 - i) * 7);
        return {
          date,
          score: Math.max(60, overallScore + Math.random() * 20 - 10),
          violations: Math.floor(Math.random() * 5),
        };
      });

      const data: WageComplianceDashboardData = {
        overallScore: Math.round(overallScore),
        totalViolations,
        activeAlerts: totalViolations > 0 ? 2 : 0,
        employeesAtRisk: new Set([
          ...wageChecks.filter(c => c.status !== 'compliant').map(c => c.employeeId),
          ...overtimeViolations.map(v => v.employeeId)
        ]).size,
        recentFindings,
        complianceByType: {
          'minimum-wage': wageStats.violations > 0 ? 'violation' : 'compliant',
          'overtime': overtimeStats.totalViolations > 0 ? 'violation' : 'compliant',
          'meal-break': 'compliant',
          'rest-break': 'compliant',
          'classification': 'compliant',
          'record-keeping': 'compliant',
        },
        trendData,
      };

      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    refreshData: fetchDashboardData,
  };
};

export const useWageChecks = () => {
  const [wageChecks, setWageChecks] = useState<WageComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWageChecks = async () => {
      try {
        const checks = await wageService.getAllEmployeeWageChecks();
        setWageChecks(checks);
      } catch (error) {
        console.error('Failed to fetch wage checks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWageChecks();
  }, []);

  return { wageChecks, loading };
};

export const useOvertimeViolations = () => {
  const [violations, setViolations] = useState<OvertimeViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const overtimeViolations = await overtimeService.getAllOvertimeViolations();
        setViolations(overtimeViolations);
      } catch (error) {
        console.error('Failed to fetch overtime violations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, []);

  return { violations, loading };
};