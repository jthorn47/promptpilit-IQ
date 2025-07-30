import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityAuditEvent {
  userId?: string;
  sessionId?: string;
  eventType: string; // login_attempt, data_access, export, print, etc.
  resourceType: string; // employee_data, payroll, hipaa_data, etc.
  resourceId?: string;
  action: string; // create, read, update, delete, export, print
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  sensitiveDataAccessed?: boolean;
  piiFieldsAccessed?: string[];
  dataClassification?: string;
  complianceFlags?: string[];
  metadata?: any;
}

interface SecurityRiskAssessment {
  riskScore: number;
  riskFactors: string[];
  locationAnomaly: boolean;
  timeAnomaly: boolean;
  deviceAnomaly: boolean;
  accessPatternAnomaly: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const auditEvent: SecurityAuditEvent = await req.json();
    
    console.log(`Security audit event: ${auditEvent.eventType} for ${auditEvent.resourceType}`);

    // Get request metadata
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     auditEvent.ipAddress;
    const userAgent = req.headers.get('user-agent') || auditEvent.userAgent;

    // Assess security risk
    const riskAssessment = await assessSecurityRisk(supabase, auditEvent, ipAddress, userAgent);

    // Check for compliance violations
    const violations = await checkComplianceViolations(auditEvent, riskAssessment);

    // Log to security audit table
    const { error: auditError } = await supabase
      .from('security_audit_logs')
      .insert({
        user_id: auditEvent.userId,
        session_id: auditEvent.sessionId,
        event_type: auditEvent.eventType,
        resource_type: auditEvent.resourceType,
        resource_id: auditEvent.resourceId,
        action: auditEvent.action,
        ip_address: ipAddress,
        user_agent: userAgent,
        risk_score: riskAssessment.riskScore,
        success: auditEvent.success,
        failure_reason: auditEvent.failureReason,
        sensitive_data_accessed: auditEvent.sensitiveDataAccessed || false,
        pii_fields_accessed: auditEvent.piiFieldsAccessed || [],
        data_classification: auditEvent.dataClassification,
        compliance_flags: auditEvent.complianceFlags || [],
        metadata: {
          ...auditEvent.metadata,
          riskAssessment,
          violations: violations.length > 0 ? violations : undefined
        }
      });

    if (auditError) {
      console.error('Error logging security audit:', auditError);
    }

    // Log compliance violations if any
    for (const violation of violations) {
      await logComplianceViolation(supabase, violation, auditEvent, ipAddress);
    }

    // Check if immediate action is required
    const shouldBlock = riskAssessment.riskScore > 80 || violations.some(v => v.severity === 'critical');
    
    // Update user session risk if needed
    if (auditEvent.sessionId && riskAssessment.riskScore > 50) {
      await updateSessionRisk(supabase, auditEvent.sessionId, riskAssessment);
    }

    // Send real-time alerts for high-risk events
    if (riskAssessment.riskScore > 70 || violations.length > 0) {
      await sendSecurityAlert(supabase, auditEvent, riskAssessment, violations);
    }

    const response = {
      success: true,
      riskScore: riskAssessment.riskScore,
      shouldBlock,
      violations: violations.length,
      recommendations: generateSecurityRecommendations(riskAssessment, violations)
    };

