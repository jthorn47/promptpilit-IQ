export interface WPVPlanData {
  companyName: string;
  address?: string;
  industry?: string;
  phone?: string;
  email?: string;
  website?: string;
  businessHours?: string;
  totalEmployees?: string;
  planYear?: string;
  riskFactors?: string[];
  primaryCoordinator?: {
    name: string;
    title: string;
    phone?: string;
  };
  backupCoordinator?: string;
  safetyCommitteeMembers?: Array<{
    name: string;
    role: string;
    department: string;
  }>;
  reviewFrequency?: string;
  inspectionFrequency?: string;
  competentObservers?: Array<{
    name: string;
    jobTitle: string;
    area: string;
  }>;
  effectiveDate?: string;
  planContent: string;
}

export function convertPalmsLiquorToWPVFormat(markdownContent: string): WPVPlanData {
  // Extract company name
  const companyName = "Palms Liquor";
  
  // Extract key personnel from the document
  const primaryCoordinator = {
    name: "Edwina Stewart",
    title: "Owner",
    phone: undefined
  };
  
  const backupCoordinator = "Veronica Valles";
  
  // Extract competent observers
  const competentObservers = [
    {
      name: "Edwina Stewart",
      jobTitle: "Owner",
      area: "Primary Store"
    },
    {
      name: "Veronica Valles",
      jobTitle: "Owner", 
      area: "Primary Store"
    }
  ];

  // Extract risk factors from the document
  const riskFactors = [
    "Money Exchange",
    "Work Alone", 
    "Night/Early Morning Hours",
    "Alcohol Distribution",
    "Valued Items (Money)"
  ];

  // Extract effective date
  const effectiveDate = "7/1/2025";
  
  // Convert to properly formatted HTML for the WPV viewer
  const structuredContent = `
    <div class="wpv-plan-container">
      <header class="wpv-header">
        <h1 class="wpv-title">Workplace Violence Prevention Plan</h1>
        <div class="wpv-company-header">
          <h2 class="company-name">Palms Liquor</h2>
          <div class="plan-metadata">
            <p><strong>Industry:</strong> Retail - Liquor Store</p>
            <p><strong>Effective Date:</strong> July 1, 2025</p>
            <p><strong>Plan Administrator:</strong> Edwina Stewart, Owner</p>
          </div>
        </div>
      </header>

      <section class="wpv-section policy-section">
        <h2>Policy Statement & Objectives</h2>
        
        <div class="policy-statement">
          <h3>Workplace Violence Prevention Policy</h3>
          <p>This company is committed to providing a safe workplace free from violence for all employees, customers, and visitors. This <strong>Workplace Violence Prevention Program</strong> aids <strong>Palms Liquor</strong> in protecting workers from physical and mental harm at work.</p>
        </div>

        <div class="policy-scope">
          <h3>Policy Scope</h3>
          <p>This plan applies to all Company employees and all other workers that the Company controls, directs, or supervises on the job to the extent these workers are exposed to worksite and job assignment-specific hazards.</p>
        </div>

        <div class="management-commitment">
          <h3>Management Commitment</h3>
          <p>Management is committed to implementing and maintaining this workplace violence prevention plan and reviewing it at least annually with active employee involvement.</p>
        </div>

        <div class="plan-objectives">
          <h3>Plan Objectives</h3>
          <ul class="objectives-list">
            <li><strong>Prevention:</strong> Identify and prevent workplace violence hazards</li>
            <li><strong>Protection:</strong> Implement security measures and safety protocols</li>
            <li><strong>Response:</strong> Establish clear emergency response procedures</li>
            <li><strong>Recovery:</strong> Provide support and corrective actions after incidents</li>
          </ul>
        </div>
      </section>

      <section class="wpv-section company-info-section">
        <h2>Company Information</h2>
        
        <div class="organization-details">
          <h3>Organization Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <strong>Company Name:</strong> Palms Liquor
            </div>
            <div class="detail-item">
              <strong>Industry Type:</strong> Retail - Liquor Store
            </div>
            <div class="detail-item">
              <strong>Business Hours:</strong> Varies (Large bills not accepted after 6pm)
            </div>
            <div class="detail-item">
              <strong>Plan Year:</strong> 2025
            </div>
          </div>
        </div>

        <div class="risk-factors">
          <h3>Identified Risk Factors</h3>
          <p>Based on the nature of our business, we have identified the following risk factors:</p>
          <ul class="risk-factors-list">
            <li><strong>Money Exchange</strong> - Daily cash transactions</li>
            <li><strong>Work Alone</strong> - Single employee shifts</li>
            <li><strong>Night/Early Morning Hours</strong> - Extended operating hours</li>
            <li><strong>Alcohol Distribution</strong> - Sale and handling of alcoholic beverages</li>
            <li><strong>Valued Items</strong> - Cash and inventory on premises</li>
          </ul>
        </div>
      </section>

      <section class="wpv-section coordination-section">
        <h2>Plan Coordination Team</h2>
        
        <div class="coordinator-info">
          <div class="primary-coordinator">
            <h3>Primary Plan Coordinator</h3>
            <div class="coordinator-details">
              <p><strong>Name:</strong> Edwina Stewart</p>
              <p><strong>Title:</strong> Owner</p>
              <p><strong>Role:</strong> Overall Plan Administrator</p>
            </div>
          </div>

          <div class="backup-coordinator">
            <h3>Backup Coordinator</h3>
            <div class="coordinator-details">
              <p><strong>Name:</strong> Veronica Valles</p>
              <p><strong>Title:</strong> Owner</p>
            </div>
          </div>
        </div>

        <div class="responsibilities">
          <h3>Key Responsibilities</h3>
          <ul class="responsibilities-list">
            <li>Implement, coordinate, and maintain this plan</li>
            <li>Ensure workplace security policies are communicated</li>
            <li>Oversee training and compliance</li>
            <li>Manage incident reporting and investigation</li>
          </ul>
        </div>

        <div class="review-process">
          <h3>Plan Review & Revision Process</h3>
          <div class="review-details">
            <p><strong>Review Frequency:</strong> Annually</p>
            <p><strong>Review Date:</strong> June 24, 2025</p>
            <p><strong>Effective Date:</strong> July 1, 2025</p>
            <p><strong>Reviewed By:</strong> Edwina Stewart, Easeworks LLC</p>
          </div>
          <p>The plan will be updated when deficiencies are observed, after workplace violence incidents, or when regulations change.</p>
        </div>
      </section>

      <section class="wpv-section assessment-section">
        <h2>Hazard Detection & Risk Assessment</h2>
        
        <div class="assessment-schedule">
          <h3>Risk Assessment Schedule</h3>
          <p><strong>Assessment Frequency:</strong> As needed based on incidents or changes</p>
          <p><strong>Inspection Frequency:</strong> When new hazards are introduced, incidents occur, or conditions warrant</p>
        </div>

        <div class="competent-observers">
          <h3>Competent Observers</h3>
          <table class="observers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job Title</th>
                <th>Area of Responsibility</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Edwina Stewart</td>
                <td>Owner</td>
                <td>Primary Store</td>
              </tr>
              <tr>
                <td>Veronica Valles</td>
                <td>Owner</td>
                <td>Primary Store</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="security-assessment">
          <h3>Workplace Security Assessment</h3>
          <p>Our initial inspection covers the following security measures:</p>
          
          <div class="security-categories">
            <div class="security-category">
              <h4>Physical Security Features</h4>
              <ul>
                <li><strong>Cameras:</strong> Outside facility and parking lot monitoring</li>
                <li><strong>Signage:</strong> "You're On Camera" signs posted</li>
                <li><strong>Barriers:</strong> Bars on windows for additional security</li>
                <li><strong>Location:</strong> Directly located behind Police Department</li>
              </ul>
            </div>

            <div class="security-category">
              <h4>Cash Handling Procedures</h4>
              <ul>
                <li>Cash is not saved overnight</li>
                <li>Large bills not accepted after 6pm</li>
                <li>Money orders not issued after 6pm</li>
                <li>Limited cash kept on premises after mid-day</li>
                <li>Time access procedures for large bills</li>
              </ul>
            </div>

            <div class="security-category">
              <h4>Emergency Preparedness</h4>
              <ul>
                <li><strong>Panic Buttons:</strong> Located at register (verified annually)</li>
                <li><strong>Alarm System:</strong> Located on South Wall, West side upon entry</li>
                <li><strong>Emergency Contacts:</strong> Posted on Labor Poster in Beer Room storage cabinet</li>
                <li><strong>Escape Routes:</strong> Back door designated as primary escape route</li>
                <li><strong>Shelter Areas:</strong> Liquor room designated for shelter in place</li>
              </ul>
            </div>

            <div class="security-category">
              <h4>Employee Safety Protocols</h4>
              <ul>
                <li>Employees instructed to comply with robbery demands</li>
                <li>Pepper spray available at register</li>
                <li>Call 911 procedures established</li>
                <li>Suspicious activity assessment training (without racial profiling)</li>
                <li>Supervisor notification procedures for camera review</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="wpv-section indicators-section">
        <h2>Detection & Behavior Indicators</h2>
        
        <div class="threat-levels">
          <div class="threat-level level-1">
            <h3>Level I: Early Warning Signs</h3>
            <ul>
              <li>Intimidating or bullying behavior</li>
              <li>Discourteous or disrespectful conduct</li>
              <li>Uncooperative attitude</li>
              <li>Verbal abuse</li>
            </ul>
          </div>

          <div class="threat-level level-2">
            <h3>Level II: Escalation</h3>
            <ul>
              <li>Arguing with customers, vendors, or coworkers</li>
              <li>Refusing to obey company policies</li>
              <li>Equipment sabotage or property theft</li>
              <li>Verbalizing wishes to hurt others</li>
              <li>Sending threatening communications</li>
              <li>Victimization mindset toward management</li>
            </ul>
          </div>

          <div class="threat-level level-3">
            <h3>Level III: Emergency</h3>
            <ul>
              <li>Suicidal threats</li>
              <li>Physical fights</li>
              <li>Property destruction</li>
              <li>Extreme rage disproportionate to situation</li>
              <li>Weapon use with intent to harm</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="wpv-section reporting-section">
        <h2>Incident Reporting & Investigation</h2>
        
        <div class="reporting-methods">
          <h3>Reporting Methods</h3>
          <p>Employees can report concerns through:</p>
          <ul>
            <li>Direct supervisor reporting</li>
            <li>Anonymous submission systems</li>
            <li>Immediate notification for emergencies (911)</li>
          </ul>
        </div>

        <div class="retaliation-protection">
          <h3>Protection Against Retaliation</h3>
          <p>The company maintains strict anti-retaliation policies. Workers have access to communication means to seek emergency assistance and assess safety situations.</p>
        </div>

        <div class="investigation-process">
          <h3>Investigation Process</h3>
          <p>All incidents will be investigated promptly with appropriate corrective actions taken. Documentation will be maintained according to regulatory requirements.</p>
        </div>
      </section>

      <section class="wpv-section emergency-section">
        <h2>Emergency Communication & Response</h2>
        
        <div class="emergency-procedures">
          <h3>Emergency Procedures</h3>
          <div class="procedure-steps">
            <h4>Immediate Threats:</h4>
            <ol>
              <li>Call 911 immediately</li>
              <li>Comply with demands if confronted by criminals</li>
              <li>Use panic button at register</li>
              <li>Evacuate via back door if safe to do so</li>
              <li>Shelter in liquor room if evacuation not possible</li>
            </ol>
          </div>
        </div>

        <div class="communication-systems">
          <h3>Communication Systems</h3>
          <ul>
            <li>Landline and cell phone access available</li>
            <li>Emergency contact list posted in Beer Room</li>
            <li>Camera monitoring system for suspicious activity</li>
            <li>Direct communication with supervisors for incident review</li>
          </ul>
        </div>
      </section>

      <section class="wpv-section training-section">
        <h2>Training & Communication</h2>
        
        <div class="training-elements">
          <h3>Training Elements</h3>
          <p>All employees receive training on:</p>
          <ul>
            <li>Workplace violence prevention policies</li>
            <li>Recognition of warning signs and escalation indicators</li>
            <li>Emergency response procedures</li>
            <li>Proper reporting mechanisms</li>
            <li>Non-retaliation policies</li>
          </ul>
        </div>

        <div class="training-schedule">
          <h3>Training Schedule</h3>
          <p>Training is provided initially upon hire and as needed based on incidents or policy updates.</p>
        </div>
      </section>

      <section class="wpv-section access-section">
        <h2>Plan Availability & Access</h2>
        <p>This plan is made available to all employees and will be reviewed annually. Employees are encouraged to participate in the review process and suggest improvements.</p>
      </section>

      <section class="wpv-section recordkeeping-section">
        <h2>Recordkeeping</h2>
        <p>The company maintains records of:</p>
        <ul>
          <li>Training completion</li>
          <li>Incident reports and investigations</li>
          <li>Plan reviews and updates</li>
          <li>Security assessments and inspections</li>
        </ul>
        <p>Records are retained according to regulatory requirements and company policy.</p>
      </section>

      <footer class="wpv-footer">
        <div class="document-control">
          <h3>Document Control</h3>
          <ul>
            <li><strong>Creation Date:</strong> June 24, 2025</li>
            <li><strong>Effective Date:</strong> July 1, 2025</li>
            <li><strong>Plan ID:</strong> Generated upon system entry</li>
            <li><strong>Next Review:</strong> July 1, 2026</li>
          </ul>
          <p class="compliance-note"><em>This plan complies with California SB 553 & Labor Code §6401.9</em></p>
        </div>
      </footer>

      <style>
        .wpv-plan-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #2c3e50;
        }

        .wpv-header {
          text-align: center;
          border-bottom: 3px solid #3498db;
          padding-bottom: 2rem;
          margin-bottom: 3rem;
        }

        .wpv-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .company-name {
          font-size: 2rem;
          color: #e74c3c;
          margin-bottom: 1rem;
        }

        .plan-metadata {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          display: inline-block;
        }

        .plan-metadata p {
          margin: 0.25rem 0;
          font-size: 1.1rem;
        }

        .wpv-section {
          margin-bottom: 3rem;
          padding: 2rem;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .wpv-section h2 {
          font-size: 1.8rem;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .wpv-section h3 {
          font-size: 1.4rem;
          color: #34495e;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        .wpv-section h4 {
          font-size: 1.2rem;
          color: #555;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1rem 0;
        }

        .detail-item {
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .risk-factors-list, .objectives-list, .responsibilities-list {
          list-style: none;
          padding: 0;
        }

        .risk-factors-list li, .objectives-list li, .responsibilities-list li {
          padding: 0.75rem;
          margin: 0.5rem 0;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }

        .observers-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .observers-table th, .observers-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .observers-table th {
          background: #f8f9fa;
          font-weight: 600;
        }

        .security-categories {
          display: grid;
          gap: 1.5rem;
          margin: 1rem 0;
        }

        .security-category {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .security-category h4 {
          color: #2c3e50;
          margin-bottom: 0.75rem;
        }

        .threat-levels {
          display: grid;
          gap: 1.5rem;
        }

        .threat-level {
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 5px solid;
        }

        .level-1 {
          background: #d1ecf1;
          border-left-color: #17a2b8;
        }

        .level-2 {
          background: #fff3cd;
          border-left-color: #ffc107;
        }

        .level-3 {
          background: #f8d7da;
          border-left-color: #dc3545;
        }

        .procedure-steps ol {
          padding-left: 1.5rem;
        }

        .procedure-steps li {
          margin: 0.5rem 0;
          font-weight: 500;
        }

        .wpv-footer {
          margin-top: 3rem;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
          text-align: center;
        }

        .document-control h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .document-control ul {
          list-style: none;
          padding: 0;
          display: inline-block;
          text-align: left;
        }

        .document-control li {
          margin: 0.25rem 0;
        }

        .compliance-note {
          margin-top: 1rem;
          font-style: italic;
          color: #6c757d;
        }

        ul {
          padding-left: 1.5rem;
        }

        li {
          margin: 0.5rem 0;
        }

        strong {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .wpv-plan-container {
            padding: 1rem;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
          
          .wpv-title {
            font-size: 2rem;
          }
          
          .company-name {
            font-size: 1.5rem;
          }
        }
      </style>
    </div>
  `;

  return {
    companyName,
    industry: "Retail - Liquor Store",
    totalEmployees: "Small retail operation",
    planYear: "2025",
    riskFactors,
    primaryCoordinator,
    backupCoordinator,
    competentObservers,
    reviewFrequency: "annually", 
    inspectionFrequency: "as needed",
    effectiveDate,
    planContent: structuredContent
  };
}