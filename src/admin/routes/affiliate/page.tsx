import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Container, Heading, Table, Button, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: { type: "session" },
})

const AffiliatePage = () => {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const navigate = useNavigate()

  const fetchAffiliates = async () => {
    const { affiliates } = await sdk.client.fetch("/admin/affiliate")
    setAffiliates(affiliates)
  }

  const approve = async (id: string) => {
    await sdk.client.fetch(`/admin/affiliate/${id}/approve`, {
      method: "POST",
    })
    fetchAffiliates()
  }

  const reject = async (id: string) => {
    await sdk.client.fetch(`/admin/affiliate/${id}/reject`, {
      method: "POST",
    })
    fetchAffiliates()
  }

  useEffect(() => {
    fetchAffiliates()
  }, [])

  return (
    <Container>
      <Heading level="h2">Affiliate Users</Heading>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Code</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {affiliates.map((a) => (
            <Table.Row
              key={a.id}
              className="cursor-pointer hover:bg-ui-bg-subtle"
              onClick={() => navigate(`/affiliate/${a.id}`)}
            >
              <Table.Cell>{a.email}</Table.Cell>
              <Table.Cell>{a.code}</Table.Cell>
              <Table.Cell>
                <Badge>{a.status}</Badge>
              </Table.Cell>

              <Table.Cell
                onClick={(e) => e.stopPropagation()} // prevent row navigation when clicking buttons
              >
                {a.status === "pending" && (
                  <>
                    <Button
                      size="small"
                      onClick={() => approve(a.id)}
                    >
                      Approve
                    </Button>

                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => reject(a.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Affiliate Program",
  icon: ChatBubbleLeftRight,
})

export default AffiliatePage