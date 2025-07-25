import nodemailer from "nodemailer"
import { env } from "@/env.js"

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, 
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  }

  async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<EmailResponse> {
    const mailOptions = {
      from: `"${env.EMAIL_FROM_NAME || "AgriConnect Rwanda"}" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log("Message sent: %s", info.messageId)
      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      console.error("Email sending error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResponse> {
    const resetUrl = `${env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset - AgriConnect</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">AgriConnect Rwanda</h1>
            </div>
            
            <h2>Password Reset Request</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your AgriConnect account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 14px; color: #666;">
              If you're having trouble clicking the button, copy and paste the URL above into your web browser.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>
              The AgriConnect Team
            </p>
          </div>
        </body>
      </html>
    `

    const text = `
      Password Reset Request - AgriConnect Rwanda
      
      Hello,
      
      We received a request to reset your password for your AgriConnect account.
      
      To reset your password, visit: ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't make this request, you can safely ignore this email.
      
      Best regards,
      The AgriConnect Team
    `

    return this.sendEmail({
      to: email,
      subject: "Reset Your AgriConnect Password",
      html,
      text,
    })
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, verificationToken: string): Promise<EmailResponse> {
    const verificationUrl = `${env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - AgriConnect</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">AgriConnect Rwanda</h1>
            </div>
            
            <h2>Welcome to AgriConnect!</h2>
            
            <p>Thank you for joining AgriConnect, Rwanda's premier agricultural marketplace.</p>
            
            <p>To complete your registration and start connecting with farmers and buyers, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 14px; color: #666;">
              If you didn't create an account with AgriConnect, you can safely ignore this email.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>
              The AgriConnect Team
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: "Verify Your AgriConnect Email Address",
      html,
    })
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    email: string,
    orderDetails: {
      orderId: string
      totalAmount: number
      items: Array<{ name: string; quantity: number; price: number }>
    },
  ): Promise<EmailResponse> {
    const { orderId, totalAmount, items } = orderDetails

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">RWF ${item.price.toLocaleString()}</td>
        </tr>
      `,
      )
      .join("")

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - AgriConnect</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e;">AgriConnect Rwanda</h1>
            </div>
            
            <h2>Order Confirmation</h2>
            
            <p>Thank you for your order! We've received your order and it's being processed.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td colspan="2" style="padding: 15px; text-align: right;">Total:</td>
                  <td style="padding: 15px; text-align: right;">RWF ${totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <p>The farmer will be notified of your order and will contact you soon to arrange delivery.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 14px; color: #666;">
              You can track your order status by logging into your AgriConnect account.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>
              The AgriConnect Team
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderId} - AgriConnect`,
      html,
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()
