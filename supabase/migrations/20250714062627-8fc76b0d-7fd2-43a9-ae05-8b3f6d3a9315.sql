-- Add role-based access control to knowledge base articles
-- First, add target_roles column to knowledge_base_articles
ALTER TABLE public.knowledge_base_articles 
ADD COLUMN target_roles text[] DEFAULT ARRAY['all']::text[];

-- Create an index for better query performance
CREATE INDEX idx_knowledge_base_articles_target_roles 
ON public.knowledge_base_articles USING GIN(target_roles);

-- Add a category for admin/super admin content if it doesn't exist
INSERT INTO public.knowledge_base_categories (name, description, color, icon, sort_order, is_active)
VALUES ('Admin Documentation', 'Administrative guides and system management documentation', '#dc2626', 'shield', 10, true)
ON CONFLICT (name) DO NOTHING;

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

## System Architecture

### 1. Package-Based Pricing (Easy/Easier/Easiest)
Traditional tiered pricing packages with volume and term discounts.

**Key Features:**
- Volume-based pricing tiers
- Term discounts (1-year vs 3-year)
- Package feature differentiation
- Automatic discount calculations

**Configuration Steps:**
1. Navigate to System → Pricing Management
2. Select the appropriate package tab (Easy/Easier/Easiest)
3. Configure base pricing for different employee counts
4. Set volume discount thresholds
5. Define term-based discounting

### 2. Seat Licensing Model
Flexible per-seat pricing for scalable organizations.

**Key Components:**
- Base seat pricing
- Minimum seat requirements
- Additional seat pricing
- Bulk seat discounts

**Configuration Process:**
1. Access the "Seat Licensing" tab
2. Set base price per seat
3. Configure minimum seat requirements
4. Define additional seat pricing tiers
5. Set up bulk discounts for large deployments

### 3. Training Catalog Pricing
Individual course and certification pricing management.

**Features:**
- Individual course pricing
- Bundle discounts
- Certification fees
- Custom pricing rules

### 4. Company Seat Management
Real-time monitoring and management of company allocations.

**Capabilities:**
- View current seat allocations
- Add seats to existing companies
- Monitor usage across all clients
- Generate allocation reports

## Pricing Matrix Structure

The system uses a three-tier pricing matrix:

1. **Course Packages**: Defines available training packages
2. **Pricing Tiers**: Sets employee count thresholds
3. **Pricing Matrix**: Maps packages to tiers with specific pricing

## Important Considerations

### Security & Access Control
- Only super admins can modify system-wide pricing
- All pricing changes are logged in audit trails
- Changes take effect immediately across the platform

### Testing Recommendations
1. Always test pricing changes with development accounts first
2. Use the pricing calculator to verify calculations
3. Review impact on existing client contracts
4. Document pricing change rationale

### Monitoring & Analytics
- Track pricing performance through analytics
- Monitor conversion rates by pricing tier
- Review customer feedback on pricing changes
- Analyze competitor pricing regularly

## Common Use Cases

### Adding a New Pricing Tier
1. Navigate to the appropriate tab
2. Click "Add New Tier"
3. Define employee count range
4. Set pricing for each package
5. Configure any special discounts
6. Save and test with calculator

### Updating Existing Pricing
1. Locate the pricing tier to modify
2. Update base pricing or discounts
3. Review impact on existing clients
4. Document the change reason
5. Notify affected stakeholders

### Managing Company Allocations
1. Go to "Company Management" tab
2. Search for specific company
3. View current seat usage
4. Add additional seats if needed
5. Update billing information

## Troubleshooting

### Common Issues
- **Pricing Calculator Not Updating**: Clear cache and refresh
- **Seat Allocation Errors**: Check company settings and permissions
- **Discount Not Applying**: Verify date ranges and qualification criteria

### Contact Information
For technical issues with pricing management, contact the development team through the internal support channel.

## Related Documentation
- [Company Management Guide]
- [Billing System Overview]
- [API Pricing Integration]
- [Customer Onboarding Process]

---
*Last Updated: System will auto-update this timestamp*
*Access Level: Super Admin Only*',
    'Comprehensive guide for super administrators on managing all aspects of the pricing system, including package pricing, seat licensing, and company allocations.',
    (SELECT id FROM public.knowledge_base_categories WHERE name = 'Admin Documentation' LIMIT 1),
    (SELECT id FROM auth.users WHERE email LIKE '%@easeworks.com' LIMIT 1),
    'published',
    true,
    'super-admin-pricing-management-guide',
    ARRAY['pricing', 'super-admin', 'system-management', 'configuration'],
    ARRAY['super_admin'],
    now()
);