import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_KEY,
  },
})

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  try {
    await transporter.sendMail({
      from: `"Executive OS" <noreply@executiveos.app>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a;">Welcome to Executive-OS</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #64748b; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    await transporter.sendMail({
      from: `"Executive OS" <noreply@executiveos.app>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a;">Reset your password</h1>
          <p>You requested a password reset for your Executive OS account. Click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #64748b; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #64748b; font-size: 14px;">This link will expire in 30 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw error
  }
}

export async function sendNotificationEmail(email: string, subject: string, message: string) {
  try {
    await transporter.sendMail({
      from: `"Executive OS" <noreply@executiveos.app>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f172a;">${subject}</h1>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 12px;">Executive OS Notification</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send notification email:", error)
    throw error
  }
}
