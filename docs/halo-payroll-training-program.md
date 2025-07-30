# HaaLO Payroll System - Internal Staff Training Program

*Comprehensive role-based training for internal payroll operations*

---

## 🎯 **Training Program Overview**

### **System Architecture**
- **Frontend:** React-based dashboard with role-based access
- **Backend:** Supabase with PostgreSQL database
- **Processing:** 6 core edge functions for payroll automation
- **Security:** Multi-level RLS policies and audit logging
- **Integration:** ACH/NACHA compliant banking integration

### **Core Modules Covered**
- 33 integrated payroll modules
- End-to-end payroll processing workflow
- Benefits administration
- Tax compliance and reporting
- ACH batch processing
- Real-time monitoring and alerts

---

## 👥 **ROLE 1: SUPER ADMIN**
*Full system access and oversight*

### **🔑 Access Level**
- All payroll processing functions
- Cross-client data access
- System configuration
- User management
- Audit log review

### **📍 Primary Routes**
- `/payroll/super-admin-processing` - Central processing hub
- `/payroll/super-admin-benefits` - Benefits oversight
- `/admin/haloworks-control` - System command center
- `/payroll/ach-processing` - ACH batch management
- `/payroll/reports` - Cross-client reporting

### **⚡ Core Responsibilities**

#### **Daily Operations**
1. **Morning System Check** (8:00 AM)
   - Navigate to `/admin/haloworks-control`
   - Review overnight processing status
   - Check alert dashboard for critical issues
   - Validate all scheduled payroll runs completed

2. **Payroll Approval Workflow** (9:00 AM - 5:00 PM)
   - Access `/payroll/super-admin-processing`
   - Review pending payrolls across all clients
   - Approve completed calculations
   - Flag issues for specialist review
   - Monitor real-time processing queue

3. **ACH Batch Management** (2:00 PM Daily)
   - Go to `/payroll/ach-processing`
   - Generate NACHA files for approved payrolls
   - Verify funding schedules
   - Submit ACH batches to banking partners
   - Update batch status tracking

#### **Weekly Tasks**
- **Monday:** Review previous week's metrics and KPIs
- **Wednesday:** Client configuration audit
- **Friday:** System performance analysis and planning

#### **Emergency Procedures**
- **System Outage:** Immediate escalation to Level 4 (Development)
- **Data Breach:** Security protocol activation within 15 minutes
- **Client Escalation:** Direct communication with account management
- **Processing Failure:** Edge function log analysis and remediation

---

## 👨‍💼 **ROLE 2: PAYROLL MANAGER**
*Client-specific payroll oversight and management*

### **🔑 Access Level**
- Assigned client payroll data
- Benefits configuration for managed clients
- Employee record management
- Payroll processing approval
- Client-specific reporting

### **📍 Primary Routes**
- `/payroll/dashboard` - Client-specific dashboard
- `/payroll/processing` - Payroll workflow management
- `/payroll/benefits` - Benefits administration
- `/payroll/reports` - Client reporting tools

### **⚡ Core Responsibilities**

#### **Client Onboarding**
1. **Initial Setup** (Day 1-3)
   - Create company profile in system
   - Configure pay periods and schedules
   - Set up employee records and bank information
   - Configure benefits plans and deductions
   - Test payroll calculation with sample data

2. **Benefits Configuration**
   - Navigate to `/payroll/benefits`
   - Set up health, dental, vision plans
   - Configure 401k and retirement deductions
   - Establish benefit enrollment periods
   - Test deduction calculations

#### **Ongoing Operations**
1. **Weekly Payroll Cycle**
   - **Monday:** Review time entries from client
   - **Tuesday:** Validate calculations and benefits
   - **Wednesday:** Generate pay stubs and ACH files
   - **Thursday:** Submit for Super Admin approval
   - **Friday:** Confirm successful processing

2. **Monthly Reporting**
   - Access `/payroll/reports`
   - Generate client-specific payroll summaries
   - Export tax filing reports
   - Prepare benefits utilization analysis
   - Schedule client review meetings

