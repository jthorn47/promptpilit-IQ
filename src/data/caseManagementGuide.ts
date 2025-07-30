export const caseManagementGuideArticle = {
  title: "Case Management System: Complete Administrator Guide",
  category_name: "User Guides",
  excerpt: "Comprehensive guide for super administrators and administrators on managing client support cases, tracking billable hours, and generating analytical reports.",
  tags: ["case-management", "admin", "super-admin", "client-support", "billing", "analytics"],
  featured: true,
  status: "published",
  target_roles: ["super_admin", "company_admin", "admin"],
  content: `
# Case Management System: Complete Administrator Guide

The Case Management System is a comprehensive solution designed to streamline client support operations, track billable hours, and provide detailed analytics for administrative oversight.

## Table of Contents
1. System Overview
2. Access & Permissions  
3. Case Creation & Management
4. Time Entry & Billing
5. Analytics Dashboard
6. User Management
7. Best Practices
8. Troubleshooting

---

## System Overview

The Case Management System provides:
- **Centralized Case Tracking**: Manage all client support requests in one location
- **Billable Hour Tracking**: Automatically calculate labor costs based on user roles
- **Analytics & Reporting**: Real-time insights into case resolution and team performance
- **Role-Based Access**: Different permissions for super admins, company admins, and standard users

### Key Features
- ✅ Case creation, assignment, and status tracking
- ✅ Time entry with automatic billable rate calculation
- ✅ Priority and type classification
- ✅ Company association for client billing
- ✅ Real-time analytics dashboard
- ✅ Role-based user management
- ✅ Activity logging and audit trails

---

## Access & Permissions

### Super Administrator Access
**Super Admins** have complete system access and can:
- View and manage ALL cases across all companies
- Access all analytics and reporting features
- Manage user roles and permissions
- Assign cases to any user
- Override billable rates
- Access system administration features

### Company Administrator Access
**Company Admins** have company-specific access and can:
- View and manage cases within their company
- Access company-specific analytics
- Manage users within their company
- Assign cases to company team members
- Modify company settings and preferences

### Standard User Access
**Standard Users** can:
- View cases assigned to them
- Log time entries on their assigned cases
- Update case status and add notes
- View basic case analytics

---

## Case Creation & Management

### Creating a New Case

1. **Navigate to Cases**
   - Go to Admin → Command Center → Cases
   - Click "New Case" button

2. **Fill Required Information**
   - **Title**: Descriptive case title (e.g., "Payroll Setup - ABC Corp")
   - **Description**: Detailed description of the issue or request
   - **Type**: Select from:
     - general - General inquiries
     - technical - Technical support issues
     - billing - Billing-related matters
     - training - Training requests
     - urgent - Urgent matters requiring immediate attention
   - **Priority**: Choose appropriate level:
     - low - Non-urgent, can wait
     - medium - Standard priority
     - high - Important, needs attention
     - urgent - Critical, immediate action required

3. **Assignment & Company**
   - **Assigned To**: Select from available users
   - **Related Company**: Choose the client company (affects billing)
   - **Contact Email**: Client contact for follow-up

4. **Estimation**
   - **Estimated Hours**: Initial time estimate for completion

### Case Status Management

Cases progress through these statuses:
- **Open** → Initial state, active case
- **In Progress** → Currently being worked on
- **Waiting** → Awaiting client response or information
- **Resolved** → Issue resolved, pending closure
- **Closed** → Case completed and closed

### Case Assignment Best Practices

#### For Super Admins:
- Assign cases based on expertise and workload
- Monitor cross-company case distribution
- Ensure high-priority cases are properly staffed
- Use analytics to balance team workloads

#### For Company Admins:
- Assign cases to appropriate team members
- Monitor company-specific case resolution times
- Ensure client communication standards are met

---

## Time Entry & Billing

### Automatic Billable Rate Calculation

The system automatically calculates billable amounts based on user roles:

| Role | Hourly Rate |
|------|-------------|
| Super Admin | $150/hour |
| Company Admin | $125/hour |
| Admin | $95/hour |
| Learner/Standard | $75/hour |
| Default | $85/hour |

### Logging Time Entries

1. **Access Time Logging**
   - From case details, click "Log Time"
   - Or use the quick "Log Time" button in case cards

2. **Enter Time Details**
   - **Duration**: Hours and minutes worked
   - **Description**: Detailed work description
   - **Date**: When the work was performed
   - **Billable**: Toggle if time should be billed to client

3. **Automatic Calculations**
   - Labor cost is automatically calculated
   - Case "Actual Hours" is updated in real-time
   - Analytics dashboards reflect new data immediately

### Time Entry Best Practices

- **Be Specific**: Include detailed descriptions of work performed
- **Log Daily**: Don't wait to log time entries
- **Use Billable Flag**: Mark non-billable time appropriately (internal training, etc.)
- **Round Appropriately**: Use standard time increments (15-minute blocks)

---

## Analytics Dashboard

### Key Performance Indicators

The analytics dashboard provides real-time insights:

#### Case Metrics
- **Total Active Cases**: Currently open and in-progress cases
- **Cases by Status**: Distribution across all status types
- **Cases by Priority**: High, medium, low priority breakdown
- **Cases by Type**: Technical, billing, training, etc.

#### Time & Labor Analytics
- **Total Hours Logged**: Aggregate time across all cases
- **Total Labor Cost**: Sum of all billable time entries
- **Average Resolution Time**: Mean time from open to closed
- **Billable vs Non-Billable**: Revenue tracking

#### Team Performance
- **Cases by Assignee**: Workload distribution
- **Time by User**: Individual productivity metrics
- **Resolution Rates**: Team efficiency tracking

### Using Analytics for Management

#### For Super Admins:
- **Resource Planning**: Identify overloaded team members
- **Performance Monitoring**: Track individual and team productivity
- **Revenue Tracking**: Monitor billable hours and labor costs
- **Client Analysis**: Understand which companies require most support

#### For Company Admins:
- **Team Management**: Balance workloads within your company
- **Client Reporting**: Generate reports for client billing
- **Process Improvement**: Identify bottlenecks and inefficiencies

---

## User Management

### User Roles in Case Management

#### Assigning Cases
- Only assign cases to users with appropriate access levels
- Consider expertise, workload, and availability
- Use the user selection dropdown which shows only valid assignees

#### Managing Billable Rates
Super Admins can:
- View current billable rates in user profiles
- Override default rates for specific users
- Set custom rates for contractor or specialist roles

#### User Permissions
Ensure users have appropriate roles:
- **Case Access**: Users can only see cases they're assigned to (unless admin)
- **Time Entry**: All users can log time on their assigned cases
- **Analytics**: Access level varies by role

---

## Best Practices

### Case Management Workflow

1. **Intake Process**
   - Create cases promptly from client requests
   - Assign appropriate priority and type
   - Estimate time requirements

2. **Assignment Strategy**
   - Match expertise to case type
   - Balance workloads across team
   - Consider client preferences and history

3. **Progress Tracking**
   - Update case status regularly
   - Add notes for important developments
   - Log time entries consistently

4. **Resolution & Closure**
   - Confirm resolution with client
   - Document final outcomes
   - Close cases promptly after confirmation

### Communication Standards

- **Client Updates**: Regular status updates for high-priority cases
- **Internal Notes**: Document all significant actions
- **Handoff Documentation**: Clear notes when reassigning cases

### Quality Assurance

- **Regular Reviews**: Periodic case audits for quality
- **Time Accuracy**: Verify time entries for billing accuracy
- **Client Satisfaction**: Follow up on resolved cases

---

## Troubleshooting

### Common Issues

#### "Cannot See Cases"
**Cause**: User permissions or role assignment
**Solution**: 
- Verify user has appropriate role assignment
- Check if cases are assigned to the user
- Super Admins: Verify RLS policies are functioning

#### "Time Entries Not Calculating"
**Cause**: Missing billable rates or database issues
**Solution**:
- Check user profile for billable rate
- Verify case assignment is correct
- Contact system administrator if rates are missing

#### "Analytics Not Updating"
**Cause**: Database synchronization or caching issues
**Solution**:
- Refresh the dashboard page
- Check if time entries are properly saved
- Verify date ranges in analytics filters

#### "Cannot Assign Cases"
**Cause**: Insufficient permissions or user access
**Solution**:
- Verify admin role assignment
- Check if target user has appropriate access
- Ensure user is active in the system

### Performance Optimization

- **Regular Maintenance**: Close completed cases promptly
- **Data Cleanup**: Archive old cases periodically
- **Analytics Refresh**: Dashboard updates in real-time, but refresh if needed

---

## System Administration

### For Super Admins Only

#### Database Management
- **User Role Management**: Assign and modify user roles
- **Billable Rate Updates**: Modify default hourly rates
- **Company Management**: Create and manage client companies

#### System Monitoring
- **Performance Metrics**: Monitor system usage and performance
- **Data Integrity**: Regular audits of case and time data
- **Security Reviews**: Periodic access control audits

#### Advanced Features
- **Bulk Operations**: Mass case updates and assignments
- **Data Export**: Export case data for external reporting
- **Integration Management**: Connect with external systems

---

## Support & Resources

### Getting Help
- **System Issues**: Contact IT support team
- **Process Questions**: Refer to this guide or contact management
- **Feature Requests**: Submit through appropriate channels

### Training Resources
- **New User Onboarding**: Complete training modules
- **Advanced Features**: Request specialized training
- **Best Practices**: Regular team meetings and knowledge sharing

---

*This guide is maintained by the system administration team.*

**Version**: 1.0 | **Audience**: Super Administrators, Company Administrators
`
};