import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { AFFILIATE_MODULE } from "../../../../modules/affiliate"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const affiliateService = req.scope.resolve(AFFILIATE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { id } = req.params

  const affiliate = await affiliateService.retrieveAffiliate(id)

  if (!affiliate) {
    return res.status(404).json({ message: "Affiliate not found" })
  }

  // 🔎 Get all orders with items + promotions
  const { data: orders } = await query.graph({
  entity: "order",
  fields: [
    "id",
    "created_at",
    "total",
    "currency_code",
    "discount_total",
    "promotions.*",
    "items.*",
    "items.title",
    "items.quantity",
    "items.total",
  ],
})

  // 🎯 Filter orders by affiliate promo code
  const affiliateOrdersRaw = (orders || []).filter((order: any) =>
  (order?.promotions || []).some(
    (p: any) => p?.code === affiliate.code
  )
)

  // 🔥 Transform orders for frontend
  const transformedOrders = affiliateOrdersRaw.map((order: any) => {
    let orderCommissionTotal = 0

    const items = (order.items || []).map((item: any) => {
      const commission = Math.round(
        (item.total * affiliate.commission_rate) / 100
      )

      orderCommissionTotal += commission

      return {
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        total: item.total,
        commission,
      }
    })

    return {
      id: order.id,
      total: order.total,
      discount_total: order.discount_total ?? 0,
      created_at: order.created_at,
      currency_code: order.currency_code,
      commissionTotal: orderCommissionTotal,
      items,
    }
  })

  return res.json({
    affiliate: {
      id: affiliate.id,
      email: affiliate.email,
      code: affiliate.code,
      status: affiliate.status,
      commission_rate: affiliate.commission_rate ?? 10,
    },
    orders: transformedOrders,
    stats: {
      allTime: { totalSales: 0, totalDiscounts: 0, totalCommission: 0 },
      thisMonth: { totalSales: 0, totalDiscounts: 0, totalCommission: 0 },
      lastMonth: { totalSales: 0, totalDiscounts: 0, totalCommission: 0 },
    },
  })
}