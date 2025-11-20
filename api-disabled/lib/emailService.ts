/**
 * Email Service
 * 
 * Abstraction layer for sending emails via SendGrid, AWS SES, or other providers
 * Configure via environment variables
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailVerificationOptions {
  to: string;
  name: string;
  verificationToken: string;
}

interface PasswordResetOptions {
  to: string;
  name: string;
  resetToken: string;
}

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const emailProvider = process.env.EMAIL_PROVIDER || 'console';

  try {
    switch (emailProvider) {
      case 'sendgrid':
        return await sendEmailViaSendGrid(options);
      
      case 'ses':
        return await sendEmailViaSES(options);
      
      case 'console':
      default:
        return sendEmailToConsole(options);
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  options: EmailVerificationOptions
): Promise<boolean> {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/clinic/verify-email?token=${options.verificationToken}`;

  const emailOptions: EmailOptions = {
    to: options.to,
    subject: 'Verify Your Email - Pain Tracker Clinic Portal',
    text: `
Hello ${options.name},

Thank you for registering for the Pain Tracker Clinic Portal.

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't register for this account, please ignore this email.

Best regards,
Pain Tracker Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #2563eb; 
      color: white; 
      text-decoration: none; 
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email</h2>
    <p>Hello ${options.name},</p>
    <p>Thank you for registering for the Pain Tracker Clinic Portal.</p>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" class="button">Verify Email Address</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't register for this account, please ignore this email.</p>
    <div class="footer">
      <p>Best regards,<br>Pain Tracker Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  return await sendEmail(emailOptions);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  options: PasswordResetOptions
): Promise<boolean> {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/clinic/reset-password?token=${options.resetToken}`;

  const emailOptions: EmailOptions = {
    to: options.to,
    subject: 'Password Reset Request - Pain Tracker Clinic Portal',
    text: `
Hello ${options.name},

We received a request to reset your password for the Pain Tracker Clinic Portal.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

For security reasons, we've limited password reset requests to 3 per hour.

Best regards,
Pain Tracker Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #dc2626; 
      color: white; 
      text-decoration: none; 
      border-radius: 6px;
      margin: 20px 0;
    }
    .warning { 
      background-color: #fef3c7; 
      border-left: 4px solid #f59e0b; 
      padding: 12px; 
      margin: 20px 0;
    }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hello ${options.name},</p>
    <p>We received a request to reset your password for the Pain Tracker Clinic Portal.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
    <div class="warning">
      <strong>⚠️ Security Notice:</strong>
      <ul>
        <li>This link will expire in 1 hour</li>
        <li>All active sessions will be logged out after password reset</li>
        <li>If you didn't request this, please ignore this email</li>
      </ul>
    </div>
    <div class="footer">
      <p>Best regards,<br>Pain Tracker Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  return await sendEmail(emailOptions);
}

// ============================================================================
// Provider-specific implementations
// ============================================================================

/**
 * Send email via SendGrid
 */
async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  // Only import when needed to avoid unnecessary dependencies
  const sgMail = require('@sendgrid/mail');

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error('SENDGRID_API_KEY not configured');
    return false;
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to: options.to,
    from: process.env.EMAIL_FROM || 'noreply@paintracker.ca',
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${options.to} via SendGrid`);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}

/**
 * Send email via AWS SES
 */
async function sendEmailViaSES(options: EmailOptions): Promise<boolean> {
  // Only import when needed to avoid unnecessary dependencies
  const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

  const region = process.env.AWS_REGION || 'us-east-1';
  const sesClient = new SESClient({ region });

  const params = {
    Source: process.env.EMAIL_FROM || 'noreply@paintracker.ca',
    Destination: {
      ToAddresses: [options.to],
    },
    Message: {
      Subject: {
        Data: options.subject,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: options.text,
          Charset: 'UTF-8',
        },
        Html: options.html ? {
          Data: options.html,
          Charset: 'UTF-8',
        } : undefined,
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`Email sent to ${options.to} via AWS SES`);
    return true;
  } catch (error) {
    console.error('AWS SES error:', error);
    return false;
  }
}

/**
 * Log email to console (development mode)
 */
function sendEmailToConsole(options: EmailOptions): boolean {
  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL (Development Mode)');
  console.log('='.repeat(80));
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log('-'.repeat(80));
  console.log(options.text);
  console.log('='.repeat(80) + '\n');
  return true;
}
