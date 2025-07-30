-- Create the Marketing IQ training knowledge base entry
INSERT INTO public.knowledge_base_articles (
  title,
  content,
  excerpt,
  author_id,
  status,
  featured,
  slug,
  tags,
  target_roles,
  published_at
) VALUES (
  'Marketing IQ – User Training SOP',
  '# 🎯 Overview

This guide provides step-by-step instructions for using the **Marketing IQ** system to launch and manage marketing campaigns, track performance, and manage leads.

---

## 🧭 Modules Covered

1. Marketing Dashboard  
2. Email Templates  
3. Email Campaigns  
4. Lead Management  
5. Marketing Automation *(UI only – backend coming soon)*  
6. Social Media  
7. Email Analytics

---

## 📋 Step-by-Step Training

### 1. **Launch a Campaign**
- Go to **Email Campaigns**
- Click **Create Campaign**
- Select:
  - Subject Line  
  - Audience (filtered via Lead Management)
  - Email Template  
- Click **Send with Mailchimp**
- Status will update automatically

### 2. **Manage Email Templates**
- Go to **Email Templates**
- Click **New Template**
- Add:
  - Name  
  - Subject  
  - Body (HTML or Rich Text)
- Save and reuse for future campaigns

### 3. **View Leads & Segments**
- Go to **Lead Management**
- Filter by tags, score, or date added
- Export or push selected leads to Mailchimp audience
- Leads synced from HubSpot are automatically tagged

### 4. **Track Campaign Results**
- Go to **Email Analytics**
- View:
  - Open rate
  - Click-through rate
  - Bounce/unsubscribe stats
- Drill down by campaign, template, or date range

### 5. **View Your Marketing Dashboard**
- Go to **Marketing Dashboard**
- View KPIs:
  - Total Campaigns Sent  
  - Top Performing Templates  
  - Audience Growth  
  - Lead Conversion Trends

---

## 🧠 Tips & Notes

- All campaigns are synced with Mailchimp
- Email Templates are shared across campaigns
- Leads are linked to Companies and Contacts in CRM
- Only Super Admins can modify automation workflows (once backend is active)

---

## 🚧 Coming Soon
- Marketing Automation Engine  
- Social Media API Integration  
- AI-Driven Campaign Suggestions  

---

**Last Updated:** ' || CURRENT_DATE || '  
**Document Version:** 1.0',
  'Step-by-step instructions for using the Marketing IQ system to launch and manage marketing campaigns, track performance, and manage leads.',
  auth.uid(),
  'published',
  true,
  'marketing-iq-user-training-sop',
  ARRAY['Training', 'Marketing', 'Company Admin Tools', 'Marketing IQ'],
  ARRAY['company_admin', 'super_admin'],
  now()
);