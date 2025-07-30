# EaseLearn CRM System Architecture Documentation

## Executive Summary
Internal CRM system for HR risk assessment, training management, and sales pipeline tracking. Built for small teams (<5 employees) with role-based access control.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn UI** component library
- **React Router** for navigation
- **TanStack Query** for data fetching
- **React Hook Form** for form management

### Backend
- **Supabase** (PostgreSQL database + auth + APIs)
- **Row Level Security (RLS)** for data access control
- **Edge Functions** for server-side logic
- **Real-time subscriptions** for live updates

## System Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   Supabase API   │───▶│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Edge Functions  │────────────┘
                        │  (Server Logic)  │
                        └──────────────────┘
```

## User Roles & Permissions

### 1. Super Admin
- **Access**: Full system access
- **Capabilities**: 
  - Manage all companies, users, and data
  - Configure system settings
  - Access all CRM and LMS features
  - Manage pricing and billing

### 2. Company Admin
- **Access**: Company-specific data
- **Capabilities**:
  - Manage company employees and training
  - View company-specific reports
  - Configure company settings
  - Limited CRM access

### 3. Sales Rep
- **Access**: CRM-focused
- **Capabilities**:
  - Full CRM functionality (leads, deals, activities)
  - Email campaigns and automation
  - Sales analytics and reporting
  - Lead generation and conversion

### 4. Learner
- **Access**: Training-focused
- **Capabilities**:
  - Access assigned training modules
  - View personal certificates
  - Track learning progress

## Application Structure

### Core Modules

#### 1. Authentication System
- **Route**: `/auth`
- **Features**: Login, registration, password reset
- **Security**: Supabase Auth with RLS policies

#### 2. Admin Dashboard
- **Base Route**: `/admin`
- **Layout**: Sidebar navigation with role-based menu items
- **Components**: `AdminLayout`, `AdminSidebar`

#### 3. HR Risk Assessment
- **Routes**: 
  - `/admin` (dashboard)
  - `/admin/assessments`
  - `/admin/companies`
- **Features**: Risk scoring, AI-generated reports, company management

#### 4. CRM System
- **Base Route**: `/admin/crm`
- **Sub-modules**:
  - **Leads Management** (`/admin/crm/leads`)
  - **Deals Pipeline** (`/admin/crm/deals`)
  - **Activities Tracking** (`/admin/crm/activities`)
  - **Tasks Management** (`/admin/crm/tasks`)
  - **Email Templates** (`/admin/crm/email-templates`)
  - **Email Campaigns** (`/admin/crm/email-campaigns`)
  - **Analytics Dashboard** (`/admin/crm/analytics`)
  - **Automation Workflows** (`/admin/crm/automation`)
  - **Integrations Hub** (`/admin/crm/integrations`)
  - **Data Import/Export** (`/admin/crm/import-export`)

#### 5. Learning Management System (LMS)
- **Routes**:
  - `/admin/training-modules`
  - `/admin/employees`
  - `/admin/certificates`
  - `/admin/renewals`
  - `/admin/lms-reports`
  - `/admin/bi-dashboard`
  - `/admin/my-learning` (learner view)

#### 6. Public Interfaces
- **Landing Page** (`/`)
- **Pricing Calculator** (`/pricing`)
- **HR Blueprint Generator** (`/hr-blueprint`)
- **FAQ System** (`/faq`)
- **Blog/Resources** (`/blog`, `/resources`)

## Database Schema Overview

### Core Tables

#### User Management
- `profiles` - User profile information
- `user_roles` - Role-based access control
- `company_settings` - Company configuration

#### HR Risk Assessment
- `assessments` - Risk assessment data
- `invitations` - Client invitation tracking

#### CRM Tables
- `leads` - Lead information and tracking
- `deals` - Sales pipeline management
- `deal_stages` - Deal progression stages
- `activities` - CRM activities and interactions
- `email_templates` - Email template management
- `email_campaigns` - Campaign tracking
- `automation_workflows` - Process automation

#### LMS Tables
- `training_modules` - Course content
- `training_scenes` - Individual learning scenes
- `employees` - Employee records
- `training_assignments` - Course assignments
- `training_completions` - Progress tracking
- `certificates` - Certification management
- `renewal_schedules` - Automatic renewals

#### Analytics & Reporting
- `analytics_reports` - Generated reports
- `sales_metrics` - Sales performance data
- `revenue_records` - Revenue tracking
- `search_index` - Global search functionality

## Key Features

### 1. Global Search
- **Component**: `GlobalSearch`
- **Functionality**: Search across leads, deals, activities, emails, tasks
- **Implementation**: Full-text search with highlighting

### 2. Role-Based Navigation
- **Component**: `AdminSidebar`
- **Functionality**: Dynamic menu based on user role
- **Security**: Menu items filtered by permissions

### 3. Data Import/Export
- **Component**: `DataImportExport`
- **Formats**: CSV, Excel
- **Features**: Bulk operations, error handling, progress tracking

### 4. Email Automation
- **Components**: `EmailCampaignsManager`, `AutomationWorkflows`
- **Features**: Template-based campaigns, workflow automation, tracking

### 5. Analytics Dashboard
- **Components**: `AnalyticsDashboard`, `AdminBI`
- **Features**: Real-time metrics, custom reports, data visualization

### 6. Training Management
- **Components**: `TrainingSceneManager`, `VimeoPlayer`
- **Features**: SCORM compliance, progress tracking, certificates

## Security Implementation

### Row Level Security (RLS)
- All database tables protected with RLS policies
- User access restricted based on role and company association
- Automatic data filtering at database level

### Authentication Flow
1. User authenticates via Supabase Auth
2. Profile created automatically on first login
3. Role assignment determines access permissions
4. RLS policies enforce data access rules

### API Security
- All API calls authenticated via Supabase client
- JWT tokens for session management
- Automatic token refresh handling

## Development Guidelines

### File Organization
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, forms, etc.)
│   ├── admin-bi/        # Business intelligence components
│   ├── assessment/      # Risk assessment components
│   └── [feature]/       # Feature-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── contexts/            # React context providers
├── integrations/        # External service integrations
└── utils/               # Utility functions
```

