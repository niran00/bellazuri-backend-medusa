import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AFFILIATE_MODULE } from "../../../../modules/affiliate"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { code , email, country, username} = req.body

  if (!req.auth_context?.actor_id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!code) {
    return res.status(400).json({ message: "Code is required" })
  }

  const affiliateService = req.scope.resolve(AFFILIATE_MODULE)

  const affiliate = await affiliateService.createAffiliates({
    customer_id: req.auth_context.actor_id,
    code: code.toUpperCase(),
    email: email,
    country: country,
    username: username,
    status: "pending",
  })

  return res.json({ affiliate })
}