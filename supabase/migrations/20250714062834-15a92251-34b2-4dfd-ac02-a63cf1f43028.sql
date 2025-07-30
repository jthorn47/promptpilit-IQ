-- Add role-based access control to knowledge base articles
-- First, add target_roles column to knowledge_base_articles
ALTER TABLE public.knowledge_base_articles 
ADD COLUMN target_roles text[] DEFAULT ARRAY['all']::text[];

-- Create an index for better query performance
CREATE INDEX idx_knowledge_base_articles_target_roles 
ON public.knowledge_base_articles USING GIN(target_roles);

-- Add a category for admin/super admin content (without conflict check)
INSERT INTO public.knowledge_base_categories (name, description, color, icon, sort_order, is_active)
VALUES ('Admin Documentation', 'Administrative guides and system management documentation', '#dc2626', 'shield', 10, true);

-- Create a comprehensive pricing management article for super admins
INSERT INTO public.knowledge_base_articles (
    title, 
    content, 
    excerpt, 
    category_id, 
    author_id, 
    status, 
    featured, 
    slug, 
    tags, 
    target_roles,
    published_at
)
VALUES (
    'Super Admin: Pricing Management Guide',
    '# Pricing Management System Guide

## Overview
The Pricing Management system provides comprehensive control over all pricing structures across the platform. This guide covers all aspects of pricing configuration for super administrators.

## Accessing Pricing Management
Navigate to **System → Pricing Management** in your admin sidebar.

## System Architecture

### 1. Package-Based Pricing (Easy/Easier/Easiest)
Traditional tiered pricing packages with volume and term discounts.

**Key Features:**
- Volume-based pricing tiers
- Term discounts (1-year vs 3-year)  
- Package feature differentiation
- Automatic discount calculations

**Configuration Steps:**
1. Select the appropriate package tab (Easy/Easier/Easiest)
2. Configure base pricing for different employee counts
3. Set volume discount thresholds
4. Define term-based discounting

### 2. Seat Licensing Model
Flexible per-seat pricing for scalable organizations.

**Key Components:**
- Base seat pricing
- Minimum seat requirements
- Additional seat pricing
- Bulk seat discounts

### 3. Training Catalog Pricing
Individual course and certification pricing management.

### 4. Company Seat Management
Real-time monitoring and management of company allocations.

## Important Notes
⚠️ **Changes take effect immediately** - Always test with development accounts first
🔒 **Super Admin Only** - Only super admins can modify system-wide pricing
📊 **All changes are logged** - Audit trails track all pricing modifications

## Troubleshooting
- Pricing Calculator Not Updating: Clear cache and refresh
- Seat Allocation Errors: Check company settings and permissions
- Contact development team for technical issues',
    'Comprehensive guide for super administrators on managing all aspects of the pricing system.',
    (SELECT id FROM public.knowledge_base_categories WHERE name = 'Admin Documentation' LIMIT 1),
    '00000000-0000-0000-0000-000000000000',
    'published',
    true,
    'super-admin-pricing-management-guide',
    ARRAY['pricing', 'super-admin', 'system-management', 'configuration'],
    ARRAY['super_admin'],
    now()
);