### Component Architecture
- **Atomic Design**: Base components in `ui/`, composed into features
- **Custom Hooks**: Data fetching and business logic abstraction
- **Context Providers**: Global state management (auth, theme)
- **Route Protection**: `ProtectedRoute` component for access control

### State Management
- **TanStack Query**: Server state and caching
- **React Context**: Global application state
- **Local State**: Component-specific state with React hooks

## Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel/Netlify (static hosting)
- **Build**: Vite production build
- **Environment**: Environment variables for API configuration

### Backend Services
- **Database**: Supabase hosted PostgreSQL
- **Authentication**: Supabase Auth service
- **APIs**: Auto-generated from database schema
- **Edge Functions**: Serverless functions for custom logic

## Integration Points

### External Services
- **Vimeo**: Video content delivery for training modules
- **OpenAI**: AI-powered report generation
- **Email Services**: Campaign delivery and tracking

### API Endpoints
- **Supabase REST API**: CRUD operations
- **Supabase Realtime**: Live data updates
- **Edge Functions**: Custom business logic

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Caching**: TanStack Query for data caching
- **Bundling**: Vite for optimized builds

### Database Optimization
- **Indexing**: Strategic indexes on frequently queried columns
- **RLS**: Efficient permission checking
- **Pagination**: Large datasets handled with pagination

## Monitoring & Maintenance

### Error Handling
- **Frontend**: Error boundaries and user-friendly error messages
- **Backend**: Supabase error logging and monitoring
- **Forms**: Comprehensive validation and error feedback

### Data Backup
- **Automatic**: Supabase handles database backups
- **Export Features**: Built-in data export capabilities
- **Migration**: Database migration system for schema changes

## Future Scalability

### Horizontal Scaling
- **Supabase**: Automatic scaling of database and APIs
- **CDN**: Static asset distribution
- **Caching**: Redis layer for high-traffic scenarios

### Feature Extensibility
- **Modular Architecture**: Easy addition of new modules
- **Plugin System**: Extensible integration framework
- **API-First**: External integrations through well-defined APIs

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Contact**: Internal Development Team  
**System Status**: Production Ready for Internal Use