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

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`
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

const sendTempPassword = async (email, tempPassword) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your Temporary Password',
        text: `Your temporary password is: ${tempPassword}

Please use this password to login and then change it immediately for security reasons.

This is a system-generated password. Please do not reply to this email.`
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
