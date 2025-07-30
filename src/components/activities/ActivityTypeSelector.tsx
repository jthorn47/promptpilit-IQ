import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ActivityTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const ACTIVITY_TYPES = {
  "Non-Revenue Stage": [
    { value: "intro_call_discovery", label: "Intro Call – Discovery" },
    { value: "followup_call_sales", label: "Follow-Up Call – Sales" },
    { value: "compliance_review_call", label: "Compliance Review Call" },
    { value: "email_outreach", label: "Email – Outreach" },
    { value: "email_followup", label: "Email – Follow-Up" },
    { value: "meeting_demo", label: "Meeting – Demo / Overview" },
    { value: "meeting_hr_risk_review", label: "Meeting – HR Risk Review" },
    { value: "hr_risk_assessment_completed", label: "HR Risk Assessment Completed" },
    { value: "pricing_service_discussion", label: "Pricing / Service Discussion" },
    { value: "proposal_sent", label: "Proposal Sent" },
    { value: "contract_sent", label: "Contract Sent for Signature" },
    { value: "no_fit_disqualified", label: "No Fit / Disqualified" }
  ],
  "Conversion": [
    { value: "contract_signed", label: "Contract Signed / Client Won" },
    { value: "kickoff_scheduled", label: "Kickoff Scheduled" },
    { value: "service_activated", label: "Service Activated" }
  ],
  "Client Management": [
    { value: "training_assigned", label: "Training Assigned" },
    { value: "workplace_violence_plan_submitted", label: "Workplace Violence Plan Submitted" },
    { value: "support_request_logged", label: "Support Request Logged" },
    { value: "client_checkin_quarterly", label: "Client Check-In – Quarterly" },
    { value: "client_checkin_issue_resolution", label: "Client Check-In – Issue Resolution" },
    { value: "renewal_discussion", label: "Renewal Discussion" },
    { value: "plan_expired_inactive", label: "Plan Expired / Inactive" },
    { value: "reengagement_attempt", label: "Reengagement Attempt" }
  ]
};

export const ActivityTypeSelector: React.FC<ActivityTypeSelectorProps> = ({
  value,
  onChange,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Activity Type {required && "*"}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select activity type" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {Object.entries(ACTIVITY_TYPES).map(([category, types]) => (
            <div key={category}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                {category}
              </div>
              {types.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const getActivityTypeLabel = (value: string): string => {
  for (const category of Object.values(ACTIVITY_TYPES)) {
    const type = category.find(t => t.value === value);
    if (type) return type.label;
  }
  return value;
};

export const getActivityTypeCategory = (value: string): string => {
  for (const [category, types] of Object.entries(ACTIVITY_TYPES)) {
    if (types.find(t => t.value === value)) return category;
  }
  return "Other";
};