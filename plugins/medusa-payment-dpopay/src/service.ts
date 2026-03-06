import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"

class DpoPayProvider extends AbstractPaymentProvider {

  static identifier = "dpopay"

  constructor(container: any, options: any) {
    super(container, options)
  }

  async initiatePayment(input: any): Promise<any> {

    const amount = input.amount
    const currency = input.currency_code

    const now = new Date()

    const serviceDate =
      now.getFullYear() +
      "/" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "/" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0")

    const body = `
<API3G>
  <CompanyToken>${this.config.companyToken}</CompanyToken>
  <Request>createToken</Request>

  <Transaction>
    <PaymentAmount>${Number(amount) / 100}</PaymentAmount>
    <PaymentCurrency>${currency.toUpperCase()}</PaymentCurrency>
    <CompanyRef>medusa-${Date.now()}</CompanyRef>
    <CompanyRefUnique>1</CompanyRefUnique>
    <RedirectURL>https://yourstore.com/complete</RedirectURL>
    <BackURL>https://yourstore.com/cancel</BackURL>
  </Transaction>

  <Services>
    <Service>
      <ServiceType>${this.config.serviceType}</ServiceType>
      <ServiceDescription>Medusa Order</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>

</API3G>
`

    const response = await fetch(
      "https://secure.3gdirectpay.com/API/v6/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
        },
        body: body,
      }
    )

    const text = await response.text()

    console.log("DPO RESPONSE:", text)

    const tokenMatch = text.match(/<TransToken>(.*?)<\/TransToken>/)

    if (!tokenMatch) {
      throw new Error("DPO token creation failed: " + text)
    }

    const token = tokenMatch[1]

    const redirectUrl =
      "https://secure.3gdirectpay.com/payv2.php?ID=" + token

    return {
      id: "dpopay-session",
      data: {
        token: token,
        redirectUrl: redirectUrl,
      },
    }
  }

  async authorizePayment(data: any) {
    return {
      status: PaymentSessionStatus.PENDING,
      data: data,
    }
  }

  async capturePayment(data: any) {
    return { data }
  }

  async cancelPayment(data: any) {
    return { data }
  }

  async deletePayment(data: any) {
    return { data }
  }

  async getPaymentStatus(data: any) {
    return {
      status: PaymentSessionStatus.PENDING,
    }
  }

  async retrievePayment(data: any) {
    return { data }
  }

  async updatePayment(data: any) {
    return { data }
  }

  async refundPayment(data: any) {
    return { data }
  }

  async getWebhookActionAndData() {
    return {
      action: "authorized" as any,
      data: {
        session_id: "dpopay-session",
        amount: 0,
      },
    }
  }
}

export default DpoPayProvider