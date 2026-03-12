import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260225114828 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "affiliate" drop constraint if exists "affiliate_code_unique";`);
    this.addSql(`alter table if exists "affiliate" drop constraint if exists "affiliate_email_unique";`);
    this.addSql(`alter table if exists "affiliate" drop constraint if exists "affiliate_username_unique";`);
    this.addSql(`create table if not exists "affiliate" ("id" text not null, "customer_id" text not null, "username" text not null, "email" text not null, "country" text not null, "code" text not null, "promotion_id" text null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "commission_rate" integer not null default 10, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_customer_id" ON "affiliate" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_username_unique" ON "affiliate" ("username") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_email_unique" ON "affiliate" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_code_unique" ON "affiliate" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_deleted_at" ON "affiliate" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "affiliate" cascade;`);
  }

}
