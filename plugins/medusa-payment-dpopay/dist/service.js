"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
class DpoPayProvider extends utils_1.AbstractPaymentProvider {
    constructor(container, options) {
        super(container, options);
    }
    async initiatePayment(input) {
        const amount = input.amount;
        const currency = input.currency_code;
        const now = new Date();
        const serviceDate = now.getFullYear() +
            "/" +
            String(now.getMonth() + 1).padStart(2, "0") +
            "/" +
            String(now.getDate()).padStart(2, "0") +
            " " +
            String(now.getHours()).padStart(2, "0") +
            ":" +
            String(now.getMinutes()).padStart(2, "0");
        const body = `
<API3G>
  <CompanyToken>${this.config.companyToken}</CompanyToken>
  <Request>createToken</Request>

  <Transaction>
    <PaymentAmount>${Number(amount) / 100}</PaymentAmount>
    <PaymentCurrency>${currency.toUpperCase()}</PaymentCurrency>
    <CompanyRef>medusa-${Date.now()}</CompanyRef>
    <CompanyRefUnique>1</CompanyRefUnique>
    <RedirectURL>htthttp://13.246.221.62:3000/ug-en/checkout/order-received</RedirectURL>
    <BackURL>http://13.246.221.62:3000/ug-en/checkout/</BackURL>
  </Transaction>

  <Services>
    <Service>
      <ServiceType>${this.config.serviceType}</ServiceType>
      <ServiceDescription>Medusa Order</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>

</API3G>
`;
        const response = await fetch("https://secure.3gdirectpay.com/API/v6/", {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
            },
            body: body,
        });
        const text = await response.text();
        console.log("DPO RESPONSE:", text);
        const tokenMatch = text.match(/<TransToken>(.*?)<\/TransToken>/);
        if (!tokenMatch) {
            throw new Error("DPO token creation failed: " + text);
        }
        const token = tokenMatch[1];
        const redirectUrl = "https://secure.3gdirectpay.com/payv2.php?ID=" + token;
        return {
            id: "dpopay-session",
            data: {
                token: token,
                redirectUrl: redirectUrl,
            },
        };
    }
    async authorizePayment(data) {
        return {
            status: utils_1.PaymentSessionStatus.PENDING,
            data: data,
        };
    }
    async capturePayment(data) {
        return { data };
    }
    async cancelPayment(data) {
        return { data };
    }
    async deletePayment(data) {
        return { data };
    }
    async getPaymentStatus(data) {
        return {
            status: utils_1.PaymentSessionStatus.PENDING,
        };
    }
    async retrievePayment(data) {
        return { data };
    }
    async updatePayment(data) {
        return { data };
    }
    async refundPayment(data) {
        return { data };
    }
    async getWebhookActionAndData() {
        return {
            action: "authorized",
            data: {
                session_id: "dpopay-session",
                amount: 0,
            },
        };
    }
}
DpoPayProvider.identifier = "dpopay";
exports.default = DpoPayProvider;
