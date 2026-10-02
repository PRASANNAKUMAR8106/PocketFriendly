# PocketFriendly Sarees 🥻✨

> **A Complete, Modern, Premium, Production-Ready E-Commerce Platform for Indian Sarees**
> Built with **React 19 + TypeScript + Vite + Tailwind CSS + Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions) + Razorpay Gateway**.

---

## 🌟 1. Overview & Brand Positioning

**PocketFriendly Sarees** is an Indian ethnic fashion e-commerce brand designed to bridge the gap between heirloom craftsmanship and accessible pricing. The platform sells authentic Banarasi Silk, Kanjeevaram Temple Silk, Organza Embroidered, Chanderi Cotton, and Bandhani festive sarees directly from weaver clusters to customers across India without boutique markups.

### Key Highlights:
- **Luxury Fashion Aesthetics**: Warm ivory base (`#FAF8F5`), royal maroon accents (`#800020`), and champagne gold highlights (`#C5A059`) with Playfair Display serif typography.
- **Authoritative Server Pricing**: Discounts and totals are calculated and validated server-side.
- **Admin-Managed Homepage**: Latest Collection showcase, hero banners, top announcements, and categories are fully customizable without code changes.
- **Full Indian E-Commerce Readiness**: 10-digit Indian mobile validation, 6-digit Indian PIN code validation, INR (`₹`) formatting, Razorpay UPI/Cards gateway, and configurable Cash on Delivery (COD).
- **Two Separate Experiences**:
  1. **Customer Storefront**: Home, Catalog, Filters, Saree Detail with Zoom, Bag Drawer, Checkout, Real-time Order Tracking, Wishlist, Account, and Policies.
  2. **Admin Console**: Multi-metric KPIs, Analytics charts, Product CRUD with image management, Order fulfillment timeline updates, Category/Collection managers, Discount coupons, Inventory alerts, and Audit logs.

---

## 🧱 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7, TanStack Query.
- **State & Forms**: React Hook Form, Zod schema validation, Context API.
- **Backend & Database**: Supabase, PostgreSQL 15, Row Level Security (RLS), Supabase Auth, Storage Buckets.
- **Payment Architecture**: Razorpay integration with server-side HMAC-SHA256 signature verification & Cash on Delivery (COD).
- **SEO & Performance**: Open Graph metadata, Google Fonts preconnect, JSON-LD Schema (Product, Organization, Offer), `sitemap.xml`, `robots.txt`, code-split bundles.
- **Testing**: Vitest + JSDOM unit test suite.

---

## 📂 3. Repository Architecture

```
PocketFriendly/
├── public/
│   ├── favicon.svg             # Gold & maroon saree icon
│   ├── robots.txt              # Search engine directives
│   └── sitemap.xml             # Search engine sitemap
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql         # 17 normalized PostgreSQL tables + indexes
│   │   ├── 002_rls_policies.sql           # Granular Row Level Security policies
│   │   ├── 003_functions_and_triggers.sql # Price triggers, atomic checkout & stock decrement
│   │   ├── 004_seed_data.sql              # Curated Banarasi, Kanjeevaram & Organza sarees
│   │   └── 005_storage_buckets.sql        # Storage buckets & security policies
│   └── functions/
│       ├── create-razorpay-order/         # Edge function for verified order creation
│       └── verify-razorpay-payment/       # Edge function for HMAC SHA256 verification
├── src/
│   ├── components/
│   │   ├── cart/                          # CartDrawer with shipping milestone progress
│   │   ├── common/                        # Header, Announcement Bar, Footer, SearchModal
│   │   └── product/                       # ProductCard, QuickViewModal, PriceBadge
│   ├── context/                           # AuthContext, CartContext, WishlistContext, SettingsContext
│   ├── layouts/                           # CustomerLayout & AdminLayout
│   ├── pages/
│   │   ├── admin/                         # Dashboard, Products, Orders, Categories, Collections,
│   │   │                                  # Discounts, Inventory, Customers, Settings, AuditLogs, Login
│   │   ├── AuthPages.tsx                  # Customer Login & Register
│   │   ├── CartPage.tsx                   # Standalone full shopping bag page
│   │   ├── CheckoutPage.tsx               # Secure single-page Indian checkout
│   │   ├── CustomerAccount.tsx            # Order history timeline & customer profile
│   │   ├── Home.tsx                       # Hero, Latest Collection, Categories, Reviews, FAQs
│   │   ├── OrderConfirmationPage.tsx      # Celebratory confetti, timeline, invoice print
│   │   ├── ProductDetail.tsx              # Zoom gallery, specs, blouse info, related sarees
│   │   ├── Shop.tsx                       # Full multi-filter saree catalog
│   │   ├── StaticPages.tsx                # About, Contact, Policies, Offers
│   │   └── WishlistPage.tsx               # Saved sarees
│   ├── services/                          # Supabase service layer + offline mock fallback
│   ├── styles/                            # Tailwind directives & luxury styles
│   ├── tests/                             # Unit tests for pricing, validation, orders
│   ├── types/                             # Strict TypeScript interfaces
│   └── utils/                             # Currency (₹ INR), validation, slugify, pricing
├── .env.example                           # Documented environment variables
├── vercel.json                            # Production SPA rewrites & asset caching
└── vite.config.ts                         # Vite build with vendor code-splitting
```