    console.log(`Security audit completed: Risk score ${riskAssessment.riskScore}, Block: ${shouldBlock}`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in security audit:', error);
    return new Response(
      JSON.stringify({ error: 'Security audit failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function assessSecurityRisk(
  supabase: any, 
  event: SecurityAuditEvent, 
  ipAddress?: string, 
  userAgent?: string
): Promise<SecurityRiskAssessment> {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Check for suspicious IP patterns
  if (ipAddress) {
    const { data: recentLogins } = await supabase
      .from('security_audit_logs')
      .select('ip_address, created_at')
      .eq('user_id', event.userId)
      .eq('event_type', 'login_attempt')
      .eq('success', true)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    const knownIPs = new Set(recentLogins?.map(r => r.ip_address) || []);
    if (!knownIPs.has(ipAddress)) {
      riskScore += 20;
      riskFactors.push('new_ip_address');
    }
  }

  // Check for unusual access patterns
  if (event.sensitiveDataAccessed) {
    riskScore += 15;
    riskFactors.push('sensitive_data_access');
  }

  // Check time-based anomalies (access outside business hours)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    riskScore += 10;
    riskFactors.push('off_hours_access');
  }

  // Check for rapid successive actions
  if (event.userId) {
    const { data: recentActions } = await supabase
      .from('security_audit_logs')
      .select('created_at')
      .eq('user_id', event.userId)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false });

    if (recentActions && recentActions.length > 20) {
      riskScore += 25;
      riskFactors.push('rapid_successive_actions');
    }
  }

  // Check for data export/print activities
  if (['export', 'print', 'download'].includes(event.action)) {
    riskScore += 15;
    riskFactors.push('data_extraction_attempt');
  }

  // Check for failed authentication attempts
  if (event.eventType === 'login_attempt' && !event.success) {
    riskScore += 10;
    riskFactors.push('failed_authentication');
  }

  return {
    riskScore: Math.min(riskScore, 100),
    riskFactors,
    locationAnomaly: riskFactors.includes('new_ip_address'),
    timeAnomaly: riskFactors.includes('off_hours_access'),
    deviceAnomaly: false, // Would implement device fingerprinting
    accessPatternAnomaly: riskFactors.includes('rapid_successive_actions')
  };
}

async function checkComplianceViolations(
  event: SecurityAuditEvent, 
  riskAssessment: SecurityRiskAssessment
): Promise<any[]> {
  const violations: any[] = [];

  // HIPAA violations
  if (event.complianceFlags?.includes('hipaa')) {
    // Access to PHI without proper authorization
    if (event.sensitiveDataAccessed && riskAssessment.riskScore > 50) {
      violations.push({
        type: 'hipaa_unauthorized_phi_access',
        severity: 'high',
        description: 'Potential unauthorized access to Protected Health Information'
      });
    }

    // PHI export/print without business justification
    if (['export', 'print'].includes(event.action) && event.complianceFlags.includes('hipaa')) {
      violations.push({
        type: 'hipaa_phi_export',
        severity: 'critical',
        description: 'Export or printing of Protected Health Information detected'
      });
    }
  }

  // SOX violations (financial data)
  if (event.complianceFlags?.includes('sox')) {
    if (['update', 'delete'].includes(event.action) && event.resourceType === 'payroll') {
      violations.push({
        type: 'sox_financial_data_modification',
        severity: 'high',
        description: 'Modification of financial/payroll data detected'
      });
    }
  }

  // PII access violations
  if (event.piiFieldsAccessed && event.piiFieldsAccessed.length > 5) {
    violations.push({
      type: 'excessive_pii_access',
      severity: 'medium',
      description: 'Access to excessive amount of PII fields'
    });
  }

  return violations;
}

async function logComplianceViolation(
  supabase: any,
  violation: any,
  event: SecurityAuditEvent,
  ipAddress?: string
) {
  await supabase
    .from('compliance_violations')
    .insert({
      violation_type: violation.type,
      severity: violation.severity,
      user_id: event.userId,
      session_id: event.sessionId,
      resource_affected: `${event.resourceType}:${event.resourceId || 'multiple'}`,
      violation_details: {
        description: violation.description,
        event: event,
        ipAddress,
        timestamp: new Date().toISOString()
      },
      auto_detected: true
    });
}

async function updateSessionRisk(
  supabase: any,
  sessionId: string,
  riskAssessment: SecurityRiskAssessment
) {
  await supabase
    .from('user_sessions_security')
    .update({
      risk_assessment: riskAssessment,
      last_activity: new Date().toISOString()
    })
    .eq('session_token', sessionId);
}

async function sendSecurityAlert(
  supabase: any,
  event: SecurityAuditEvent,
  riskAssessment: SecurityRiskAssessment,
  violations: any[]
) {
  // This would integrate with your notification system
  console.log(`🚨 SECURITY ALERT: High-risk event detected`, {
    event: event.eventType,
    user: event.userId,
    riskScore: riskAssessment.riskScore,
    violations: violations.length
  });

  // Log as a system notification or send to security team
  // Implementation would depend on your notification preferences
}

function generateSecurityRecommendations(
  riskAssessment: SecurityRiskAssessment,
  violations: any[]
): string[] {
  const recommendations: string[] = [];

  if (riskAssessment.locationAnomaly) {
    recommendations.push('Require additional authentication for new location');
  }

  if (riskAssessment.timeAnomaly) {
    recommendations.push('Verify business justification for off-hours access');
  }

  if (riskAssessment.accessPatternAnomaly) {
    recommendations.push('Monitor for potential automated/bot activity');
  }

  if (violations.some(v => v.type.includes('hipaa'))) {
    recommendations.push('Review HIPAA compliance training requirements');
  }

  if (violations.some(v => v.type.includes('export'))) {
    recommendations.push('Implement data loss prevention controls');
  }

  if (riskAssessment.riskScore > 70) {
    recommendations.push('Consider temporary access restrictions');
  }

  return recommendations;
}