#### **Client Communication**
- **Issue Resolution:** Direct point of contact for payroll questions
- **Training:** Conduct client training on time entry systems
- **Updates:** Communicate system changes and new features
- **Compliance:** Ensure client adherence to payroll policies

---

## 👩‍💻 **ROLE 3: PAYROLL SPECIALIST**
*Day-to-day processing and issue resolution*

### **🔑 Access Level**
- Assigned client portfolios
- Time entry validation
- Basic payroll calculations
- Pay stub generation
- First-level issue resolution

### **📍 Primary Routes**
- `/payroll/processing` - Processing workflow
- `/payroll/pay-types` - Pay type management
- `/payroll/dashboard` - Client overview

### **⚡ Core Responsibilities**

#### **Daily Processing Tasks**
1. **Time Entry Validation** (9:00 AM)
   - Review submitted time entries for accuracy
   - Flag missing or incomplete submissions
   - Validate overtime calculations
   - Confirm PTO and sick leave balances

2. **Payroll Calculations** (10:00 AM - 12:00 PM)
   - Process regular pay calculations
   - Apply benefits deductions
   - Calculate tax withholdings
   - Generate preliminary pay stubs

3. **Quality Assurance** (2:00 PM - 4:00 PM)
   - Review calculations for accuracy
   - Verify bank account information
   - Confirm employee status changes
   - Document any discrepancies

#### **Issue Resolution Protocol**
1. **Level 1 Issues** (Handle Directly)
   - Missing time entries → Contact employee/manager
   - Basic calculation errors → Recalculate with correct data
   - Pay stub corrections → Regenerate with fixes

2. **Escalation Required** (Notify Payroll Manager)
   - Complex tax issues
   - Benefits calculation errors
   - System processing errors
   - Client policy questions

#### **Communication Responsibilities**
- **Employees:** Basic payroll questions and pay stub issues
- **Managers:** Time entry problems and approval workflows
- **HR Departments:** Policy clarifications and process updates

---

## 🏢 **ROLE 4: COMPANY ADMIN (CLIENT)**
*Self-service payroll management for individual companies*

### **🔑 Access Level**
- Own company data only
- Employee management
- Time entry oversight
- Basic reporting
- Benefits enrollment

### **📍 Primary Routes**
- `/payroll/dashboard` - Company dashboard
- `/payroll/f45-dashboard` - F45-specific dashboard (if applicable)
- `/payroll/processing` - Company payroll workflow

### **⚡ Core Responsibilities**

#### **Employee Management**
1. **New Hire Setup**
   - Add employee to system
   - Collect tax forms (W-4, state forms)
   - Set up direct deposit information
   - Enroll in benefits plans
   - Configure pay schedule and rates

2. **Ongoing Maintenance**
   - Update employee information
   - Process status changes (promotions, terminations)
   - Manage benefit enrollments
   - Review and approve time entries

#### **Payroll Processing**
1. **Pre-Payroll** (Each Pay Period)
   - Review all time entries for accuracy
   - Approve overtime and PTO requests
   - Submit payroll for processing
   - Communicate any special circumstances

2. **Post-Payroll**
   - Review generated pay stubs
   - Address employee questions
   - Confirm ACH processing
   - File payroll reports

---

## 👤 **ROLE 5: EMPLOYEE (END USER)**
*Self-service access to payroll information*

### **🔑 Access Level**
- Personal payroll data only
- Pay stub downloads
- Time entry (if applicable)
- Benefits information
- Tax document access

### **📍 Primary Routes**
- `/payroll/dashboard` - Personal dashboard
- Time entry portal (if enabled)

### **⚡ Training Topics**

#### **Basic Navigation**
1. **Accessing Pay Information**
   - Log in to personal dashboard
   - View current and historical pay stubs
   - Download pay stubs for records
   - Review year-to-date earnings

2. **Benefits Information**
   - View current benefit elections
   - Access benefit summaries
   - Download benefits documentation
   - Understand deduction impacts

#### **Self-Service Functions**
- **Direct Deposit Changes:** How to update banking information
- **Tax Forms:** Accessing W-2s and other tax documents
- **Time Entry:** Using time tracking systems (if applicable)
- **Support Requests:** How to contact payroll for assistance

---

## 🛠️ **TECHNICAL TRAINING MODULES**

