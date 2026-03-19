import nodemailer from "nodemailer"

export default class EmailService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `http://15.240.44.131:3000/za-en/reset-password?token=${token}`

    await this.transporter.sendMail({
      from: `"Your Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    })
  }
}