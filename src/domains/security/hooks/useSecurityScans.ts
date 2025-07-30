import { useState, useEffect } from 'react';
import { SecurityScan } from '../types';

const mockScans: SecurityScan[] = [
  {
    id: '1',
    scan_type: 'Vulnerability Scan',
    status: 'completed',
    vulnerabilities_found: 2,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86000000).toISOString()
  },
  {
    id: '2',
    scan_type: 'Penetration Test',
    status: 'running',
    vulnerabilities_found: 0,
    started_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export const useSecurityScans = () => {
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setScans(mockScans);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security scans');
      setLoading(false);
    }
  };

  const startScan = async (scanType: string) => {
    try {
      const newScan: SecurityScan = {
        id: Math.random().toString(36).substr(2, 9),
        scan_type: scanType,
        status: 'pending',
        vulnerabilities_found: 0,
        started_at: new Date().toISOString()
      };
      
      setScans(prev => [newScan, ...prev]);
      return { data: newScan, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scan';
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  return {
    scans,
    loading,
    error,
    startScan,
    refetch: fetchScans
  };
};