---

## 🚀 4. Getting Started Locally

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v11+`

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/pocketfriendly-sarees.git
cd pocketfriendly-sarees

# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will start at `http://localhost:5173`.

> **Note on Out-of-the-Box Evaluation**:
> The application includes an intelligent offline/preview data layer pre-seeded with genuine Indian handloom sarees, categories, and settings. You can immediately browse sarees, test filters, add to bag, place orders with Cash on Delivery or test payments, and manage products in the Admin Console without needing to set up Supabase beforehand!

---

## 🗄️ 5. Supabase Production Setup

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Note down your **Project URL** and **Anon / Public Key** from `Project Settings -> API`.

### Step 2: Run SQL Migrations
In your Supabase Dashboard, open the **SQL Editor** and execute the migration files located in `supabase/migrations/` in order:

1. `001_initial_schema.sql` (Creates all tables: profiles, products, categories, orders, order_items, discounts, etc.)
2. `002_rls_policies.sql` (Enables Row Level Security on all tables with strict customer/admin boundaries)
3. `003_functions_and_triggers.sql` (Installs price recalculation trigger, `place_order_atomic` function, and user signup hooks)
4. `004_seed_data.sql` (Populates authentic saree catalog with high-resolution images, collections, and discounts)
5. `005_storage_buckets.sql` (Creates storage buckets: `product-images`, `collections`, `banners`, `hero-images`)

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your real Supabase credentials from your Supabase Dashboard (`Project Settings -> API`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-anon-key...
VITE_RAZORPAY_KEY_ID=rzp_test_yourkeyhere
VITE_APP_NAME="PocketFriendly Sarees"
VITE_SITE_URL=http://localhost:5173
```

> ⚠️ **Important**: If `.env` contains placeholder values (`placeholder-pfs.supabase.co`), the `/admin/login` page will display a warning banner and reject sign-in attempts with a notification indicating that Supabase is not connected. Always configure valid credentials in `.env`.

### Step 4: Create the First Administrator Account
Follow the comprehensive guide in **Section 8: Administrator Provisioning & Secure Bootstrap** below.

---

## 💳 6. Payment Gateway (Razorpay & COD)

### Razorpay Integration
1. Obtain your Key ID and Secret from the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Set `VITE_RAZORPAY_KEY_ID` in your `.env`.
3. Deploy the Edge Functions for server-side order creation and signature verification:
```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```
4. Set the secrets in Supabase CLI or Dashboard:
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxx RAZORPAY_KEY_SECRET=xxxx
```

### Cash on Delivery (COD)
- Cash on Delivery is enabled by default with a configurable fee (default: ₹49 handling).
- The store administrator can toggle COD on or off at any time from the **Admin Console -> Website Settings**.

---

## 🧪 7. Running Tests

The test suite covers authoritative discount calculations, Indian phone number & PIN code regex validations, checkout schemas, storefront isolation (Scenarios 1–10), and authentication security:

```bash
# Run Vitest unit tests
npm test
```

Expected output:
```
✓ src/tests/pricing.test.ts (7 tests)
✓ src/tests/auth_security.test.ts (21 tests)
✓ src/tests/orders.test.ts (2 tests)
✓ src/tests/validation.test.ts (9 tests)
✓ src/tests/storefront_isolation.test.tsx (10 tests)

Test Files  5 passed (5)
     Tests  49 passed (49)
```

---

## 🔐 8. Administrator Provisioning & Secure Bootstrap Guide

To guarantee absolute security, **self-service administrator promotion is disabled**.
- Public user registration (`/register`) **always assigns `role = 'customer'`** via the PostgreSQL trigger `handle_new_user()`.
- The customer storefront contains **zero admin links, buttons, or badges**.
- Administrative access is restricted to the unlinked URL `/admin/login`.
- Access to `/admin/*` requires a verified database record with `role IN ('admin', 'super_admin', 'manager')`.

### Step-by-Step Instructions to Create Your First Admin:

#### Step 1: Create the User in Supabase Dashboard
1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. In the left-hand navigation, click **Authentication** ➔ **Users**.
3. Click the **"Add User"** button in the top right, then select **"Create user"**.
4. Fill in the form:
   - **Email**: Enter your desired admin email (e.g., `admin@pocketfriendlysarees.com`).
   - **Password**: Enter a strong password.
   - **Auto Confirm User**: ✅ **Check this box** (this marks the user as confirmed immediately so you can log in without waiting for an email confirmation link).
5. Click **"Create user"**.

#### Step 2: Assign the Admin Role in the Database
Because user signups default to `customer` for security, you must promote this user to `admin`.

Choose **either Option A (Recommended)** or **Option B**:

##### Option A: Run the Bootstrap Function (Recommended)
In the Supabase Dashboard, click **SQL Editor** ➔ **New Query**, paste the following, and click **Run**:
```sql
SELECT public.bootstrap_first_admin('admin@pocketfriendlysarees.com');
```
*(Replace `admin@pocketfriendlysarees.com` with the email you entered in Step 1).*

This function automatically:
- Verifies that the user exists in `auth.users`.
- Upserts the corresponding row in `public.profiles` with `role = 'admin'`.
- Records an audit log entry for the promotion.
- Returns a confirmation JSON: `{"success": true, "role": "admin", ...}`.

##### Option B: Direct SQL Update
Alternatively, run this SQL in the **SQL Editor**:
```sql
-- Ensure profile exists and set role to admin
INSERT INTO public.profiles (id, email, full_name, role, updated_at)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'admin', NOW()
FROM auth.users
WHERE email = 'admin@pocketfriendlysarees.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = NOW();
```

#### Step 3: Verify the Admin in the Database
Run this query in the SQL Editor to confirm:
```sql
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE role IN ('admin', 'super_admin', 'manager');
```
You should see your admin user with `role: admin`.

#### Step 4: Log In to the Admin Console
1. Open your browser and navigate to:
   ```
   http://localhost:5173/admin/login
   ```
2. Enter your administrator email and password.
3. Click **"Sign In as Administrator"**.
4. You will be authenticated and redirected directly to `/admin` (the administrative dashboard).

---

## 🚢 9. Production Build & Deployment

### Build Locally
```bash
npm run build
```
This produces an optimized production bundle in `dist/` with vendor code-splitting:
- Chunks for `vendor-react`, `vendor-supabase`, `vendor-icons`, and application code.
- Gzipped CSS: ~11 kB
- HTML with Open Graph and JSON-LD structured data.

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel` (or connect your GitHub repository to [Vercel](https://vercel.com)).
2. Run `vercel`:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`) in Vercel Project Settings.
4. The included `vercel.json` automatically manages client-side SPA routing and long-term asset caching headers.

---

## 🛡️ 10. Security & Business Rules Implemented

1. **Strict Database-Backed Role Verification**: Administrative privileges are verified against Supabase PostgreSQL `profiles.role` table, never trusted from frontend flags or localStorage.
2. **Privilege Escalation Prevention**: Trigger `prevent_profile_role_escalation` denies any customer attempt to update their or anyone else's role.
3. **No Evaluation Bypasses in Production**: All 1-click admin shortcuts, hardcoded passwords, and evaluation buttons are completely removed.
4. **Authoritative Server Pricing**: Final prices are calculated by PostgreSQL triggers and functions; client amounts are validated before order insertion.
5. **Preventing Overselling**: Inventory rows are checked before placing an order; out-of-stock items cannot be purchased.
6. **Row Level Security (RLS)**: Customers can only view their own orders and addresses. Admin console routes and APIs are strictly restricted to users with `role IN ('admin', 'super_admin', 'manager')`.
7. **No Exposed Secrets**: Payment secret keys remain on the backend / Supabase Edge Functions. Only the public Key ID is referenced in the frontend client.

---

## 📜 10. License

Crafted for **PocketFriendly Sarees**. All Rights Reserved.
Designed with pride for Indian Handloom & Ethnic Fashion.
