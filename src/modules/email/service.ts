import nodemailer from "nodemailer"

export default class EmailService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
    })
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `http://localhost:3000/za-en/reset-password?token=${token}`

    await this.transporter.sendMail({
      from: "store@test.com",
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