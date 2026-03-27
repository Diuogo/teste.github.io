# NiceDrop Dashboard - Setup Guide

## 📋 Files Created

1. **dashboard.html** - Main dashboard page with multi-panel layout
2. **dashboard.css** - Complete styling with responsive design
3. **dashboard.js** - Supabase integration and business logic

## ⚙️ Setup Instructions

### 1. Configure Supabase Credentials

Open `dashboard.js` and update the credentials at the top:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

Replace:
- `your-project` - Your Supabase project name
- `your-anon-key` - Your Supabase anonymous key

**Find these in:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API → Project URL & anon key

### 2. Create Database Tables

Execute these SQL commands in your Supabase SQL editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('developer', 'owner', 'operator', 'client')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store members table
CREATE TABLE store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'operator')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);

-- Drones table
CREATE TABLE drones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
  total_flights INTEGER DEFAULT 0,
  total_distance DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  price DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### 3. Set Up Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Set redirect URL to your dashboard.html page

### 4. Create Test Data

As a developer, you can insert test data:

```sql
-- Insert a developer user (after creating user via Auth tab)
INSERT INTO profiles (id, email, role) VALUES (
  'user-id-here',
  'developer@nicedrop.com',
  'developer'
);

-- Insert a store
INSERT INTO stores (name, created_by) VALUES (
  'Porto Central',
  'user-id-here'
);

-- Insert drones
INSERT INTO drones (store_id, name, status, total_flights, total_distance) VALUES
  ('store-id', 'ND-001', 'active', 156, 450),
  ('store-id', 'ND-002', 'active', 98, 280),
  ('store-id', 'ND-003', 'inactive', 45, 120);
```

## 🎯 Features Implemented

### User Roles & Access

- **Developer** - See all stores, create stores, manage all members
- **Owner** - See only their stores, manage members within those stores
- **Operator** - Redirected (future operator app)
- **Client** - Redirected (future client app)

### Dashboard Features

✅ Multi-store navigation (sidebar)
✅ Store analytics (earnings, expenses, orders)
✅ Drone management grid
✅ Store members list
✅ Add/remove members
✅ Role-based UI visibility
✅ Modal dialogs
✅ Authentication check
✅ Responsive design

### Data Queries

All queries are filtered by `store_id` to ensure data isolation:

```javascript
// Example pattern used throughout
supabase
  .from('drones')
  .select('*')
  .eq('store_id', currentStoreId)
```

## 📱 URL Routes

- `/dashboard.html` - Main dashboard (requires auth & valid role)
- `/auth.html` - Login page
- `/index.html` - Landing page (redirected if not authenticated)

## 🔐 Security Notes

- Do NOT commit your Supabase credentials to version control
- Use environment variables in production
- Enable RLS policies for production
- Validate all user actions on the backend

## 🚀 Next Steps (Optional)

1. **Role Change Modal** - Allow developers to change member roles
2. **Create Store Modal** - Full store creation workflow
3. **Add Drone Modal** - Drone registration form
4. **Analytics Charts** - Visual data with Chart.js
5. **Member Invite System** - Email invitations
6. **Audit Logging** - Track all actions
7. **Dark Mode** - Theme toggle
8. **Export Data** - CSV/PDF reports

## 🐛 Troubleshooting

**"Erro ao carregar lojas"**
- Check Supabase credentials
- Ensure user has a profile in the profiles table
- Check RLS policies are properly configured

**"Utilizador não encontrado" when adding member**
- Verify the email exists in the system
- The email must match exactly (case-sensitive)

**Dashboard not loading**
- Check browser console for Supabase errors
- Verify auth session is valid
- Check network tab for failed requests

## 📧 Support

For issues with integration or questions about the dashboard system, refer to the code comments in `dashboard.js` which explain each major section.
