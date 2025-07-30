-- Continue updating email templates with EaseLearn branding
UPDATE email_templates 
SET html_content = CASE 
  WHEN id = 'd1a82f16-19f5-4e9b-82f7-9e89e5250428' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🛡️ Security Alert</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Unusual activity detected</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                We detected a login to your EaseLearn account from an unusual location or device:
            </p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 6px;">
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
                <a href="{{security_center_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Secure My Account
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

  WHEN id = '88a3bda3-4f1f-4622-a694-17e4a70e4de2' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA Activated</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Security Enhanced</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Two-Factor Authentication is now active</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Security just got stronger. Two-Factor Authentication (2FA) is now enabled on your EaseLearn account.
            </p>
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); border-radius: 8px; padding: 25px; margin: 25px 0; border: 1px solid #655dc6;">
                <h3 style="color: #655dc6; margin: 0 0 15px 0; font-size: 18px;">🔐 What this means for you:</h3>
                <ul style="color: #374151; margin: 0; padding-left: 20px;">
                    <li style="margin: 8px 0;">You''ll be prompted for a code each time you log in</li>
                    <li style="margin: 8px 0;">This extra layer helps keep your data safe—even if your password is compromised</li>
                    <li style="margin: 8px 0;">Your backup codes are securely stored for emergency access</li>
                </ul>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0;">
                Need help using 2FA? <a href="{{help_center_url}}" style="color: #655dc6; text-decoration: none;">Visit our Help Center</a>
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Thanks for securing your account with EaseLearn.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 10px 0 0 0;">
                — The EaseLearn Security Team
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
  'd1a82f16-19f5-4e9b-82f7-9e89e5250428',
  '88a3bda3-4f1f-4622-a694-17e4a70e4de2'
);