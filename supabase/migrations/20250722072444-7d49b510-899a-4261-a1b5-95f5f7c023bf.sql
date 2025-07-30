-- Phase 1A: Add client_admin to app_role enum (separate transaction)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'client_admin';