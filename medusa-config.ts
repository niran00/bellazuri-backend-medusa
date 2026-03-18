import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())


export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS ,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS ,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "./src/modules/affiliate",
    },
    {
    resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
            {
            resolve: "medusa-payment-yoco",
            id: "yoco",
            options: {
              secretKey: process.env.YOCO_SECRET_KEY,
              debug: true,
              successUrl: process.env.YOCO_SUCCESS_URL,
              cancelUrl: process.env.YOCO_CANCEL_URL,
              failureUrl: process.env.YOCO_FAILURE_URL,
            },
          },
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
          {
            resolve: "medusa-payment-dpopay",
            id: "dpopay",
            options: {
              companyToken: "8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3",
              serviceType: "5525"
            }
          },
          
          {
            resolve: "medusa-payment-paystack",
            options: {
              secret_key: "sk_test_47a5c48c4effae314c58d6cc190a6b87cc62a3f6",
            } satisfies import("medusa-payment-paystack").PluginOptions,
          },
          
        ],
      },
    },

  ],
})
