import { Container, Heading, Badge, Table } from "@medusajs/ui"
import { useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: { type: "session" },
})

const formatCurrency = (
  amount: number = 0,
  currency: string
) => {
  const major = amount / 100

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(major)
}

const AffiliateDetails = () => {
  const { id } = useParams()
  const [affiliate, setAffiliate] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await sdk.client.fetch(
          `/admin/affiliate/${id}`
        )

        setAffiliate(result.affiliate ?? result)
        setOrders(result.orders ?? [])
      } catch (err: any) {
        setError(err?.message || "Failed to load affiliate details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const totals = useMemo(() => {
    let totalSales = 0
    let totalDiscounts = 0
    let totalCommission = 0

    orders.forEach((order) => {
      totalSales += order.total ?? 0
      totalDiscounts += order.discount_total ?? 0
      totalCommission += order.commissionTotal ?? 0
    })

    return {
      totalUsage: orders.length,
      totalSales,
      totalDiscounts,
      totalCommission,
    }
  }, [orders])

  if (loading) {
    return (
      <Container>
        <Heading level="h2">Loading affiliate...</Heading>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Heading level="h2">Error</Heading>
        <div className="mt-4 text-red-600">{error}</div>
      </Container>
    )
  }

  if (!affiliate) {
    return (
      <Container>
        <Heading level="h2">Affiliate not found</Heading>
      </Container>
    )
  }

  const displayCurrency =
    orders.length > 0
      ? orders[0].currency_code
      : "usd"

  return (
    <Container className="space-y-8">
      <div>
        <Heading level="h2">
          {affiliate.email}
        </Heading>

        <div className="flex gap-3 mt-2">
          <Badge>{affiliate.status}</Badge>
          <Badge>Code: {affiliate.code}</Badge>
          <Badge>
            Commission: {affiliate.commission_rate}%
          </Badge>
        </div>
      </div>

      {/* 🔥 Simplified Summary */}
      <div className="border rounded-lg p-6 bg-ui-bg-base space-y-2">
        <Heading level="h3">Summary</Heading>

        <div>Total Usage: {totals.totalUsage}</div>

        <div>
          Total Sales:{" "}
          {formatCurrency(totals.totalSales, displayCurrency)}
        </div>

        <div>
          Total Discounts:{" "}
          {formatCurrency(totals.totalDiscounts, displayCurrency)}
        </div>

        <div className="font-semibold">
          Total Commission:{" "}
          {formatCurrency(totals.totalCommission, displayCurrency)}
        </div>
      </div>

      <div>
        <Heading level="h3" className="mb-4">
          Orders Using Coupon
        </Heading>

        {orders.length === 0 && (
          <div className="text-ui-fg-subtle">
            No orders yet.
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order: any) => (
            <details
              key={order.id}
              className="border rounded-lg p-4"
            >
              <summary className="cursor-pointer font-medium flex justify-between">
                <span>{new Date(order.created_at).toLocaleString()} | {order.id}</span>
                <span>
                  {formatCurrency(order.total, order.currency_code)}
                </span>
              </summary>

              <div className="mt-4">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Item</Table.HeaderCell>
                      <Table.HeaderCell>Quantity</Table.HeaderCell>
                      <Table.HeaderCell>Total</Table.HeaderCell>
                      <Table.HeaderCell>Commission</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {(order.items ?? []).map((item: any) => (
                      <Table.Row key={item.id}>
                        <Table.Cell>{item.title}</Table.Cell>
                        <Table.Cell>{item.quantity}</Table.Cell>
                        <Table.Cell>
                          {formatCurrency(item.total, order.currency_code)}
                        </Table.Cell>
                        <Table.Cell>
                          {formatCurrency(item.commission, order.currency_code)}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>

                <div className="mt-4 text-right font-semibold">
                  Order Commission:{" "}
                  {formatCurrency(
                    order.commissionTotal,
                    order.currency_code
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default AffiliateDetails