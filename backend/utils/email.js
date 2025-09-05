const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Flag to control whether we actually send emails. If transporter can't connect,
// we fallback to logging OTPs to the console (safe for local development only).
let SEND_EMAILS = true;

// Verify transporter at startup and toggle SEND_EMAILS if SMTP isn't available.
transporter.verify()
    .then(() => {
        console.log('Email transporter is ready');
    })
    .catch((err) => {
        SEND_EMAILS = false;
        console.error('Email transporter error:', err);
        console.warn('Falling back to console-only OTP logging. Set real SMTP creds in .env to enable sending.');
    });

const sendOTP = async (email, otp, userName = null) => {
    // Extract first name from email if userName is not provided
    const displayName = userName || email.split('@')[0];

    const mailOptions = {
        from: `"Invest Club Platform" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: '🔐 Your One-Time Password (OTP) - Invest Club Platform',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🏦 Invest Club Platform</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Secure Authentication</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Hi ${displayName}!  </h2>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                    Thank you for using Invest Club Platform. To complete your verification, please use the One-Time Password (OTP) below:
                </p>
                
                <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Your OTP Code:</p>
                    <h1 style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                           <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong> for your security.
                    </p>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3 style="color: #333; font-size: 18px;">Security Tips:</h3>
                    <ul style="color: #666; font-size: 14px; line-height: 1.8;">
                        <li>Never share your OTP with anyone</li>
                        <li>Our team will never ask for your OTP over phone or email</li>
                        <li>If you didn't request this OTP, please ignore this email</li>
                    </ul>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <div style="text-align: center; color: #666; font-size: 12px;">
                    <p style="margin: 0;">Need help? Contact our support team</p>
                    <p style="margin: 5px 0 0 0;">
                        Email: <a href="mailto:support@investclub.com" style="color: #007bff;">support@investclub.com</a>
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                <p>© 2025 Invest Club Platform. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>`,
        text: `Hi ${displayName}!

Thank you for using Invest Club Platform. 

Your One-Time Password (OTP) is: ${otp}

   IMPORTANT: This OTP will expire in 10 minutes for your security.

Security Tips:
• Never share your OTP with anyone
• Our team will never ask for your OTP over phone or email  
• If you didn't request this OTP, please ignore this email

Need help? Contact us at support@investclub.com

© 2025 Invest Club Platform. All rights reserved.
This is an automated message. Please do not reply to this email.`
    };

    if (!SEND_EMAILS || process.env.NODE_ENV === 'test') {
        // Don't attempt SMTP in environments where it's disabled — log OTP to console for dev.
        console.log(`DEV MODE: OTP for ${email}: ${otp} (expires in 10 minutes)`);
        return;
    }

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending OTP email to', email, err);
        // If sending fails at runtime, fall back to console logging so signup doesn't block.
        console.warn(`Falling back to console OTP for ${email} due to send failure.`);
        console.log(`OTP for ${email}: ${otp}`);
        throw err; // still throw so callers can decide how to behave (we already logged OTP)
    }
};

const sendTempPassword = async (email, tempPassword, userName = null) => {
    // Extract first name from email if userName is not provided
    const displayName = userName || email.split('@')[0];

    const mailOptions = {
        from: `"Invest Club Platform" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: '🔑 Your Temporary Password - Invest Club Platform',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Temporary Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🏦 Invest Club Platform</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Password Recovery</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Hi ${displayName}!  </h2>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                    We've generated a temporary password for your Invest Club Platform account as requested.
                </p>
                
                <div style="background-color: #f8f9fa; border: 2px dashed #28a745; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Your Temporary Password:</p>
                    <h1 style="font-size: 32px; font-weight: bold; color: #28a745; letter-spacing: 3px; margin: 0; font-family: 'Courier New', monospace;">${tempPassword}</h1>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                        🔒 <strong>Security Notice:</strong> Please change this temporary password immediately after logging in.
                    </p>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3 style="color: #333; font-size: 18px;">Next Steps:</h3>
                    <ol style="color: #666; font-size: 14px; line-height: 1.8;">
                        <li>Use this temporary password to log in to your account</li>
                        <li>Go to your profile settings</li>
                        <li>Change your password to something secure and memorable</li>
                    </ol>
                </div>
                
                <div style="background-color: #d1ecf1; border: 1px solid #b8daff; border-radius: 5px; padding: 15px; margin: 25px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #0c5460;">🛡️ Security Reminders:</h4>
                    <ul style="margin: 0; color: #0c5460; font-size: 13px; line-height: 1.6;">
                        <li>Never share your password with anyone</li>
                        <li>Use a strong, unique password for your account</li>
                        <li>If you didn't request this password reset, please contact us immediately</li>
                    </ul>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <div style="text-align: center; color: #666; font-size: 12px;">
                    <p style="margin: 0;">Need help? Contact our support team</p>
                    <p style="margin: 5px 0 0 0;">
                        Email: <a href="mailto:support@investclub.com" style="color: #007bff;">support@investclub.com</a>
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                <p>© 2025 Invest Club Platform. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>`,
        text: `Hi ${displayName}!

We've generated a temporary password for your Invest Club Platform account as requested.

Your Temporary Password: ${tempPassword}

🔒 SECURITY NOTICE: Please change this temporary password immediately after logging in.

Next Steps:
1. Use this temporary password to log in to your account
2. Go to your profile settings  
3. Change your password to something secure and memorable

Security Reminders:
• Never share your password with anyone
• Use a strong, unique password for your account
• If you didn't request this password reset, please contact us immediately

Need help? Contact us at support@investclub.com

© 2025 Invest Club Platform. All rights reserved.
This is an automated message. Please do not reply to this email.`
    };

    if (!SEND_EMAILS || process.env.NODE_ENV === 'test') {
        // Don't attempt SMTP in environments where it's disabled — log temp password to console for dev.
        console.log(`DEV MODE: Temporary password for ${email}: ${tempPassword}`);
        return;
    }

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending temporary password email to', email, err);
        // If sending fails at runtime, fall back to console logging.
        console.warn(`Falling back to console temp password for ${email} due to send failure.`);
        console.log(`Temporary password for ${email}: ${tempPassword}`);
        throw err;
    }
};

module.exports = { sendOTP, sendTempPassword };
