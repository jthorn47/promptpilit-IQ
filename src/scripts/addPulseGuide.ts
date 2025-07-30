import { supabase } from '@/integrations/supabase/client';

export async function addPulseGuide() {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if Pulse guide already exists
    const { data: existingArticle } = await supabase
      .from('knowledge_base_articles')
      .select('id')
      .eq('slug', 'pulse-comprehensive-guide')
      .single();

    if (existingArticle) {
      return { success: true, action: 'already exists' };
    }

    // Get or create the "Admin Guides" category
    let { data: category } = await supabase
      .from('knowledge_base_categories')
      .select('id')
      .eq('name', 'Admin Guides')
      .single();

    if (!category) {
      const { data: newCategory, error: categoryError } = await supabase
        .from('knowledge_base_categories')
        .insert([{
          name: 'Admin Guides',
          description: 'Comprehensive guides for system administrators',
          color: '#655DC6',
          icon: 'shield',
          sort_order: 1,
          is_active: true
        }])
        .select()
        .single();

      if (categoryError) throw categoryError;
      category = newCategory;
    }

    const pulseGuideContent = `# Pulse Case Management System - Complete Admin Guide

## Overview

**Pulse** is EaseLearn's comprehensive case management platform designed to streamline client support operations, track service delivery costs, and provide strategic insights for business growth. This guide covers all five phases of Pulse functionality.

---

## 🚀 Quick Start

### Accessing Pulse
1. Navigate to **Admin Dashboard** → **Cases** 
2. Or go directly to \`/admin/cases\` or \`/cases-manager\`
3. The system automatically loads with your company's case data

### Key Navigation Tabs:
- **Cases**: Main case management interface
- **Analytics**: Performance metrics and KPIs
- **Intelligence**: AI-powered insights and SLA monitoring
- **Reports**: Strategic reports and cost analysis
- **Pulse**: Real-time dashboard overview

---

## 📋 Phase 1: Core Case Management

### Creating New Cases
1. Click **"New Case"** button in the cases tab
2. Fill out the comprehensive case form:
   - **Title**: Clear, descriptive case summary
   - **Type**: Select from HR, Payroll, Benefits, Compliance, Safety, General Support
   - **Priority**: Critical, High, Medium, Low
   - **Company**: Link to client company
   - **Assigned To**: Team member responsible
   - **Estimated Hours**: Initial time estimate
   - **Description**: Detailed case information

### Case Workflow & Statuses
Cases move through a structured workflow:
1. **Open**: Newly created, awaiting assignment
2. **In Progress**: Actively being worked on
3. **Waiting**: Pending client response or external dependency
4. **Resolved**: Solution implemented, awaiting client confirmation
5. **Closed**: Case completed and signed off

### Case Types & Billing Rates
Different case types may have different billing considerations:
- **HR Cases**: Employee relations, policy questions
- **Payroll Cases**: Pay issues, tax questions, processing errors
- **Benefits Cases**: Insurance, retirement, wellness programs
- **Compliance Cases**: Regulatory requirements, audits
- **Safety Cases**: Incident reporting, OSHA compliance
- **General Support**: Miscellaneous client requests

---

## ⏱️ Phase 2: Time Tracking & Billing

### Automatic Time Tracking
Pulse automatically tracks time and calculates labor costs based on user roles:
- **Super Admin**: $150/hour
- **Company Admin**: $125/hour
- **Admin**: $95/hour
- **Standard User**: $75/hour

### Adding Time Entries
1. Open any case from the cases table
2. Click **"Log Time"** in the case detail dialog
3. Enter:
   - **Duration**: Hours and minutes worked
   - **Description**: What work was performed
   - **Date**: When the work occurred
4. System automatically calculates labor cost

### Time Entry Best Practices
- Log time in real-time or daily for accuracy
- Be specific in descriptions for billing transparency
- Include travel time if applicable
- Note any client interactions or deliverables

---

## 🔍 Phase 3: SLA Management & Intelligence

### SLA Configuration
Service Level Agreements are automatically monitored:
- **Response SLA**: Time to first response (default: 4 hours)
- **Resolution SLA**: Time to case closure (varies by priority)
- **Escalation Rules**: Automatic assignment changes for overdue cases

### AI-Powered Intelligence Features
1. **Smart Case Assignment**: AI suggests best team member based on expertise
2. **Escalation Prediction**: Identifies cases likely to breach SLA
3. **Pattern Recognition**: Detects recurring issues for process improvement
4. **Workload Balancing**: Monitors team capacity and distribution

### Accessing Intelligence Dashboard
1. Go to **Analytics** tab
2. Click **"Intelligence Dashboard"**
3. Review:
   - SLA performance metrics
   - Case complexity analysis
   - Team workload distribution
   - Escalation predictions

---

## 👥 Phase 4: Client Experience Layer

### Client Portal Access
Clients can view their case progress through a dedicated portal:
- **Public Timeline**: Accessible via secure share links
- **Status Updates**: Real-time case progress
- **Communication Log**: Full interaction history
- **Feedback System**: Client satisfaction ratings

### Managing Client Visibility
1. Open case detail dialog
2. Go to **"Visibility"** tab
3. Configure:
   - **Client Visible**: Toggle case visibility to client
   - **Share Link**: Generate secure URL for client access
   - **Email Notifications**: Configure automatic updates
   - **Access Permissions**: Control what clients can see

### Client Communication Features
- **Automated Updates**: Clients receive email notifications on status changes
- **Timeline View**: Clients see chronological case progress
- **Feedback Collection**: Post-resolution satisfaction surveys
- **Document Sharing**: Secure file exchange

---

## 📊 Phase 5: Reporting & Strategic Value

### Company-Level Analytics
Access comprehensive insights through the **Reports** tab:

#### Case Analytics Dashboard
- **Active cases by category**: Visual breakdown of current workload
- **Average time to resolution**: Performance benchmarking
- **Case volume trends**: Historical patterns and forecasting
- **SLA compliance rate**: Service level performance
- **Escalation tracking**: Issues requiring management attention

#### Team Performance Metrics
- **Average response time**: First contact efficiency
- **Resolution time by team member**: Individual performance
- **Case load distribution**: Workload balancing insights
- **SLA compliance by team**: Service quality tracking
- **Client feedback scores**: Customer satisfaction metrics

### Cost-to-Serve Analysis
The system automatically calculates service delivery costs:

#### Cost Breakdown Views
1. **By Client**: Total service costs per company
2. **By Case Type**: Cost analysis by service category
3. **By Team Member**: Individual labor cost tracking
4. **By Time Period**: Monthly/quarterly cost trends

#### High-Touch Client Identification
Pulse flags clients with:
- High case volume relative to contract value
- Frequent escalations or SLA breaches
- Lower-than-average profit margins
- Excessive support requirements

### Strategic Client Reports
Generate executive-ready summaries:

#### Quarterly Business Review (QBR) Reports
1. Go to **Reports** tab
2. Click **"Generate Client Summary"**
3. Select client and date range
4. System generates PDF including:
   - Case volume by issue type
   - Resolution success rates
   - Service level performance
   - Cost analysis and ROI metrics
   - Improvement recommendations

#### Executive Dashboard Exports
- **PDF Reports**: Branded, printable summaries
- **Excel Exports**: Detailed data for further analysis
- **Web Links**: Shareable online dashboards
- **Email Summaries**: Automated periodic reports

---

## 🛠️ Administrative Features

### User Management
Super Admins can configure:
- **Role-based Access**: Control who sees what data
- **Team Assignments**: Organize users by function
- **Billing Rates**: Set custom hourly rates by role
- **Notification Preferences**: Configure alert settings

### System Configuration
- **Case Types**: Add custom categories as needed
- **SLA Settings**: Adjust response and resolution targets
- **Email Templates**: Customize client communications
- **Branding**: Add company logos and colors to reports

### Data Security & Compliance
- **Role-Level Security**: Strict access controls
- **Audit Logging**: Complete activity tracking
- **Data Encryption**: Secure client information
- **Backup Systems**: Automatic data protection

---

## 📈 Key Performance Indicators (KPIs)

### Operational Metrics
Monitor these essential KPIs through the Analytics dashboard:

#### Volume Metrics
- **Total Active Cases**: Current workload
- **New Cases per Week**: Incoming demand
- **Cases Closed per Week**: Resolution capacity
- **Backlog Trend**: Growing or shrinking workload

#### Quality Metrics
- **SLA Compliance Rate**: % of cases meeting targets
- **First Call Resolution**: % resolved without escalation
- **Client Satisfaction Score**: Average feedback rating
- **Escalation Rate**: % of cases requiring management

#### Financial Metrics
- **Total Billable Hours**: Revenue opportunity
- **Labor Cost per Case**: Service delivery efficiency
- **Profit Margin by Client**: Account profitability
- **Cost per Resolution**: Process efficiency

### Strategic Insights
Use Pulse data to drive business decisions:

#### Client Health Monitoring
- Identify at-risk accounts with high support needs
- Recognize expansion opportunities with stable clients
- Monitor service quality for renewal discussions

#### Operational Optimization
- Balance team workloads for maximum efficiency
- Identify training needs based on case patterns
- Optimize processes for common issue types

#### Financial Planning
- Forecast support costs based on client growth
- Calculate ROI for additional team members
- Price services based on actual delivery costs

---

## 🔧 Troubleshooting & Support

### Common Issues

#### Case Not Appearing
1. Check filter settings in the Cases tab
2. Verify you have proper access permissions
3. Ensure case status isn't archived

#### Time Tracking Issues
1. Confirm you're assigned to the case
2. Check that time entry date is valid
3. Verify your user role has time logging permissions

#### SLA Alerts Not Working
1. Check your notification preferences
2. Verify SLA settings are configured
3. Ensure email addresses are correct

#### Client Portal Problems
1. Verify case visibility is enabled
2. Check that share links haven't expired
3. Confirm client has proper access permissions

### Getting Help
- **In-App Tours**: Use the tour system for guided walkthroughs
- **Knowledge Base**: Search for specific topics
- **Support Tickets**: Create cases for technical issues
- **Training Videos**: Access video tutorials
- **Live Support**: Contact the EaseLearn team

---

## 🎯 Best Practices

### Case Management Excellence
1. **Be Descriptive**: Write clear case titles and descriptions
2. **Log Time Promptly**: Enter time daily for accuracy
3. **Update Status Regularly**: Keep cases current
4. **Communicate Progress**: Update clients on case developments
5. **Close Properly**: Ensure client satisfaction before closing

### Team Collaboration
1. **Use Assignments**: Clearly designate responsibility
2. **Document Everything**: Maintain detailed case histories
3. **Share Knowledge**: Update procedures based on learnings
4. **Monitor Workloads**: Balance assignments fairly
5. **Celebrate Success**: Recognize excellent service delivery

### Client Relations
1. **Set Expectations**: Communicate SLAs clearly
2. **Provide Updates**: Regular progress communications
3. **Collect Feedback**: Learn from client experiences
4. **Be Proactive**: Address issues before they escalate
5. **Document Outcomes**: Build institutional knowledge

---

## 🚀 Advanced Features

### Automation Capabilities
Pulse includes intelligent automation:
- **Smart Routing**: Cases auto-assigned based on expertise
- **Escalation Management**: Automatic manager notification
- **Client Updates**: Scheduled progress communications
- **Report Generation**: Automated executive summaries

### Integration Possibilities
Pulse connects with:
- **Email Systems**: Outlook, Gmail integration
- **Calendar Apps**: Meeting scheduling
- **Document Storage**: SharePoint, Google Drive
- **Billing Systems**: QuickBooks, Xero connectivity

### Customization Options
Adapt Pulse to your needs:
- **Custom Fields**: Add company-specific data points
- **Workflow Rules**: Create unique process flows
- **Report Templates**: Design branded deliverables
- **Dashboard Views**: Personalize analytics displays

---

## 📚 Additional Resources

### Documentation
- **API Documentation**: Developer integration guides
- **User Manuals**: Role-specific instructions
- **Video Tutorials**: Step-by-step walkthroughs
- **Best Practices**: Industry-standard approaches

### Training & Certification
- **Admin Certification**: Complete system mastery
- **User Training**: Basic functionality education
- **Process Workshops**: Workflow optimization sessions
- **Industry Training**: Sector-specific approaches

### Community & Support
- **User Forums**: Peer-to-peer assistance
- **Feature Requests**: Suggest improvements
- **Beta Programs**: Early access to new features
- **Success Stories**: Learn from other implementations

---

*This guide represents the complete Pulse Case Management System functionality. For questions or additional support, contact the EaseLearn team or use the in-app help system.*

**Last Updated**: January 2025  
**Version**: 5.0 - Complete Implementation  
**Next Review**: April 2025`;

    // Insert the comprehensive Pulse guide
    const { data: article, error } = await supabase
      .from('knowledge_base_articles')
      .insert([{
        title: 'Pulse Case Management System - Complete Admin Guide',
        content: pulseGuideContent,
        excerpt: 'Comprehensive guide covering all phases of Pulse Case Management System - from basic case creation to strategic reporting and client experience management.',
        slug: 'pulse-comprehensive-guide',
        category_id: category.id,
        tags: ['pulse', 'case management', 'admin guide', 'analytics', 'reporting', 'sla', 'time tracking', 'client portal'],
        featured: true,
        status: 'published',
        target_roles: ['super_admin', 'company_admin'],
        author_id: user.data.user.id,
        published_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, action: 'created', data: article };

  } catch (error) {
    console.error('Error creating Pulse guide:', error);
    return { success: false, error: error.message };
  }
}