### **Module A: Edge Functions Monitoring**
*For Super Admins and System Administrators*

#### **Core Functions Overview**
1. **calculate-payroll-for-period**
   - Purpose: Main payroll calculation engine
   - Monitoring: Check execution logs for timeouts or errors
   - Troubleshooting: Validate employee data completeness

2. **generate-pay-stubs-production**
   - Purpose: PDF pay stub generation
   - Monitoring: Verify file generation and storage
   - Troubleshooting: Check template formatting issues

3. **generate-nacha-file**
   - Purpose: ACH file creation for banking
   - Monitoring: Validate NACHA compliance
   - Troubleshooting: Verify routing number accuracy

4. **calculate-tax-withholdings**
   - Purpose: Federal and state tax calculations
   - Monitoring: Check tax table currency
   - Troubleshooting: Validate withholding parameters

5. **generate-payroll-report**
   - Purpose: Custom report generation
   - Monitoring: Performance and output quality
   - Troubleshooting: Data source validation

6. **export-payroll-report**
   - Purpose: Report export functionality
   - Monitoring: File format and delivery
   - Troubleshooting: Export permission issues

#### **Log Analysis Training**
- **Access:** Supabase Dashboard → Functions → [Function Name] → Logs
- **Common Patterns:** Timeout errors, data validation failures, API limits
- **Resolution Steps:** Parameter adjustment, data cleanup, retry mechanisms

### **Module B: Database and Security**
*For Super Admins and Payroll Managers*

#### **Data Access Patterns**
- **Row-Level Security (RLS):** Understanding policy enforcement
- **Audit Logging:** Tracking all data access and modifications
- **Encryption:** Data protection in transit and at rest
- **Compliance:** GDPR, CCPA, and payroll-specific regulations

#### **User Management**
- **Role Assignment:** Granting appropriate access levels
- **Permission Reviews:** Regular access audits
- **Session Management:** Monitoring active user sessions
- **Multi-Factor Authentication:** Security best practices

---

## 📋 **STANDARD OPERATING PROCEDURES**

### **SOP 1: New Client Onboarding**
*For Payroll Managers*

1. **Pre-Onboarding Checklist**
   - [ ] Client contract signed and processed
   - [ ] Company information packet received
   - [ ] Employee roster with complete data
   - [ ] Banking information verified
   - [ ] Benefits plan selections confirmed

2. **System Setup Process**
   - [ ] Create company profile in HaaLO system
   - [ ] Configure pay periods and schedules
   - [ ] Import employee data with validation
   - [ ] Set up banking and ACH information
   - [ ] Configure benefits plans and deductions
   - [ ] Run test payroll with sample data
   - [ ] Train client administrators on system

3. **Go-Live Checklist**
   - [ ] All employees added and verified
   - [ ] First payroll successfully processed
   - [ ] Pay stubs generated and distributed
   - [ ] ACH files submitted and confirmed
   - [ ] Client training completed
   - [ ] Support contact information provided

### **SOP 2: Incident Response**
*For All Roles*

#### **Severity Levels**

**🔴 CRITICAL (Immediate Response)**
- System-wide outages
- Data security breaches
- Payment processing failures
- Critical client escalations

**Response Time:** 15 minutes
**Escalation:** Immediate notification to Super Admin and Development team

**🟡 HIGH (Same Day Response)**
- Individual client processing issues
- Benefits calculation errors
- Report generation failures
- ACH batch processing problems

**Response Time:** 2 hours
**Escalation:** Notify Payroll Manager within 30 minutes

**🟢 MEDIUM (Next Business Day)**
- UI/UX issues
- Minor data discrepancies
- Performance optimization
- Feature enhancement requests

**Response Time:** 24 hours
**Escalation:** Standard ticketing system

### **SOP 3: Quality Assurance**
*For Payroll Specialists and Managers*

#### **Pre-Processing Validation**
1. **Employee Data Verification**
   - [ ] All active employees present
   - [ ] Current pay rates applied
   - [ ] Benefits elections accurate
   - [ ] Tax withholding current
   - [ ] Banking information verified

