import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
  InitiatePaymentInput,
  InitiatePaymentOutput,
} from "@medusajs/framework/types"


type DpoOptions = {
  companyToken: string
  serviceType: string
}

export default class DpoPayProvider extends AbstractPaymentProvider<DpoOptions> {

  static identifier = "dpopay"

    constructor(container, options) {
        super(container, options)
    }

    async initiatePayment(input : InitiatePaymentInput): Promise<InitiatePaymentOutput>{
        
        const { amount, currency_code } = input

        const token = this.config.companyToken
        const service = this.config.serviceType

        const body = `
          <API3G>
            <CompanyToken>${token}</CompanyToken>
            <Request>createToken</Request>
            <Transaction>
                <PaymentAmount>${amount}</PaymentAmount>
                <PaymentCurrency>${currency_code}</PaymentCurrency>
                <CompanyRef>medusa-${Date.now()}</CompanyRef>
                <RedirectURL>http://15.240.44.131:3000/ng-en/checkout/order-received</RedirectURL>
                <BackURL>http://15.240.44.131:3000/ng-en/checkout/</BackURL>
                <ServiceType>${service}</ServiceType>
            </Transaction>
          </API3G>
        `

        const response = await fetch("https://secure.3gdirectpay.com/API/v6/", {
            method: "POST",
            headers: {
              "Content-Type": "application/xml"
            },
            body
          })
      
          const text = await response.text()
      
          return {
            id: "dpo-payment",
            data: {
              response: text
            }
          }

    }

}