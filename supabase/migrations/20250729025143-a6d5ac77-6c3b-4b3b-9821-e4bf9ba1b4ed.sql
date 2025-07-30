-- Update all email templates with consistent EaseLearn branding
UPDATE email_templates 
SET html_content = CASE 
  WHEN id = '14614417-cfec-4894-8947-5bc408c8850a' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EaseLearn</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to EaseLearn!</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">We''re excited to have you on board</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                Thank you for joining EaseLearn! To complete your account setup, please confirm your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{confirmation_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Confirm Email Address
                </a>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 20px 0;">
                If the button doesn''t work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; word-break: break-all; color: #655dc6; background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0 20px 0;">{{confirmation_url}}</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0 0 0;">
                Best regards,<br>
                The EaseLearn Team
            </p>
        </div>
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 15px;">
                <img src="https://easeworks.com/logo.png" alt="EaseLearn" style="height: 24px; width: auto;" />
            </div>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">
                <strong>EaseLearn by EaseWorks</strong><br>
                📧 support@easeworks.com | 📞 (555) 123-4567<br>
                🌐 <a href="https://easeworks.com" style="color: #655dc6;">www.easeworks.com</a>
            </p>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
                If you didn''t create an account, you can safely ignore this email.
            </p>
        </div>
    </div>
</body>
</html>'

  WHEN id = 'e9f2fb8c-76dc-4860-b900-55c4a5aedf9e' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">
                We received a request to reset your password for your EaseLearn account. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{reset_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Reset Password
                </a>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 20px 0;">
                This link will expire in {{expiry_hours}} hours for security purposes.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 20px 0;">
                If you didn''t request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
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

  WHEN id = 'c65efca2-c64e-46cf-8086-1ab5391dc50c' THEN 
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Arial'', sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #8b83e0 0%, #655dc6 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://easeworks.com/logo-white.png" alt="EaseLearn" style="height: 40px; width: auto;" />
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Verification Code</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your secure login code</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 20px 0;">Hi {{first_name}},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 30px 0;">
                Use this verification code to complete your login to EaseLearn:
            </p>
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); border: 2px solid #655dc6; border-radius: 12px; padding: 30px; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #655dc6; letter-spacing: 4px; font-family: monospace;">{{verification_code}}</div>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 20px 0;">
                This code will expire in <strong>{{expiry_minutes}} minutes</strong> for security purposes.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 20px 0;">
                If you didn''t request this code, please ignore this email or contact our security team.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{security_center_url}}" style="display: inline-block; padding: 12px 24px; background: transparent; color: #655dc6; border: 2px solid #655dc6; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                    Security Center
                </a>
            </div>
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
  '14614417-cfec-4894-8947-5bc408c8850a',
  'e9f2fb8c-76dc-4860-b900-55c4a5aedf9e', 
  'c65efca2-c64e-46cf-8086-1ab5391dc50c'
);