-- Create enums with IF NOT EXISTS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_log_action') THEN
        CREATE TYPE "public"."category_log_action" AS ENUM('created', 'updated', 'deleted');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
        CREATE TYPE "public"."category_type" AS ENUM('men', 'women');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE "public"."user_role" AS ENUM('admin', 'vendor', 'user');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_log_action') THEN
        CREATE TYPE "public"."vendor_log_action" AS ENUM('created', 'updated', 'approved', 'rejected', 'activated', 'deactivated', 'suspended', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_status') THEN
        CREATE TYPE "public"."vendor_status" AS ENUM('pending', 'rejected', 'active', 'inactive', 'suspended', 'archived');
    END IF;
END $$; 