import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, password } = req.body

    console.log("ACTIVATE ACCOUNT:", email)

    const customerService = req.scope.resolve("customerService")
    const authService = req.scope.resolve("authService")

    const [customer] = await customerService.list({ email })

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    console.log("CUSTOMER FOUND:", customer.id)

    const identity = await authService.register("customer", "emailpass", {
      email,
      password,
    })

    console.log("IDENTITY CREATED:", identity.id)

    await customerService.update(customer.id, {
      auth_identity_id: identity.id,
    })

    console.log("CUSTOMER UPDATED")

    res.json({ success: true })

  } catch (error) {
    console.error("ACTIVATE ACCOUNT ERROR:", error)
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}