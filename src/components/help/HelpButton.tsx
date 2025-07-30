import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, ExternalLink, Clock, Users, DollarSign, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface HelpButtonProps {
  context?: 'payroll' | 'timeentry' | 'paystubs' | 'benefits' | 'admin' | 'general';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  context = 'general',
  variant = 'ghost',
  size = 'sm' 
}) => {
  const [open, setOpen] = useState(false);

  const helpContent = {
    payroll: {
      title: 'Payroll Help',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Get help with payroll processing and management',
      sections: [
        {
          title: 'Processing Payroll',
          items: [
            'Review time entries for all employees',
            'Validate calculations and deductions',
            'Approve payroll for processing',
            'Generate pay stubs and ACH files'
          ]
        },
        {
          title: 'Common Issues',
          items: [
            'Missing time entries - Contact employee supervisor',
            'Negative net pay - Review deductions and withholdings',
            'Bank account errors - Update employee banking information',
            'Tax calculation issues - Verify current tax tables'
          ]
        }
      ]
    },
    timeentry: {
      title: 'Time Entry Help',
      icon: <Clock className="h-5 w-5" />,
      description: 'Learn how to enter and manage your work hours',
      sections: [
        {
          title: 'Entering Time',
          items: [
            'Enter hours worked for each day',
            'Add overtime hours if applicable',
            'Include break deductions if required',
            'Submit before the deadline'
          ]
        },
        {
          title: 'Tips & Best Practices',
          items: [
            'Submit early to avoid last-minute issues',
            'Double-check all entries before submitting',
            'Contact supervisor for corrections',
            'Save your work frequently'
          ]
        }
      ]
    },
    paystubs: {
      title: 'Pay Stub Help',
      icon: <FileText className="h-5 w-5" />,
      description: 'Understanding your pay stub and payment information',
      sections: [
        {
          title: 'Pay Stub Sections',
          items: [
            'Gross Pay - Total earnings before deductions',
            'Deductions - Taxes, benefits, and other withholdings',
            'Net Pay - Amount deposited to your account',
            'Year-to-Date - Running totals for the tax year'
          ]
        },
        {
          title: 'Direct Deposit',
          items: [
            'Set up bank account information',
            'Verify routing and account numbers',
            'Allow 1-2 pay cycles for activation',
            'Contact HR for banking issues'
          ]
        }
      ]
    },
    benefits: {
      title: 'Benefits Help',
      icon: <Users className="h-5 w-5" />,
      description: 'Managing your benefits and enrollment',
      sections: [
        {
          title: 'Enrollment',
          items: [
            'Review available benefit plans',
            'Select coverage options',
            'Add eligible dependents',
            'Submit elections during open enrollment'
          ]
        },
        {
          title: 'Making Changes',
          items: [
            'Changes typically allowed during open enrollment only',
            'Life events may allow special enrollment periods',
            'Contact HR for guidance on benefit changes',
            'Update dependent information as needed'
          ]
        }
      ]
    },
    admin: {
      title: 'Admin Help',
      icon: <Users className="h-5 w-5" />,
      description: 'Administrative functions and system management',
      sections: [
        {
          title: 'System Overview',
          items: [
            'Monitor system performance and alerts',
            'Review payroll processing status',
            'Manage user access and permissions',
            'Generate reports and analytics'
          ]
        },
        {
          title: 'Troubleshooting',
          items: [
            'Check edge function logs for errors',
            'Validate database connections',
            'Review audit trails for issues',
            'Escalate critical problems to development team'
          ]
        }
      ]
    },
    general: {
      title: 'Help & Support',
      icon: <HelpCircle className="h-5 w-5" />,
      description: 'General help and support information',
      sections: [
        {
          title: 'Getting Started',
          items: [
            'Navigate using the main menu',
            'Use breadcrumbs to track your location',
            'Look for help icons throughout the system',
            'Contact support for additional assistance'
          ]
        },
        {
          title: 'Support Resources',
          items: [
            'User guide and documentation',
            'Training materials and videos',
            'FAQ and common solutions',
            'Direct support contact information'
          ]
        }
      ]
    }
  };

  const content = helpContent[context];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.icon}
            {content.title}
          </DialogTitle>
          <DialogDescription>
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {content.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Quick Actions */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <ExternalLink className="h-3 w-3 mr-1" />
                User Guide
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <ExternalLink className="h-3 w-3 mr-1" />
                Training Videos
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <ExternalLink className="h-3 w-3 mr-1" />
                Contact Support
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpButton;