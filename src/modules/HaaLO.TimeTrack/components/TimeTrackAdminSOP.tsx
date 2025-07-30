/**
 * Time Track Admin SOP Manual
 * Comprehensive training manual for Time Track administrators
 * Accessible only to company_admin and super_admin roles
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Clock, 
  Shield, 
  Users, 
  Settings,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit
} from 'lucide-react';

interface SOPSection {
  id: string;
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

export const TimeTrackAdminSOP: React.FC = () => {
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  const [lastUpdated] = useState(new Date().toISOString());
  
  // Check permissions
  const hasAccess = userRoles?.includes('company_admin') || userRoles?.includes('super_admin');
  const canEdit = userRoles?.includes('super_admin');
  
  if (!hasAccess) {
    return null; // Hide completely if no access
  }

  const sections: SOPSection[] = [
    {
      id: 'getting-started',
      title: '1. Getting Started',
      content: `
## Overview
Welcome to the Time Track Admin Training Manual. This comprehensive guide will walk you through all aspects of managing the Time Track system as an administrator.

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Admin or Super Admin role access
- Mobile device for testing mobile features

### Initial Access
1. Log into HaaLO IQ with your administrator credentials
2. Navigate to the Time Track module
3. Verify your permissions and access levels
4. Complete initial system health check
      `,
    },
    {
      id: 'setup',
      title: '2. System Setup & Configuration',
      content: `
## Company Settings Configuration

### Basic Setup
1. **Company Profile**
   - Company name and address
   - Time zone configuration
   - Business hours setup
   - Holiday calendar import

2. **Time Policies**
   - Daily overtime thresholds (typically 8 hours)
   - Weekly overtime limits (typically 40 hours)
   - Double-time rules
   - Break requirements
   - Meal period policies

### Device Configuration
1. **Kiosk Setup**
   - Device registration
   - Location assignment
   - Photo capture settings
   - PIN requirements
   - Biometric options

2. **Mobile Configuration**
   - GPS tracking preferences
   - Photo requirements
   - Offline capabilities
   - Push notification settings
      `,
    },
    {
      id: 'employee-management',
      title: '3. Employee Management',
      content: `
## Employee Setup and Registration

### Adding Employees
1. **Basic Information**
   - Employee ID/Number
   - Name and contact details
   - Department and location
   - Job title and classification
   - Start date and employment status

2. **Time Tracking Settings**
   - Assign to time tracking system
   - Set pay grade and overtime rules
   - Configure break schedules
   - Setup reporting manager

### Registration Process
1. **Generate Registration Tokens**
   - Create secure registration links
   - Set expiration dates (recommended: 72 hours)
   - Send to employee via secure method

2. **Employee Self-Registration**
   - PIN setup and confirmation
   - Photo capture for verification
   - Terms of service acceptance
   - Mobile app installation (if applicable)

### Employee Status Management
- Active, Inactive, Terminated status changes
- Temporary suspensions
- Role and permission updates
- Transfer between departments/locations
      `,
    },
    {
      id: 'scheduling',
      title: '4. Scheduling & Shift Management',
      content: `
## Creating and Managing Schedules

### Shift Templates
1. **Standard Templates**
   - Regular business hours (9-5, 8-hour shifts)
   - Split shifts and rotating schedules
   - Part-time and flexible arrangements
   - Holiday and weekend schedules

2. **Template Management**
   - Create reusable shift patterns
   - Assign job codes and locations
   - Set break requirements
   - Configure overtime triggers

### Schedule Assignment
1. **Individual Scheduling**
   - Assign shifts to specific employees
   - Override default templates when needed
   - Handle schedule conflicts and changes
   - Manage time-off requests integration

2. **Bulk Scheduling**
   - Import schedules from external systems
   - Copy previous week/month patterns
   - Mass assignment by department
   - Automated recurring schedules

### Schedule Enforcement
- Early clock-in prevention
- Late arrival notifications
- Unscheduled punch blocking
- Schedule variance reporting
      `,
    },
    {
      id: 'punch-management',
      title: '5. Time Punch Management',
      content: `
## Time Punch Operations

### Punch Types and Rules
1. **Standard Punches**
   - Clock In/Out
   - Break Start/End
   - Meal periods
   - Job transfers

2. **Special Scenarios**
   - Manual punch entry
   - Missed punch corrections
   - Retroactive adjustments
   - Emergency procedures

### Photo Verification
1. **Photo Requirements**
   - When photos are mandatory
   - Quality standards and validation
   - Storage and retention policies
   - Privacy and compliance considerations

2. **Troubleshooting Photo Issues**
   - Camera access problems
   - Poor image quality
   - Storage capacity issues
   - Network connectivity problems

### Punch Corrections
- Edit punch times
- Add missing punches
- Delete duplicate entries
- Bulk correction procedures
- Audit trail maintenance
      `,
    },
    {
      id: 'timecard-processing',
      title: '6. Timecard Processing',
      content: `
## Timecard Review and Approval

### Daily Processing
1. **Daily Review Tasks**
   - Verify all expected punches received
   - Check for overtime and compliance issues
   - Review photo verification status
   - Process correction requests

2. **Exception Handling**
   - Missing punches
   - Late arrivals and early departures
   - Unscheduled overtime
   - Schedule deviations

### Weekly Processing
1. **Week-End Procedures**
   - Calculate total hours worked
   - Apply overtime calculations
   - Generate compliance reports
   - Prepare for payroll export

2. **Approval Workflow**
   - Supervisor review process
   - Manager approval levels
   - Exception escalation
   - Final approval and lock

### Payroll Integration
- Export timecard data
- Verify hour calculations
- Handle pay period adjustments
- Generate payroll reports
      `,
    },
    {
      id: 'compliance-monitoring',
      title: '7. Compliance Monitoring',
      content: `
## Regulatory Compliance Management

### Labor Law Compliance
1. **Break and Meal Requirements**
   - State-specific break laws
   - Meal period enforcement
   - Documentation requirements
   - Violation tracking and reporting

2. **Overtime Regulations**
   - FLSA overtime rules
   - State overtime variations
   - Double-time requirements
   - Weekly vs. daily calculations

### Documentation Requirements
1. **Record Keeping**
   - Minimum retention periods
   - Audit trail maintenance
   - Employee acknowledgments
   - Policy documentation

2. **Compliance Reporting**
   - Violation summaries
   - Trend analysis
   - Corrective action tracking
   - Regulatory filing preparation

### Audit Preparation
- Internal audit procedures
- External audit support
- Documentation organization
- Compliance verification
      `,
    },
    {
      id: 'reporting-analytics',
      title: '8. Reporting & Analytics',
      content: `
## Comprehensive Reporting System

### Standard Reports
1. **Daily Reports**
   - Attendance summary
   - Exception reports
   - Photo verification status
   - Schedule adherence

2. **Weekly Reports**
   - Hours worked summary
   - Overtime analysis
   - Compliance violations
   - Productivity metrics

3. **Monthly Reports**
   - Trend analysis
   - Cost center reporting
   - Employee performance
   - System utilization

### Custom Analytics
1. **Dashboard Configuration**
   - Key performance indicators
   - Real-time monitoring
   - Alert thresholds
   - Custom widgets

2. **Advanced Analytics**
   - Predictive modeling
   - Workforce optimization
   - Cost analysis
   - Efficiency metrics

### Report Distribution
- Automated report scheduling
- Email delivery setup
- Access controls and permissions
- Export formats and integration
      `,
    },
    {
      id: 'mobile-features',
      title: '9. Mobile Features & Management',
      content: `
## Mobile Time Tracking Administration

### Mobile App Configuration
1. **Feature Settings**
   - GPS tracking requirements
   - Photo capture mandatory/optional
   - Offline capability limits
   - Push notification preferences

2. **Security Settings**
   - Device authentication
   - Biometric requirements
   - Session timeout
   - Remote wipe capabilities

### Employee Mobile Support
1. **Onboarding Process**
   - App installation guidance
   - Initial setup assistance
   - Permission configuration
   - Testing and verification

2. **Troubleshooting Common Issues**
   - GPS accuracy problems
   - Battery optimization conflicts
   - Network connectivity issues
   - App performance problems

### Mobile Device Management
- Device registration and approval
- Security policy enforcement
- Remote monitoring and control
- Update and maintenance procedures
      `,
    },
    {
      id: 'kiosk-administration',
      title: '10. Kiosk Administration',
      content: `
## Time Clock Kiosk Management

### Kiosk Setup and Configuration
1. **Hardware Setup**
   - Device placement and mounting
   - Network configuration
   - Power and backup systems
   - Camera and biometric setup

2. **Software Configuration**
   - Application installation
   - Security settings
   - User interface customization
   - Integration with backend systems

### Daily Operations
1. **Monitoring and Maintenance**
   - Device health checks
   - Network connectivity verification
   - Photo storage management
   - Performance optimization

2. **User Support**
   - Punch assistance procedures
   - Troubleshooting common issues
   - Emergency procedures
   - Escalation processes

### Security Management
- Physical security measures
- Access control and permissions
- Data protection protocols
- Incident response procedures
      `,
    },
    {
      id: 'integrations',
      title: '11. System Integrations',
      content: `
## Integration Management

### Payroll System Integration
1. **Data Export Procedures**
   - Export scheduling and automation
   - Data format specifications
   - Quality assurance checks
   - Error handling and recovery

2. **Reconciliation Process**
   - Data validation procedures
   - Discrepancy identification
   - Correction workflows
   - Approval and confirmation

### HR System Integration
1. **Employee Data Synchronization**
   - New hire processing
   - Status changes and updates
   - Termination procedures
   - Department transfers

2. **Organizational Structure**
   - Department and location updates
   - Supervisor hierarchy changes
   - Job classification updates
   - Pay grade modifications

### Third-Party Applications
- API configuration and management
- Data sharing agreements
- Security considerations
- Performance monitoring
      `,
    },
    {
      id: 'troubleshooting',
      title: '12. Troubleshooting & Support',
      content: `
## Common Issues and Solutions

### Employee Issues
1. **Login and Access Problems**
   - Password reset procedures
   - Account lockout resolution
   - Permission issues
   - Device-specific problems

2. **Punch Recording Issues**
   - Failed punch scenarios
   - Duplicate punch handling
   - Time zone problems
   - Schedule conflicts

### System Issues
1. **Performance Problems**
   - Slow response times
   - Database connectivity issues
   - Network latency problems
   - Server capacity concerns

2. **Data Integrity Issues**
   - Missing data recovery
   - Corruption detection and repair
   - Backup and restore procedures
   - Audit trail verification

### Escalation Procedures
- Internal support levels
- Vendor support contacts
- Emergency procedures
- Documentation requirements
      `,
    },
    {
      id: 'security-privacy',
      title: '13. Security & Privacy',
      content: `
## Security and Privacy Management

### Data Security
1. **Access Controls**
   - User authentication systems
   - Role-based permissions
   - Session management
   - Multi-factor authentication

2. **Data Protection**
   - Encryption requirements
   - Secure transmission protocols
   - Storage security measures
   - Backup encryption

### Privacy Compliance
1. **Employee Privacy Rights**
   - Photo storage and usage policies
   - Location tracking disclosures
   - Data retention policies
   - Access and deletion rights

2. **Regulatory Compliance**
   - GDPR requirements
   - CCPA compliance
   - Industry-specific regulations
   - Cross-border data transfers

### Incident Response
- Security breach procedures
- Privacy violation handling
- Notification requirements
- Recovery and remediation
      `,
    },
    {
      id: 'maintenance-updates',
      title: '14. System Maintenance & Updates',
      content: `
## Ongoing System Management

### Routine Maintenance
1. **Daily Tasks**
   - System health monitoring
   - Backup verification
   - Performance checks
   - User activity review

2. **Weekly Tasks**
   - Database maintenance
   - Log file management
   - Security updates
   - Capacity planning

3. **Monthly Tasks**
   - Full system backup
   - Performance analysis
   - User access review
   - Compliance audits

### Update Management
1. **Software Updates**
   - Update scheduling and planning
   - Testing procedures
   - Rollback plans
   - User communication

2. **Configuration Changes**
   - Change management process
   - Testing requirements
   - Approval workflows
   - Documentation updates

### Disaster Recovery
- Backup and recovery procedures
- Business continuity planning
- Emergency contact lists
- Recovery time objectives
      `,
    },
  ];

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Generation",
      description: "PDF download functionality would be implemented here",
      variant: "default"
    });
  };

  const TableOfContents = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block text-sm text-blue-600 hover:text-blue-800 hover:underline py-1"
            >
              {section.title}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Time Track Admin Training Manual
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary">Version 1.0</Badge>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last Updated: {new Date(lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Access Badges */}
      <div className="flex gap-2">
        <Badge variant="default" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Admin Access Required
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          Company Admin
        </Badge>
        {canEdit && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Super Admin
          </Badge>
        )}
      </div>

      {/* Table of Contents */}
      <TableOfContents />

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Important Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>
            This manual contains sensitive administrative information for the Time Track system. 
            Access is restricted to Company Administrators and Super Administrators only. 
            Please ensure all procedures are followed carefully and securely.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Before You Begin</h4>
                <p className="text-blue-800 text-sm mt-1">
                  Ensure you have completed the initial administrator setup and have access to all required systems and credentials.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <Card key={section.id} id={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: section.content.replace(/\n/g, '<br />').replace(/###\s/g, '<h3>').replace(/##\s/g, '<h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 HaaLO IQ - Time Track Admin Training Manual</p>
            <p>For support or questions, contact your system administrator</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackAdminSOP;