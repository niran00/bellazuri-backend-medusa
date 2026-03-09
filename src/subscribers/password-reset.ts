import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import nodemailer from "nodemailer"

export default async function passwordResetHandler({
  event,
  container,
}: SubscriberArgs<any>) {

  const logger = container.resolve("logger")

  const email = event.data.entity_id
  const token = event.data.token

  const resetUrl = `http://localhost:3000/za-en/reset-password?token=${token}&email=${email}`

  try {

    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false,
    })

    await transporter.sendMail({
      from: "store@test.com",
      to: email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    })

    logger.info(`📧 Reset email sent to ${email}`)
    logger.info(resetUrl)

  } catch (err) {
    logger.error("Failed to send reset email")
    logger.error(err)
  }

}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}