import { model } from "@medusajs/framework/utils"

export const Affiliate = model.define("affiliate", {
  id: model.id().primaryKey(),

  customer_id: model.text().index(),

  email: model.text().unique(),

  code: model.text().unique(),

  promotion_id: model.text().nullable(),

  status: model
    .enum(["pending", "approved", "rejected"])
    .default("pending"),

  commission_rate: model.number().default(10),
})