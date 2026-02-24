import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AFFILIATE_MODULE } from "../../../../../modules/affiliate"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const affiliateService = req.scope.resolve(AFFILIATE_MODULE)
  const promotionService = req.scope.resolve("promotion")

  const affiliate = await affiliateService.retrieveAffiliate(id)

  if (!affiliate) {
    return res.status(404).json({ message: "Affiliate not found" })
  }

  if (affiliate.status === "approved") {
    return res.status(400).json({ message: "Already approved" })
  }

  // Create promotion
  const [promotion] = await promotionService.createPromotions([
  {
    code: affiliate.code,
    type: "standard",
    is_automatic: false,
    application_method: {
      type: "percentage",
      value: affiliate.commission_rate,
      target_type: "order",
    },
  },
])

  // Update affiliate
  await affiliateService.updateAffiliates({
    id,
    status: "approved",
    promotion_id: promotion.id,
  })

  return res.json({
    message: "Affiliate approved",
    promotion_id: promotion.id,
  })
}