const fs = require("fs")
const csv = require("csv-parser")
const axios = require("axios")

const MEDUSA_URL = "http://localhost:9000"

const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rvcl9pZCI6InVzZXJfMDFLRkdTVzA0VFY1VkRHU0NXMlg5RDEzUDAiLCJhY3Rvcl90eXBlIjoidXNlciIsImF1dGhfaWRlbnRpdHlfaWQiOiJhdXRoaWRfMDFLRkdTVzAzNkZQWjgxOEc5ME5TRkpIUTgiLCJhcHBfbWV0YWRhdGEiOnsidXNlcl9pZCI6InVzZXJfMDFLRkdTVzA0VFY1VkRHU0NXMlg5RDEzUDAiLCJyb2xlcyI6W119LCJ1c2VyX21ldGFkYXRhIjp7fSwiaWF0IjoxNzcyNzgwNzYwLCJleHAiOjE3NzI4NjcxNjB9.BdNAhPArowAmxtbTRmy9xU8_uWZ_xGz0nWQFXHCCuQ4"

const users = []
const addressCounter = {}
const processedCustomers = {}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const DEFAULT_COUNTRY = "ke"

async function deleteExistingAddresses(customerId) {

  const res = await axios.get(
    `${MEDUSA_URL}/admin/customers/${customerId}`,
    {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    }
  )

  const addresses = res.data.customer.addresses || []

  for (const addr of addresses) {

    await axios.delete(
      `${MEDUSA_URL}/admin/customers/${customerId}/addresses/${addr.id}`,
      {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      }
    )

  }

}

fs.createReadStream("wp-users-addresses.csv")
.pipe(csv())
.on("data", (row) => users.push(row))
.on("end", async () => {

  for (const user of users) {

    try {

      if (!user.user_email) continue

      const email = user.user_email.trim()
      let customerId

      // Create customer
      try {

        const res = await axios.post(
          `${MEDUSA_URL}/admin/customers`,
          {
            email: email,
            first_name: user.first_name || "",
            last_name: user.last_name || ""
          },
          {
            headers: {
              Authorization: `Bearer ${ADMIN_TOKEN}`
            }
          }
        )

        customerId = res.data.customer.id
        console.log("Customer created:", email)

      } catch (createErr) {

        if (createErr.response?.data?.message?.includes("exists")) {

          console.log("Customer exists:", email)

          const search = await axios.get(
            `${MEDUSA_URL}/admin/customers?email=${email}`,
            {
              headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            }
          )

          customerId = search.data.customers[0]?.id

        } else {
          throw createErr
        }

      }

      if (!customerId) continue

      // Delete addresses once per customer
      if (!processedCustomers[customerId]) {

        await deleteExistingAddresses(customerId)

        processedCustomers[customerId] = true
        addressCounter[customerId] = 1

      }

      // Add address
      if (user.address_1 && user.city) {

        const addressName = `Address ${addressCounter[customerId]++}`

        await axios.post(
          `${MEDUSA_URL}/admin/customers/${customerId}/addresses`,
          {
            address_name: addressName,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            address_1: user.address_1.trim(),
            address_2: user.address_2 || "",
            city: user.city.trim(),
            postal_code: user.postal_code || "",
            province: user.province || "",
            country_code: (user.country || DEFAULT_COUNTRY).toLowerCase(),
            phone: user.phone || "",
            is_default_shipping: true,
            is_default_billing: true,
          },
          {
            headers: {
              Authorization: `Bearer ${ADMIN_TOKEN}`
            }
          }
        )

        console.log(`Address added (${addressName}):`, email)

      }

      await sleep(20)

    } catch (err) {

      console.log("Error importing:", user.user_email)

      if (err.response) {
        console.log("Status:", err.response.status)
        console.log("Message:", err.response.data?.message)
        console.log("Full:", JSON.stringify(err.response.data, null, 2))
      } else {
        console.log(err.message)
      }

    }

  }

  console.log("Import finished.")

})