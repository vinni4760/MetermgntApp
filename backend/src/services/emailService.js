const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
        return null;
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send credentials email to new user
const sendCredentialsEmail = async (email, username, password, role) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log('Email not sent (service not configured)');
        return { success: false, message: 'Email service not configured' };
    }

    const roleTitle = role === 'INSTALLER' ? 'Installer' : role === 'VENDOR' ? 'Vendor' : 'User';

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Your Meter Management System Login Credentials',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .credential-item { margin: 10px 0; }
                    .credential-label { font-weight: bold; color: #666; }
                    .credential-value { font-family: monospace; background: #f0f0f0; padding: 8px; display: inline-block; margin-top: 5px; border-radius: 4px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Meter Management System</h1>
                        <p>Your ${roleTitle} account has been created!</p>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>An administrator has created a ${roleTitle} account for you in the Meter Management System.</p>
                        
                        <div class="credentials">
                            <div class="credential-item">
                                <div class="credential-label">Username:</div>
                                <div class="credential-value">${username}</div>
                            </div>
                            <div class="credential-item">
                                <div class="credential-label">Temporary Password:</div>
                                <div class="credential-value">${password}</div>
                            </div>
                            <div class="credential-item">
                                <div class="credential-label">Role:</div>
                                <div class="credential-value">${roleTitle}</div>
                            </div>
                        </div>
                        
                        <p><strong>Important Security Notes:</strong></p>
                        <ul>
                            <li>Please change your password after first login</li>
                            <li>Do not share your credentials with anyone</li>
                            <li>Keep this email in a secure location</li>
                        </ul>
                        
                        <center>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login Now</a>
                        </center>
                        
                        <p>If you have any questions or need assistance, please contact your system administrator.</p>
                        
                        <div class="footer">
                            <p>This is an automated email from Meter Management System</p>
                            <p>Please do not reply to this email</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, message: 'Email sent successfully', messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, message: error.message };
    }
};

module.exports = {
    sendCredentialsEmail
};
