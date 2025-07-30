# HALOworks Payroll Operations - Internal Training Guide

## 🎯 **Quick Start for Payroll Staff**

### Daily Operations Checklist
1. **Check PayRunMonitor** (`/admin/haloworks-control` → Pay Runs tab)
   - Review active payroll runs
   - Monitor for stuck/failed processes
   - Escalate critical issues

2. **Process Pending Payrolls** (`/payroll/super-admin-processing`)
   - Review payrolls needing approval
   - Validate time entries
   - Resolve calculation errors

3. **Monitor ACH Status** (`/payroll/ach-processing`)
   - Check batch generation status
   - Verify NACHA file integrity
   - Confirm funding schedules

---

## 📊 **Core Dashboard Navigation**

### **Super Admin Payroll Processing** (`/payroll/super-admin-processing`)
- **Purpose:** Central hub for all client payroll oversight
- **Key Features:**
  - Bulk approval workflow
  - Error resolution center
  - Real-time processing status
  - Issue escalation system

### **Super Admin Benefits Dashboard** (`/payroll/super-admin-benefits`)
- **Purpose:** Benefits administration across all clients
- **Key Features:**
  - Plan configuration oversight
  - Enrollment tracking
  - Compliance monitoring
  - Deduction management

### **HALOworksControl Console** (`/admin/haloworks-control`)
- **Purpose:** Operational command center
- **Key Features:**
  - Client directory
  - Pay run monitoring
  - Alert management
  - Funding oversight

---

## ⚡ **Common Workflows**

### **Process Client Payroll**
1. Navigate to `/payroll/super-admin-processing`
2. Filter by client or status
3. Review employee time entries
4. Validate calculations
5. Approve or flag for review
6. Generate pay stubs
7. Create ACH batch
8. Export NACHA file

### **Handle Payroll Errors**
1. Check error details in processing dashboard
2. Common issues:
   - **Missing time entries:** Contact client HR
   - **Negative net pay:** Review deductions
   - **Invalid bank info:** Update employee records
   - **Tax calculation errors:** Check withholding tables
3. Resolve issue and reprocess
4. Document resolution in notes

### **ACH File Generation**
1. Go to `/payroll/ach-processing`
2. Select approved payroll batch
3. Verify bank routing information
4. Generate NACHA file
5. Download and submit to bank
6. Update batch status

---

## 🔧 **Edge Functions Reference**

### **Core Processing Functions**
- `calculate-payroll-for-period` - Main payroll calculation engine
- `generate-pay-stubs-production` - Pay stub generation with HTML/PDF
- `generate-nacha-file` - ACH file creation (NACHA compliant)
- `calculate-tax-withholdings` - Tax calculation service
- `generate-payroll-report` - Custom report generation
- `export-payroll-report` - Report export functionality

### **Function Monitoring**
- Check edge function logs at: Supabase Dashboard → Functions → [Function Name] → Logs
- Common error patterns:
  - Timeout errors (increase processing time)
  - Missing employee data (validate records)
  - Tax calculation failures (check rates)

---

## 🚨 **Error Resolution Guide**

### **Critical Issues (Immediate Action)**
- **Pay stubs not generating:** Check employee records completeness
- **ACH file errors:** Validate bank account information
- **Tax calculation failures:** Verify current tax tables
- **System timeouts:** Check database performance

### **Warning Issues (Same Day Resolution)**
- **Missing time entries:** Follow up with client
- **Overtime calculation errors:** Review company policies
- **Benefit deduction mismatches:** Check plan configurations

### **Info Issues (Next Business Day)**
- **Report generation delays:** Schedule during off-peak
- **UI performance issues:** Clear browser cache
- **Minor data inconsistencies:** Update during maintenance

---

## 📞 **Escalation Procedures**

### **Level 1: Payroll Specialist**
- Time entry issues
- Basic calculation questions
- Client communication

### **Level 2: Payroll Manager**
- Complex tax issues
- System errors
- Client escalations

### **Level 3: System Administrator**
- Database issues
- Edge function failures
- Security concerns

### **Level 4: Development Team**
- Code bugs
- New feature requests
- System architecture issues

---

## 📈 **Performance Metrics**

### **Daily KPIs**
- Payrolls processed on time: >98%
- Error resolution time: <2 hours
- Client satisfaction: >95%
- System uptime: >99.9%

### **Weekly Reports**
- Total payrolls processed
- Average processing time
- Error rate by category
- Client feedback summary

---

## 🛡️ **Security & Compliance**

### **Data Handling**
- Never email payroll data unencrypted
- Use secure file transfer for large exports
- Log all data access in audit trails
- Follow GDPR/CCPA guidelines

### **Access Controls**
- Super Admin: Full system access
- Payroll Manager: Client-specific access
- Payroll Specialist: Limited processing access
- Client HR: Own company data only

---

## 🔄 **System Maintenance**

### **Daily Tasks**
- Monitor system performance
- Check error logs
- Validate data backups
- Review security alerts

### **Weekly Tasks**
- Update tax tables
- Review client configurations
- Analyze performance metrics
- Plan system updates

### **Monthly Tasks**
- Conduct security audit
- Review access permissions
- Update training materials
- Client satisfaction survey

---

## 📞 **Support Contacts**

- **System Issues:** Internal IT Helpdesk
- **Payroll Questions:** Payroll Manager
- **Client Issues:** Account Management
- **Emergency:** On-call System Administrator

*Last Updated: July 19, 2025*
*Version: 1.0*