2. **Time Entry Validation**
   - [ ] All time entries submitted
   - [ ] Overtime calculations accurate
   - [ ] PTO balances updated
   - [ ] Manager approvals obtained
   - [ ] Special pay adjustments documented

3. **Calculation Review**
   - [ ] Gross pay calculations verified
   - [ ] Benefits deductions accurate
   - [ ] Tax withholdings compliant
   - [ ] Net pay positive (flag negatives)
   - [ ] Year-to-date totals reconciled

#### **Post-Processing Verification**
1. **Pay Stub Quality Check**
   - [ ] All required information present
   - [ ] Formatting consistent and professional
   - [ ] Calculations accurate
   - [ ] Company branding applied
   - [ ] Compliance statements included

2. **ACH File Validation**
   - [ ] NACHA formatting compliance
   - [ ] Total amounts reconciled
   - [ ] Banking routing verified
   - [ ] Employee accounts validated
   - [ ] File integrity confirmed

---

## 📊 **PERFORMANCE METRICS & KPIs**

### **System-Level Metrics**
- **Uptime:** >99.9% system availability
- **Processing Speed:** <30 seconds per employee calculation
- **Error Rate:** <0.1% calculation errors
- **Security:** Zero data breaches or unauthorized access

### **Operational Metrics**
- **On-Time Processing:** >98% payrolls processed by deadline
- **Client Satisfaction:** >95% satisfaction rating
- **Error Resolution:** <2 hours average resolution time
- **Compliance:** 100% tax filing accuracy

### **Individual Performance Metrics**

#### **Super Admin KPIs**
- System uptime monitoring
- Cross-client processing efficiency
- Emergency response time
- Strategic planning execution

#### **Payroll Manager KPIs**
- Client retention rate
- Processing accuracy
- Issue resolution time
- Client training effectiveness

#### **Payroll Specialist KPIs**
- Processing volume handled
- Quality assurance metrics
- Issue resolution rate
- Client communication effectiveness

---

## 🆘 **EMERGENCY CONTACTS & ESCALATION**

### **24/7 Emergency Hotline**
- **Phone:** [Internal Emergency Number]
- **Email:** emergency@haloworks.com
- **Slack:** #payroll-emergency

### **Escalation Matrix**

**Level 1: Payroll Specialist**
- Basic processing issues
- Employee questions
- Time entry problems
- Contact: Direct supervisor

**Level 2: Payroll Manager**
- Complex calculations
- Client escalations
- Benefits issues
- Contact: Senior Payroll Manager

**Level 3: Super Admin**
- System-wide issues
- Security concerns
- Cross-client problems
- Contact: Operations Director

**Level 4: Development Team**
- Code defects
- Infrastructure issues
- Database problems
- Contact: CTO/Development Lead

### **Client Emergency Protocol**
1. **Immediate Response** (Within 15 minutes)
   - Acknowledge receipt of emergency
   - Assign appropriate specialist
   - Communicate initial timeline

2. **Investigation** (Within 1 hour)
   - Analyze issue scope and impact
   - Identify root cause
   - Develop resolution plan

3. **Resolution** (Within 4 hours for critical issues)
   - Implement fix or workaround
   - Test solution thoroughly
   - Communicate resolution to client

4. **Follow-up** (Within 24 hours)
   - Confirm issue fully resolved
   - Document lessons learned
   - Update procedures if needed

---

## 📚 **CONTINUOUS LEARNING & CERTIFICATION**

### **Mandatory Training Schedule**
- **Monthly:** System updates and new features
- **Quarterly:** Compliance and security updates
- **Annually:** Full system recertification

### **Certification Tracks**

#### **Payroll Processing Certification**
- Basic system navigation
- Calculation methodology
- Quality assurance procedures
- Client communication

#### **Benefits Administration Certification**
- Plan configuration
- Enrollment processes
- Compliance requirements
- Integration with payroll

#### **System Administration Certification**
- User management
- Security protocols
- Performance monitoring
- Emergency procedures

### **Professional Development**
- External payroll conferences
- Industry certification programs
- Advanced technical training
- Leadership development

---

*Last Updated: July 19, 2025*
*Version: 2.0*
*Training Program Lead: Sarah Mitchell*