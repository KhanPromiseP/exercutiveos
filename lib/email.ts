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
}

export async function sendNotificationEmail(email: string, subject: string, message: string) {
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
}
