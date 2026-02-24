import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const affiliateService = req.scope.resolve(AFFILIATE_MODULE)

  const affiliates = await affiliateService.listAffiliates()

  console.log("affiliate list", affiliates)

  res.json({ affiliates })
}