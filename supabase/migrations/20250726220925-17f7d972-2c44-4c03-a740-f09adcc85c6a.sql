-- Insert Employee Time Track Guide
INSERT INTO public.knowledge_base_articles (
    title,
    content,
    excerpt,
    author_id,
    status,
    slug,
    tags,
    target_roles
) VALUES (
    'Employee Time Track Guide',
    '# Employee Time Track Guide

## Version 1.0

## Table of Contents
1. [Getting Started](#getting-started)
2. [Punching In and Out](#punching-in-and-out)  
3. [Photo Requirements](#photo-requirements)
4. [Viewing Your Timecard](#viewing-your-timecard)
5. [Requesting Time Off](#requesting-time-off)
6. [Troubleshooting](#troubleshooting)
7. [Support](#support)

## Getting Started {#getting-started}

Welcome to HaaLO Time Track! This guide will help you understand how to use the time tracking system as an employee.

### What You Need
- Access to the HaaLO IQ app
- Your employee credentials
- A smartphone with camera (for photo punches, if required)

### First Time Login
1. Open the HaaLO IQ app
2. Enter your employee credentials
3. Complete any required setup steps
4. Familiarize yourself with the Time Track interface

## Punching In and Out {#punching-in-and-out}

### Basic Punch Process
1. **Navigate to Time Track**: Open the Time Track module from the main menu
2. **Select Punch Type**: Choose "Punch In" or "Punch Out"
3. **Take Photo** (if required): Follow photo requirements below
4. **Confirm Location**: Verify you''re at the correct work location
5. **Submit**: Tap to complete your punch

### Punch Types
- **Punch In**: Start your work shift
- **Punch Out**: End your work shift  
- **Break In**: Start a break period
- **Break Out**: End a break period
- **Lunch In**: Start lunch break
- **Lunch Out**: End lunch break

### Important Rules
- Always punch in when you arrive at work
- Punch out for breaks longer than 15 minutes
- Punch out when leaving for the day
- Never punch for another employee
- Report any punch errors immediately

## Photo Requirements {#photo-requirements}

### When Photos Are Required
Your company may require photos for:
- All punches
- Specific punch types only
- Random verification checks

### Photo Guidelines
- **Clear Face Visibility**: Ensure your face is clearly visible
- **Good Lighting**: Take photos in well-lit areas
- **Remove Obstructions**: Remove sunglasses, hats, or masks if possible
- **Face Forward**: Look directly at the camera
- **Single Person**: Only you should be in the photo

### Photo Tips
- Hold phone at eye level
- Ensure camera lens is clean
- Retake if photo is blurry or unclear
- If camera fails, use the upload option

### Privacy Notice
Photos are used solely for time tracking verification and are stored securely according to company privacy policies.

## Viewing Your Timecard {#viewing-your-timecard}

### Accessing Timecards
1. Go to Time Track module
2. Select "My Timecard" or "View Hours"
3. Choose the time period you want to review

### Timecard Information
Your timecard shows:
- **Daily Hours**: Regular, overtime, and break time
- **Weekly Totals**: Total hours worked
- **Punch History**: All punch in/out times
- **Pay Period Summary**: Hours for current pay period

### Reviewing Hours
- Check daily totals for accuracy
- Verify all punches are recorded
- Look for any missing or duplicate punches
- Report discrepancies immediately

## Requesting Time Off {#requesting-time-off}

### Types of Time Off
- **Vacation**: Paid time off for personal use
- **Sick Leave**: Time off due to illness
- **Personal Time**: Unpaid personal leave
- **Holidays**: Company-designated holidays

### Request Process
1. **Plan Ahead**: Submit requests as early as possible
2. **Use Proper Channels**: Follow your company''s request process
3. **Check Approval**: Ensure requests are approved before taking time off
4. **Update Schedule**: Coordinate with your supervisor

### Emergency Time Off
For unexpected absences:
1. Contact your supervisor immediately
2. Follow company call-in procedures
3. Submit formal request as soon as possible
4. Provide documentation if required

## Troubleshooting {#troubleshooting}

### Common Issues and Solutions

#### Cannot Punch In/Out
- **Check Location**: Ensure you''re within the allowed work area
- **Check Time**: Verify you''re within allowed punch times
- **Restart App**: Close and reopen the application
- **Check Internet**: Ensure you have internet connectivity

#### Photo Problems
- **Camera Won''t Open**: Check app permissions for camera access
- **Photo Rejected**: Ensure good lighting and clear face visibility
- **Upload Alternative**: Use the "Upload Photo" option if camera fails

#### Missing Punches
- **Check Punch History**: Verify if punch was actually recorded
- **Manual Entry**: Contact supervisor for manual time entry
- **System Delays**: Allow a few minutes for punches to appear

#### App Issues
- **Update App**: Ensure you have the latest version
- **Clear Cache**: Clear app data if experiencing glitches
- **Reinstall**: Uninstall and reinstall if problems persist

### When to Contact Support
Contact your supervisor or IT support for:
- Repeated punch failures
- Incorrect time calculations
- System access issues
- Technical problems that persist

## Support {#support}

### Getting Help
1. **Supervisor**: Your direct supervisor for policy questions
2. **HR Department**: For time-off and payroll questions  
3. **IT Support**: For technical issues with the app
4. **Company Helpdesk**: For general system support

### Best Practices
- **Punch Consistently**: Maintain regular punch habits
- **Review Weekly**: Check your timecard weekly
- **Report Issues**: Don''t wait to report problems
- **Follow Policies**: Adhere to all company time tracking policies
- **Ask Questions**: Don''t hesitate to ask for clarification

### Important Reminders
- Time tracking is required for all hourly employees
- Accurate time reporting is essential for proper payroll
- Fraudulent time reporting may result in disciplinary action
- When in doubt, ask your supervisor

---

**Last Updated**: [Auto-generated timestamp]

For additional support, contact your supervisor or HR department.',
    'A comprehensive guide for employees on how to use the HaaLO Time Track system, including punching in/out, photo requirements, timecard viewing, and troubleshooting.',
    '00000000-0000-0000-0000-000000000000',
    'published',
    'employee-time-track-guide',
    ARRAY['Time Track', 'Employee', 'Guide', 'Training', 'Punching', 'Timecard'],
    ARRAY['employee']::text[]
);

-- Insert Client Admin Quick Guide  
INSERT INTO public.knowledge_base_articles (
    title,
    content,
    excerpt,
    author_id,
    status,
    slug,
    tags,
    target_roles
) VALUES (
    'Client Admin Quick Guide',
    '# Client Admin Quick Guide

## Version 1.0

## Table of Contents
1. [Overview](#overview)
2. [Employee Management](#employee-management)
3. [Timecard Management](#timecard-management)
4. [Basic Reporting](#basic-reporting)
5. [Photo Settings](#photo-settings)
6. [Approval Workflows](#approval-workflows)
7. [Quick Troubleshooting](#quick-troubleshooting)

## Overview {#overview}

As a Client Admin, you have permissions to manage employees and their time tracking within your organization. This guide covers the essential functions you''ll use most frequently.

### Your Permissions
- Add and manage employees
- View and edit timecards
- Approve time-off requests  
- Generate basic reports
- Configure photo settings (limited)
- Manage approval workflows

### Getting Started
1. **Dashboard Access**: Navigate to the Admin Dashboard
2. **Employee Overview**: Review your employee list
3. **Recent Activity**: Check recent punches and requests
4. **Pending Items**: Address any pending approvals

## Employee Management {#employee-management}

### Adding New Employees
1. **Navigate**: Go to "Employees" > "Add Employee"
2. **Basic Info**: Enter name, email, and contact details
3. **Work Details**: Set department, role, and supervisor
4. **Time Tracking**: Enable time tracking and set rules
5. **Send Invite**: Email registration link to employee

### Managing Existing Employees
- **Edit Details**: Update employee information as needed
- **Change Status**: Activate, deactivate, or terminate employees
- **Reset Access**: Reset passwords or app access if needed
- **Update Roles**: Modify job roles and permissions

### Employee Setup Checklist
- ✅ Personal information complete
- ✅ Work location assigned
- ✅ Department and role set
- ✅ Time tracking enabled
- ✅ Photo requirements configured
- ✅ Registration email sent
- ✅ First login completed

## Timecard Management {#timecard-management}

### Viewing Timecards
1. **Navigate**: Go to "Time Tracking" > "Timecards"
2. **Filter**: Select employee, date range, or status
3. **Review**: Check hours, punches, and totals
4. **Export**: Download for payroll or records

### Editing Timecards
- **Manual Entry**: Add missing punches
- **Time Corrections**: Adjust incorrect punch times
- **Break Additions**: Add or modify break periods
- **Notes**: Document any changes made

### Common Timecard Tasks
- **Missing Punches**: Add forgotten punch-in/out times
- **Overtime Review**: Verify overtime calculations
- **Break Compliance**: Ensure proper break documentation
- **Exception Handling**: Address punch errors or failures

### Timecard Approval
1. **Review Period**: Check all employee timecards
2. **Verify Accuracy**: Confirm hours and punch times
3. **Address Issues**: Resolve any discrepancies
4. **Approve**: Submit for payroll processing

## Basic Reporting {#basic-reporting}

### Available Reports
- **Hours Summary**: Total hours by employee/period
- **Punch Detail**: Detailed punch history
- **Attendance**: Employee attendance patterns
- **Overtime**: Overtime hours and trends
- **Exception**: Punch errors and missing data

### Generating Reports
1. **Select Report Type**: Choose from available reports
2. **Set Parameters**: Date range, employees, filters
3. **Generate**: Run the report
4. **Export**: Download as PDF or Excel
5. **Schedule**: Set up recurring reports if needed

### Report Best Practices
- **Regular Review**: Generate weekly/monthly reports
- **Data Accuracy**: Verify data before using for payroll
- **Trend Analysis**: Look for attendance patterns
- **Documentation**: Keep reports for compliance

## Photo Settings {#photo-settings}

### Basic Photo Configuration
- **Enable/Disable**: Turn photo requirements on/off
- **Punch Types**: Select which punches require photos
- **Quality Settings**: Adjust photo quality requirements
- **Verification**: Enable/disable photo verification

### Photo Management
- **Review Photos**: Check employee punch photos
- **Flag Issues**: Mark photos that don''t meet standards
- **Photo Storage**: Understand retention policies
- **Privacy Compliance**: Ensure proper photo handling

### Troubleshooting Photos
- **Poor Quality**: Adjust quality thresholds
- **Camera Issues**: Help employees with app permissions
- **Upload Problems**: Provide alternative upload methods
- **Verification Failures**: Review and adjust settings

## Approval Workflows {#approval-workflows}

### Time-Off Requests
1. **Review Requests**: Check employee time-off submissions
2. **Verify Availability**: Ensure adequate coverage
3. **Check Policies**: Confirm compliance with company rules
4. **Approve/Deny**: Make decision and add notes
5. **Notify Employee**: System sends automatic notifications

### Timecard Approvals
- **Weekly Review**: Approve weekly timecards
- **Exception Handling**: Address punch errors
- **Overtime Authorization**: Approve overtime hours
- **Final Submission**: Submit to payroll

### Approval Best Practices
- **Timely Review**: Process requests promptly
- **Clear Communication**: Provide reasons for denials
- **Documentation**: Keep notes on approval decisions
- **Consistency**: Apply policies fairly across employees

## Quick Troubleshooting {#quick-troubleshooting}

### Common Employee Issues
**"I can''t punch in"**
- Check if employee is at correct location
- Verify time tracking is enabled for employee
- Confirm punch times are within allowed hours

**"My photo was rejected"**
- Review photo quality settings
- Help employee with proper photo techniques
- Check camera permissions on device

**"I forgot to punch out"**
- Add manual punch-out time to timecard
- Document the correction with notes
- Review with employee to prevent future issues

### System Issues
**Reports not generating**
- Check date ranges and filters
- Verify you have access to selected employees
- Try smaller date ranges for large reports

**Employee can''t access app**
- Verify employee status is active
- Check registration completion
- Reset access if needed

### When to Escalate
Contact your system administrator for:
- Technical issues you can''t resolve
- Policy questions beyond your authority
- System errors or bugs
- Advanced configuration needs

## Quick Reference

### Daily Tasks
- [ ] Review overnight punches
- [ ] Address any punch exceptions
- [ ] Respond to employee questions
- [ ] Check pending approvals

### Weekly Tasks
- [ ] Review all timecards
- [ ] Process time-off requests
- [ ] Generate attendance reports
- [ ] Address any compliance issues

### Monthly Tasks
- [ ] Review employee list for updates
- [ ] Analyze attendance trends
- [ ] Update photo settings if needed
- [ ] Review approval workflows

---

**Last Updated**: [Auto-generated timestamp]

For advanced features or system issues, contact your full system administrator.',
    'A quick reference guide for Client Admins covering employee management, timecard management, reporting, and troubleshooting.',
    '00000000-0000-0000-0000-000000000000',
    'published',
    'client-admin-quick-guide',
    ARRAY['Time Track', 'Client Admin', 'Guide', 'Management', 'Quick Reference'],
    ARRAY['client_admin']::text[]
);