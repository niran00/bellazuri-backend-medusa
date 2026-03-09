const fs = require("fs")
const csv = require("csv-parser")
const axios = require("axios")
const crypto = require("crypto")

const BASE_URL = "http://localhost:9000"
const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rvcl9pZCI6InVzZXJfMDFLRkdTVzA0VFY1VkRHU0NXMlg5RDEzUDAiLCJhY3Rvcl90eXBlIjoidXNlciIsImF1dGhfaWRlbnRpdHlfaWQiOiJhdXRoaWRfMDFLRkdTVzAzNkZQWjgxOEc5ME5TRkpIUTgiLCJhcHBfbWV0YWRhdGEiOnsidXNlcl9pZCI6InVzZXJfMDFLRkdTVzA0VFY1VkRHU0NXMlg5RDEzUDAifSwidXNlcl9tZXRhZGF0YSI6e30sImlhdCI6MTc3MzA4MTkwMSwiZXhwIjoxNzczMTY4MzAxfQ.EH3Lp0Sf47VDpMUIPALnlos_FEhNSFNBg79HvaC_Xco"

const PUBLISHABLE_KEY = "pk_c6fd4c1a78bf948a455da4ef0e645ef88e4880b0ffbdd5eb5e9aaf699016f5a4"

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function randomPassword() {
  return crypto.randomBytes(10).toString("hex")
}

const users = []

fs.createReadStream("wp-users-addresses.csv")
.pipe(csv())
.on("data", (row) => users.push(row))
.on("end", async () => {

  for (const user of users) {

    const email = user.user_email?.trim()
    if (!email) continue

    const password = randomPassword()

    try {

      let token

      // 1️⃣ create identity
      try {

        const reg = await axios.post(
          `${BASE_URL}/auth/customer/emailpass/register`,
          { email, password }
        )

        token = reg.data.token

      } catch (err) {

        // identity exists → login
        const login = await axios.post(
          `${BASE_URL}/auth/customer/emailpass/login`,
          { email, password }
        )

        token = login.data.token

      }

      if (!token) {
        console.log("Auth failed:", email)
        continue
      }

      // 2️⃣ create customer profile
      const customer = await axios.post(
        `${BASE_URL}/store/customers`,
        {
          email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          phone: user.phone || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": PUBLISHABLE_KEY
          }
        }
      )

      const customerId = customer.data.customer.id

      console.log("Registered customer:", email)

      // save passwords
      fs.appendFileSync("/tmp/customer-passwords.csv", `${email},${password}\n`)

      // 3️⃣ add address
     

        await axios.post(
          `${BASE_URL}/admin/customers/${customerId}/addresses`,
          {
            address_name: "Address 1",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            address_1: user.address_1,
            address_2: user.address_2 || "",
            city: user.city,
            province: user.province || "",
            postal_code: user.postal_code || "",
            country_code: user.country || "",
            phone: user.phone || ""
          },
          {
            headers: {
              Authorization: `Bearer ${ADMIN_TOKEN}`
            }
          }
        )



    } catch (err) {

      console.log("❌ Import failed:", email)
      console.log(err.response?.data || err.message)

    }

    await sleep(250)

  }

  console.log("✅ Import finished")

})