import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AFFILIATE_MODULE } from "../../../../../modules/affiliate"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  const affiliateService = req.scope.resolve(AFFILIATE_MODULE)

  await affiliateService.updateAffiliates({
    id,
    status: "rejected",
  })

  res.json({ message: "Affiliate rejected" })
}