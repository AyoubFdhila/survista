// server/src/mail/mail.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null; 

  constructor(private readonly configService: ConfigService) {}

  // Initializes the Nodemailer transporter using an Ethereal test account
  private async ensureTransporter() {
    if (this.transporter) {
      return;
    }
    try {
      // Create a temporary test account on Ethereal
      const testAccount = await nodemailer.createTestAccount();
      this.logger.log(`Ethereal test account created: User - ${testAccount.user}`);
     
      // Create the Nodemailer transporter object
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host, // Ethereal SMTP host
        port: testAccount.smtp.port, // Ethereal SMTP port
        secure: testAccount.smtp.secure, // Usually false for Ethereal on port 587
        auth: {
          user: testAccount.user, // Ethereal username
          pass: testAccount.pass, // Ethereal password
        },
      });
      this.logger.log('Nodemailer transporter initialized with Ethereal.');

    } catch (error) {
      this.logger.error('Failed to create Ethereal test account or transporter', error.stack);
      // If transporter fails to init, subsequent email sends will fail
      this.transporter = null; 
    }
  }

  async sendPasswordResetEmail(to: string, selector: string, token: string): Promise<void> {
    // Ensure the transporter is ready 
    await this.ensureTransporter();

    if (!this.transporter) {
        this.logger.error(`Transporter not available. Cannot send password reset email to ${to}.`);
        return;
    }

    // Construct the reset URL using the frontend base URL and the PLAIN token
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/auth/reset-password?selector=${selector}&token=${token}`; 

    // Define the email message options
    const message = {
      from: '"Survista Support" <noreply@survista.example>', 
      to: to,
      subject: 'Your Survista Password Reset Request',
      text: `You requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\nIf you did not request this change, please ignore this email.`,
      html: `<p>You requested a password reset. Please click the link below to reset your password:</p>
              <p><a href="${resetUrl}">Reset Password</a></p>
              <p>This link will expire in 1 hour.</p>
              <p>If you did not request this change, please ignore this email.</p>`,
    };

    // Send the email using the transporter
    try {
      const info = await this.transporter.sendMail(message);
      this.logger.log(`Password reset email sent to ${to}. Message ID: ${info.messageId}`);

      // --- Correct Ethereal Preview URL Logging ---
      // This uses the 'info' object returned by sendMail
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) { // Check if a URL was actually generated (only works for Ethereal)
          this.logger.log(`Ethereal Preview URL: ${previewUrl}`);
      }

    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not send password reset email.'); 
    }
  }

  // Send a password reset confirmation email method
  async sendPasswordResetConfirmationEmail(to: string): Promise<void> {
    
    await this.ensureTransporter();

    if (!this.transporter) {
      this.logger.error(`Transporter not available. Cannot send password confirmation email to ${to}.`);
      return;
    }

    // Define the confirmation message
    const message = {
      from: '"Survista Security" <noreply@survista.example>',
      to: to,
      subject: 'Your Survista Password Has Been Changed',
      text: `This email confirms that the password for your Survista account associated with this email address (${to}) was recently changed.\n\nIf you did not make this change, please contact support immediately.`,
      html: `<p>This email confirms that the password for your Survista account associated with this email address (${to}) was recently changed.</p><p>If you did not make this change, please contact support immediately.</p>`,
    };

    // Send the email
    try {
      const info = await this.transporter.sendMail(message);
      this.logger.log(`Password reset confirmation email sent to ${to}. Message ID: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`Ethereal Preview URL: ${previewUrl}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset confirmation email to ${to}: ${error.message}`, error.stack);
    }
  }
}