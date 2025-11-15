import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class AddEmailVerifiedToCustomer extends Migration {
  override async up(): Promise<void> {
    // Add email_verified column to customer table if it doesn't exist
    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'customer' 
          AND column_name = 'email_verified'
        ) THEN
          ALTER TABLE "customer" 
          ADD COLUMN "email_verified" boolean NOT NULL DEFAULT false;
        END IF;
      END $$;
    `)
  }

  override async down(): Promise<void> {
    // Remove email_verified column from customer table
    this.addSql(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'customer' 
          AND column_name = 'email_verified'
        ) THEN
          ALTER TABLE "customer" 
          DROP COLUMN "email_verified";
        END IF;
      END $$;
    `)
  }
}

