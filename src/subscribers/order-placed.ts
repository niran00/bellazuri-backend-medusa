import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import nodemailer from "nodemailer"

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<any>) {

  const logger = container.resolve("logger")

  try {
    const orderId = event.data.id

    if (!orderId) {
      logger.error("❌ No order ID in event")
      return
    }

    logger.info(`📦 order.placed received: ${orderId}`)

    // =========================
    // FETCH FULL ORDER
    // =========================
    const query = container.resolve("query")

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "email",
        "item_total",
        "shipping_total",
        "total",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "payment_collections.payments.*"
      ],
      filters: {
        id: orderId,
      },
    })

    const order = orders?.[0]

    if (!order || !order.email) {
      logger.error("❌ Order not found or missing email")
      logger.info(JSON.stringify(order, null, 2))
      return
    }

    logger.info(`✅ Order loaded: ${order} (${order.email})`)

    // =========================
    // EMAIL SETUP
    // =========================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // =========================
    // FORMAT ITEMS
    // =========================
    const itemsHtml = order.items?.map((item: any) => `
      <tr>
        <td><img src="${item.thumbnail}" width="60" /></td>
        <td>${item.title}</td>
        <td>${item.product_subtitle}</td>
        <td>${item.quantity}</td>
        <td>${order.payment_collections?.[0]?.payments?.[0]?.currency_code?.toUpperCase()}${Number(item.unit_price).toFixed(2)}</td>
      </tr>
    `).join("") || ""

    const itemTotal = Number(order.item_total).toFixed(2)

    let shippingTotal: any = Number(order.shipping_total).toFixed(2)

    if(order.shipping_total === 0){
        shippingTotal = "Free shipping"
    }

    const total = Number(order.total).toFixed(2)

    const shipping = order.shipping_address
    const billing = order.billing_address

    
    let paymentMethod = order.payment_collections?.[0]?.payments?.[0]?.provider_id

    
    if(paymentMethod == "pp_system_default"){
        paymentMethod = "Cash on delivery"
    }

    let paymentCurrency = order.payment_collections?.[0]?.payments?.[0]?.currency_code?.toUpperCase() || ""

    const formatAddress = (addr: any) => {
      if (!addr) return "N/A"
    
      return `
        ${addr.first_name || ""} ${addr.last_name || ""}<br/>
        ${addr.address_1 || ""} ${addr.address_2 || ""}<br/>
        ${addr.city || ""}, ${addr.province || ""}<br/>
        ${addr.postal_code || ""}<br/>
        ${addr.country_code || ""}<br/>
        📞 ${addr.phone || ""}<br/>
        ✉️ ${order.email || ""}
      `
    }
    
    const shippingAddressHtml = formatAddress(shipping)
    const billingAddressHtml = formatAddress(billing)

    // =========================
    // CUSTOMER EMAIL
    // =========================
    try {
      await transporter.sendMail({
        from: `"Bellazuri - Roots of Beauty" <${process.env.EMAIL_USER}>`, // ✅ important
        to: order.email,
        subject: "Order Confirmation",
        html: `
  <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <div style="text-align:center; padding:20px;">
        <img src="https://ci3.googleusercontent.com/meips/ADKq_NbybXxlY3aS7Tk5pFP6N0ScovqQiHPXtZsH6E0BEvBo2wShZdkUCzMwAYPK_2NWw_FgvRhy82xnXKkBB8ciNO9PnIHPYjzXwc2DME_BXt2V9DeQ2Tt93pUQz_9U2LI=s0-d-e1-ft#https://bellazuri.com/wp-content/uploads/2022/04/bellazuri-full-logo.png" width="120"/>
        <h2 style="margin:10px 0 5px;">Thank you for your order!</h2>
        <p style="color:#666;">Order ID: ${order.id}</p>
      </div>

      <div style="padding:20px;">
        <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f3f6; text-align:left;">
              <th>Product Image</th>
              <th>Title</th>
              <th>Variation</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="padding:20px; border-top:1px solid #eee;">
        <p style="margin:6px 0;">Subtotal: ${paymentCurrency}${itemTotal}</p>
        <p style="margin:6px 0;">Shipping: ${paymentCurrency}${shippingTotal}</p>
        <p style="margin:10px 0; font-size:18px;"><strong>Total: ${paymentCurrency}${total}</strong></p>
        <p style="margin-top:10px;">Payment method: ${paymentMethod}</p>
      </div>

      <div style="display:flex; gap:20px; padding:20px; border-top:1px solid #eee;">
        <div style="width:50%;">
          <h4>🚚 Shipping</h4>
          <p style="color:#555; line-height:1.5;">${shippingAddressHtml}</p>
        </div>
        <div style="width:50%;">
          <h4>🧾 Billing</h4>
          <p style="color:#555; line-height:1.5;">${billingAddressHtml}</p>
        </div>
      </div>

    </div>
  </div>
`
      })

      logger.info(`📧 Customer email sent to ${order.email}`)
    } catch (err) {
      logger.error("❌ Customer email failed")
      logger.error(err)
    }

    // =========================
    // ADMIN EMAILS (FIXED)
    // =========================
    const adminEmails = process.env.ADMIN_EMAILS
      ?.split(",")
      .map((e) => e.trim())
      .filter(Boolean)

    logger.info("📧 Admin emails:", adminEmails)

    if (adminEmails?.length) {
      for (const email of adminEmails) {
        try {
          await transporter.sendMail({
            from: `"Bellazuri - Roots of Beauty" <${process.env.EMAIL_USER}>`, // ✅ important
            to: email,
            subject: "Bellazuri - New Order Received",
            html: `
  <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <div style="text-align:center; padding:20px;">
        <img src="https://ci3.googleusercontent.com/meips/ADKq_NbybXxlY3aS7Tk5pFP6N0ScovqQiHPXtZsH6E0BEvBo2wShZdkUCzMwAYPK_2NWw_FgvRhy82xnXKkBB8ciNO9PnIHPYjzXwc2DME_BXt2V9DeQ2Tt93pUQz_9U2LI=s0-d-e1-ft#https://bellazuri.com/wp-content/uploads/2022/04/bellazuri-full-logo.png" width="120"/>
        <h2 style="margin:10px 0;">New Order Received</h2>
        <p style="color:#666;">${order.id}</p>
      </div>

      <div style="padding:20px;">
        <p><strong>Customer:</strong> ${order.email}</p>

        <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="background:#f1f3f6; text-align:left;">
              <th>Product Image</th>
              <th>Title</th>
              <th>Variation</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="padding:20px; border-top:1px solid #eee;">
        <p>Subtotal: ${paymentCurrency}${itemTotal}</p>
        <p>Shipping: ${paymentCurrency}${shippingTotal}</p>
        <p style="font-size:18px;"><strong>Total: ${paymentCurrency}${total}</strong></p>
        <p>Payment method: ${paymentMethod}</p>
      </div>

      <div style="display:flex; gap:20px; padding:20px; border-top:1px solid #eee;">
        <div style="width:50%;">
          <h4>🚚 Shipping</h4>
          <p style="color:#555; line-height:1.5;">${shippingAddressHtml}</p>
        </div>
        <div style="width:50%;">
          <h4>🧾 Billing</h4>
          <p style="color:#555; line-height:1.5;">${billingAddressHtml}</p>
        </div>
      </div>

    </div>
  </div>
`,
          })

          logger.info(`📧 Admin email sent to ${email}`)
        } catch (err) {
          logger.error(`❌ Failed to send admin email to ${email}`)
          logger.error(err)
        }
      }
    } else {
      logger.warn("⚠️ No admin emails configured")
    }

    logger.info(`🎉 Order email process completed for ${order.id}`)

  } catch (err) {
    logger.error("❌ Failed to send order emails")
    logger.error(err)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}