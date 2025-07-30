-- Create comprehensive system email templates with proper UUID for created_by

-- Authentication Templates
INSERT INTO public.email_templates (name, template_type, subject, html_content, is_active, created_by, text_content, variables) VALUES
(
  'Welcome Email Confirmation',
  'authentication',
  'Welcome to {{company_name}}! Please confirm your email',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #655DC6 0%, #7C3AED 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to {{company_name}}!</h1>
            <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 16px;">We''re excited to have you on board</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Thank you for joining {{company_name}}! To complete your account setup, please confirm your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{confirmation_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #655DC6 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Confirm Email Address
                </a>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #6B7280; margin: 20px 0;">
                If the button doesn''t work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; word-break: break-all; color: #655DC6; background-color: #F3F4F6; padding: 10px; border-radius: 4px; margin: 10px 0 20px 0;">{{confirmation_url}}</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The {{company_name}} Team
            </p>
        </div>
        <div style="background-color: #F9FAFB; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="font-size: 12px; color: #6B7280; margin: 0;">
                If you didn''t create an account, you can safely ignore this email.
            </p>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Welcome to {{company_name}}! Please confirm your email address to complete your account setup.',
  '["company_name", "first_name", "confirmation_url"]'::jsonb
),
(
  'Password Reset Request',
  'authentication',
  'Reset your {{company_name}} password',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Password Reset</h1>
            <p style="color: #FEF3C7; margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                We received a request to reset your password for your {{company_name}} account. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{reset_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Reset Password
                </a>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #6B7280; margin: 20px 0;">
                This link will expire in {{expiry_hours}} hours for security purposes.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #6B7280; margin: 20px 0;">
                If you didn''t request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The {{company_name}} Security Team
            </p>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Reset your password for {{company_name}}. Click the link to create a new password.',
  '["company_name", "first_name", "reset_url", "expiry_hours"]'::jsonb
),
(
  'Login Verification Code',
  'authentication',
  'Your {{company_name}} verification code',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Verification Code</h1>
            <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 16px;">Your secure login code</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 30px 0;">
                Use this verification code to complete your login to {{company_name}}:
            </p>
            <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); border: 2px solid #10B981; border-radius: 12px; padding: 30px; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 4px; font-family: monospace;">{{verification_code}}</div>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #6B7280; margin: 20px 0;">
                This code will expire in <strong>{{expiry_minutes}} minutes</strong> for security purposes.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #6B7280; margin: 20px 0;">
                If you didn''t request this code, please ignore this email or contact our security team.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{security_center_url}}" style="display: inline-block; padding: 12px 24px; background: transparent; color: #10B981; border: 2px solid #10B981; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                    Security Center
                </a>
            </div>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Your verification code for {{company_name}}: {{verification_code}}',
  '["company_name", "first_name", "verification_code", "expiry_minutes", "security_center_url"]'::jsonb
),
(
  'Suspicious Login Activity',
  'security',
  'Security Alert: Unusual login activity detected',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🛡️ Security Alert</h1>
            <p style="color: #FEE2E2; margin: 10px 0 0 0; font-size: 16px;">Unusual activity detected</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                We detected a login to your {{company_name}} account from an unusual location or device:
            </p>
            <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Time:</strong> {{login_time}}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;"><strong>Location:</strong> {{location}}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;"><strong>Device:</strong> {{device}}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;"><strong>IP Address:</strong> {{ip_address}}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                If this was you, you can safely ignore this email. If you don''t recognize this activity, please:
            </p>
            <ul style="color: #374151; padding-left: 20px;">
                <li style="margin: 8px 0;">Change your password immediately</li>
                <li style="margin: 8px 0;">Enable two-factor authentication</li>
                <li style="margin: 8px 0;">Review your account activity</li>
                <li style="margin: 8px 0;">Contact our security team</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{security_center_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Secure My Account
                </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The {{company_name}} Security Team
            </p>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Security alert: Unusual login activity detected on your account.',
  '["company_name", "first_name", "login_time", "location", "device", "ip_address", "security_center_url"]'::jsonb
),
(
  '2FA Activation Notification',
  '2fa',
  'Your Two-Factor Authentication Is Now Active',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA Activated</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Security Enhanced</h1>
            <p style="color: #DDD6FE; margin: 10px 0 0 0; font-size: 16px;">Two-Factor Authentication is now active</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Security just got stronger. Two-Factor Authentication (2FA) is now enabled on your {{company_name}} account.
            </p>
            <div style="background: linear-gradient(135deg, #EDE9FE 0%, #F3F4F6 100%); border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #7C3AED; margin: 0 0 15px 0; font-size: 18px;">🔐 What this means for you:</h3>
                <ul style="color: #374151; margin: 0; padding-left: 20px;">
                    <li style="margin: 8px 0;">You''ll be prompted for a code each time you log in</li>
                    <li style="margin: 8px 0;">This extra layer helps keep your data safe—even if your password is compromised</li>
                    <li style="margin: 8px 0;">Your backup codes are securely stored for emergency access</li>
                </ul>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                Need help using 2FA? <a href="{{help_center_url}}" style="color: #7C3AED; text-decoration: none;">Visit our Help Center</a>
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Thanks for securing your account with {{company_name}}.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 10px 0 0 0;">
                — The {{company_name}} Security Team
            </p>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Two-Factor Authentication is now enabled on your account for enhanced security.',
  '["company_name", "first_name", "help_center_url"]'::jsonb
),
(
  '2FA Disabled Notification',
  '2fa',
  'Two-Factor Authentication Disabled',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA Disabled</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">⚠️ Security Change</h1>
            <p style="color: #FEF3C7; margin: 10px 0 0 0; font-size: 16px;">Two-Factor Authentication disabled</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Two-Factor Authentication (2FA) has been disabled on your {{company_name}} account.
            </p>
            <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Disabled on:</strong> {{timestamp}}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;"><strong>IP Address:</strong> {{ip_address}}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                If you didn''t make this change, please contact our security team immediately and consider:
            </p>
            <ul style="color: #374151; padding-left: 20px;">
                <li style="margin: 8px 0;">Changing your password</li>
                <li style="margin: 8px 0;">Re-enabling 2FA</li>
                <li style="margin: 8px 0;">Reviewing your account activity</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{security_settings_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Re-enable 2FA
                </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The {{company_name}} Security Team
            </p>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Two-Factor Authentication has been disabled on your account.',
  '["company_name", "first_name", "timestamp", "ip_address", "security_settings_url"]'::jsonb
),
(
  'System Maintenance Notification',
  'notification',
  'Scheduled maintenance: {{service_name}} will be temporarily unavailable',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Maintenance</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔧 Scheduled Maintenance</h1>
            <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 16px;">System improvement in progress</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                We''re performing scheduled maintenance on {{service_name}} to improve performance and add new features.
            </p>
            <div style="background: linear-gradient(135deg, #ECFDF5 0%, #F3F4F6 100%); border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">Maintenance Details:</h3>
                <p style="margin: 8px 0; color: #374151;"><strong>Start Time:</strong> {{start_time}}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Expected Duration:</strong> {{duration}}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Services Affected:</strong> {{affected_services}}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                During this time, you may experience:
            </p>
            <ul style="color: #374151; padding-left: 20px;">
                <li style="margin: 8px 0;">Temporary service unavailability</li>
                <li style="margin: 8px 0;">Slower response times</li>
                <li style="margin: 8px 0;">Limited functionality</li>
            </ul>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                We apologize for any inconvenience and appreciate your patience as we work to improve your experience.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{status_page_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    View Status Page
                </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The {{company_name}} Operations Team
            </p>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Scheduled maintenance for {{service_name}} - temporary service interruption expected.',
  '["company_name", "first_name", "service_name", "start_time", "duration", "affected_services", "status_page_url"]'::jsonb
),
(
  'Account Changes Notification',
  'system',
  'Your {{company_name}} account has been updated',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📝 Account Updated</h1>
            <p style="color: #DBEAFE; margin: 10px 0 0 0; font-size: 16px;">Your account information has been changed</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Your {{company_name}} account has been updated. Here are the changes that were made:
            </p>
            <div style="background: linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%); border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #3B82F6; margin: 0 0 15px 0; font-size: 18px;">Changes Made:</h3>
                <div style="color: #374151;">{{changes_list}}</div>
            </div>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Updated on:</strong> {{timestamp}}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;"><strong>Updated by:</strong> {{updated_by}}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                If you didn''t make these changes or have any concerns, please contact our support team immediately.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{account_settings_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    View Account Settings
                </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The {{company_name}} Support Team
            </p>
        </div>
    </div>
</body>
</html>',
  true,
  auth.uid(),
  'Your account information has been updated. Review the changes made.',
  '["company_name", "first_name", "changes_list", "timestamp", "updated_by", "account_settings_url"]'::jsonb
);