-- Complete remaining email templates with EaseLearn branding
UPDATE email_templates 
SET html_content = CASE 
  WHEN id = '7571f8b1-daed-48e3-b27d-baa318b948ba' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA Disabled</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">⚠️ Security Change</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Two-Factor Authentication disabled</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Two-Factor Authentication (2FA) has been disabled on your EaseLearn account.
            </p>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
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
                <a href="{{security_settings_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Re-enable 2FA
                </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The EaseLearn Security Team
            </p>
        </div>
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 15px;">
                <img src="https://easeworks.com/logo.png" alt="EaseLearn" style="height: 24px; width: auto;" />
            </div>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
                <strong>EaseLearn by EaseWorks</strong><br>
                📧 support@easeworks.com | 📞 (555) 123-4567<br>
                🌐 <a href="https://easeworks.com" style="color: #655dc6;">www.easeworks.com</a>
            </p>
        </div>
    </div>
</body>
</html>'

  WHEN id = 'cd3e620f-4cae-4c70-acd7-15b030c5ef4a' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Maintenance</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔧 Scheduled Maintenance</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">System improvement in progress</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                We''re performing scheduled maintenance on {{service_name}} to improve performance and add new features.
            </p>
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); border-radius: 8px; padding: 25px; margin: 25px 0; border: 1px solid #655dc6;">
                <h3 style="color: #655dc6; margin: 0 0 15px 0; font-size: 18px;">Maintenance Details:</h3>
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
                <a href="{{status_page_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    View Status Page
                </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The EaseLearn Operations Team
            </p>
        </div>
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 15px;">
                <img src="https://easeworks.com/logo.png" alt="EaseLearn" style="height: 24px; width: auto;" />
            </div>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
                <strong>EaseLearn by EaseWorks</strong><br>
                📧 support@easeworks.com | 📞 (555) 123-4567<br>
                🌐 <a href="https://easeworks.com" style="color: #655dc6;">www.easeworks.com</a>
            </p>
        </div>
    </div>
</body>
</html>'

  WHEN id = 'b368d6d3-53ed-433a-9ef0-312df4638d38' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📝 Account Updated</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your account information has been changed</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Your EaseLearn account has been updated. Here are the changes that were made:
            </p>
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); border-radius: 8px; padding: 25px; margin: 25px 0; border: 1px solid #655dc6;">
                <h3 style="color: #655dc6; margin: 0 0 15px 0; font-size: 18px;">Changes Made:</h3>
                <div style="color: #374151;">{{changes_list}}</div>
            </div>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Updated on:</strong> {{timestamp}}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #374151;"><strong>Updated by:</strong> {{updated_by}}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                If you didn''t make these changes or have any concerns, please contact our support team immediately.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{account_settings_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    View Account Settings
                </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The EaseLearn Support Team
            </p>
        </div>
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 15px;">
                <img src="https://easeworks.com/logo.png" alt="EaseLearn" style="height: 24px; width: auto;" />
            </div>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
                <strong>EaseLearn by EaseWorks</strong><br>
                📧 support@easeworks.com | 📞 (555) 123-4567<br>
                🌐 <a href="https://easeworks.com" style="color: #655dc6;">www.easeworks.com</a>
            </p>
        </div>
    </div>
</body>
</html>'

  ELSE html_content
END
WHERE id IN (
  '7571f8b1-daed-48e3-b27d-baa318b948ba',
  'cd3e620f-4cae-4c70-acd7-15b030c5ef4a',
  'b368d6d3-53ed-433a-9ef0-312df4638d38'
);