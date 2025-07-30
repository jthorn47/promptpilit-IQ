import { useState, useEffect } from 'react';
import { ComplianceFramework } from '../types/index';

// Static compliance frameworks data
const complianceFrameworks: ComplianceFramework[] = [
  {
    id: 'ca-sb-553',
    name: "California SB 553",
    description: "Workplace Violence Prevention Plan requirements for California employers.",
    requirements: ["Written Prevention Plan", "Employee Training", "Incident Reporting", "Annual Review"],
    status: "Fully Supported",
    category: "State Law"
  },
  {
    id: 'ca-ab-1343',
    name: "California AB 1343",
    description: "Sexual harassment prevention training requirements for California employers.",
    requirements: ["Supervisor Training", "Employee Training", "Biennial Requirements", "Record Keeping"],
    status: "Fully Supported", 
    category: "State Law"
  },
  {
    id: 'osha-standards',
    name: "OSHA Standards",
    description: "Occupational Safety and Health Administration workplace safety requirements.",
    requirements: ["Hazard Communication", "PPE Standards", "Emergency Procedures", "Training Documentation"],
    status: "Fully Supported",
    category: "Federal"
  },
  {
    id: 'eeoc-guidelines',
    name: "EEOC Guidelines",
    description: "Equal Employment Opportunity Commission anti-discrimination requirements.",
    requirements: ["Anti-Harassment Policies", "Investigation Procedures", "Training Programs", "Corrective Actions"],
    status: "Fully Supported",
    category: "Federal"
  },
  {
    id: 'sox-compliance',
    name: "SOX Compliance",
    description: "Sarbanes-Oxley Act requirements for public companies and contractors.",
    requirements: ["Ethics Training", "Financial Controls", "Whistleblower Protection", "Documentation"],
    status: "Available",
    category: "Corporate"
  },
  {
    id: 'industry-standards',
    name: "Industry Standards",
    description: "Sector-specific compliance requirements for healthcare, finance, and manufacturing.",
    requirements: ["HIPAA Training", "PCI DSS", "FDA Regulations", "Custom Frameworks"],
    status: "Configurable",
    category: "Industry"
  }
];

export const useComplianceFrameworks = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async loading
    const loadFrameworks = () => {
      setLoading(true);
      setTimeout(() => {
        setFrameworks(complianceFrameworks);
        setLoading(false);
      }, 100);
    };

    loadFrameworks();
  }, []);

  return {
    frameworks,
    loading,
    error: null
  };
};