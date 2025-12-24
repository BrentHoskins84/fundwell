# Griddo - Template Adaptation Plan

## Branding

**Name:** Griddo  
**Color Scheme:** Vibrant Orange  
**Primary:** `#F97316` | **Secondary:** `#D97706` | **Accent:** `#FBBF24` | **Background:** `#18181B`

---

## Base Template
**Repository:** [KolbySisk/next-supabase-stripe-starter](https://github.com/KolbySisk/next-supabase-stripe-starter)

---

## Template Structure Overview

```
next-supabase-stripe-starter/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx          # Landing page
│   │   │   └── pricing/
│   │   ├── (protected)/
│   │   │   └── account/
│   │   ├── api/
│   │   │   └── webhooks/         # Stripe webhooks
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                   # shadcn components
│   ├── features/
│   │   ├── auth/
│   │   ├── emails/
│   │   ├── pricing/
│   │   └── stripe/
│   └── libs/
│       ├── resend/
│       ├── stripe/
│       └── supabase/
├── supabase/
│   └── migrations/
├── public/
├── stripe-fixtures.json
└── package.json
```

---

## File-by-File Mapping

### 🟢 KEEP AS-IS (No Changes Needed)

These files work out of the box and require no modification:

| File/Folder | Purpose | Notes |
|-------------|---------|-------|
| `src/libs/supabase/` | Supabase client setup | Browser, server, admin clients |
| `src/libs/resend/` | Resend email client | Already configured |
| `src/libs/stripe/` | Stripe client setup | Keep for subscriptions |
| `src/components/ui/` | shadcn/ui components | Add more as needed |
| `src/features/auth/` | Auth utilities | Sign in/out, session handling |
| `src/app/(auth)/login/` | Login page | Works as-is |
| `src/app/(auth)/signup/` | Signup page | Works as-is |
| `src/app/api/webhooks/` | Stripe webhook handler | Keep for subscription sync |
| `supabase/migrations/` | Base migration files | We'll add our own |
| `.env.local.example` | Env template | Add our new vars |
| `tailwind.config.ts` | Tailwind config | May tweak colors |
| `components.json` | shadcn config | Works as-is |
| `tsconfig.json` | TypeScript config | Works as-is |
| `next.config.js` | Next.js config | May add image domains |

---

### 🟡 MODIFY (Adapt to Our Needs)

These files need customization:

#### `src/app/(marketing)/page.tsx` → Landing Page
**Current:** Generic SaaS landing page
**Change to:** Super Bowl Squares specific
- Hero: "Host Your Super Bowl Squares Fundraiser"
- How it works section (3 steps)
- Features grid
- Testimonials (if any)
- CTA to create contest

#### `src/app/(marketing)/pricing/page.tsx` → Pricing Page
**Current:** Generic tier display
**Change to:** Our specific tiers
- Free: 1 contest, ads shown
- Pro ($9.99/yr): Unlimited contests, no ads
- Org ($29.99/yr): Multi-admin (future)

#### `src/app/(protected)/account/page.tsx` → Account Page
**Current:** Basic account info + subscription
**Change to:** 
- Account settings
- Subscription management (keep)
- Add link to dashboard

#### `src/features/pricing/` → Pricing Logic
**Current:** Generic product metadata
**Change to:**
- Our tier-specific metadata
- Contest limit checks
- Feature flags per tier

#### `src/features/emails/` → Email Templates
**Current:** Welcome email example
**Change to:**
- Square claim confirmation
- Payment confirmed
- Winner notification
- Contest complete summary

#### `stripe-fixtures.json` → Product Config
**Current:** Example products
**Change to:**
```json
{
  "products": [
    {
      "name": "Pro",
      "metadata": {
        "tier": "pro",
        "contest_limit": "unlimited",
        "ads_free": "true"
      }
    },
    {
      "name": "Organization", 
      "metadata": {
        "tier": "org",
        "contest_limit": "unlimited",
        "ads_free": "true",
        "multi_admin": "true"
      }
    }
  ]
}
```

#### `src/app/layout.tsx` → Root Layout
**Current:** Basic layout
**Change to:**
- Add TanStack Query provider
- Add Sentry error boundary
- Update metadata/SEO

#### `supabase/migrations/` → Database Schema
**Current:** Users, products, prices, subscriptions
**Keep:** All existing tables (for Stripe sync)
**Add:** New migration file with our tables (see below)

---

### 🔴 ADD NEW (Build From Scratch)

These are new files/features we need to create:

#### New Route Structure

```
src/app/
├── (marketing)/
│   ├── page.tsx                    # Landing (modify)
│   ├── pricing/page.tsx            # Pricing (modify)
│   └── browse/page.tsx             # NEW: Public contests directory
├── (auth)/
│   ├── login/page.tsx              # Keep
│   └── signup/page.tsx             # Keep
├── (protected)/
│   ├── account/page.tsx            # Modify
│   └── dashboard/
│       ├── page.tsx                # NEW: Contest list
│       ├── new/page.tsx            # NEW: Create contest wizard
│       ├── [contestId]/
│       │   ├── page.tsx            # NEW: Contest overview
│       │   ├── grid/page.tsx       # NEW: Manage grid
│       │   ├── participants/page.tsx # NEW: Participant list
│       │   ├── scores/page.tsx     # NEW: Enter scores
│       │   └── settings/page.tsx   # NEW: Contest settings
│       └── billing/page.tsx        # NEW: Subscription management
├── c/
│   └── [slug]/page.tsx             # NEW: Public contest page
├── join/
│   └── [code]/page.tsx             # NEW: Contest code redirect
└── api/
    ├── webhooks/route.ts           # Keep (Stripe)
    └── contests/                   # NEW: Contest API routes
        ├── route.ts                # Create contest
        └── [contestId]/
            ├── route.ts            # Get/update contest
            ├── squares/route.ts    # Claim squares
            └── scores/route.ts     # Enter scores
```

#### New Feature Folders

```
src/features/
├── auth/                           # Keep
├── emails/                         # Modify
├── pricing/                        # Modify
├── stripe/                         # Keep
└── contests/                       # NEW
    ├── actions/
    │   ├── create-contest.ts
    │   ├── update-contest.ts
    │   ├── delete-contest.ts
    │   ├── claim-square.ts
    │   ├── release-square.ts
    │   ├── mark-paid.ts
    │   ├── enter-scores.ts
    │   └── generate-numbers.ts
    ├── components/
    │   ├── contest-card.tsx
    │   ├── contest-hero.tsx
    │   ├── grid.tsx
    │   ├── square.tsx
    │   ├── claim-modal.tsx
    │   ├── payment-options.tsx
    │   ├── score-board.tsx
    │   ├── qr-code.tsx
    │   ├── participant-table.tsx
    │   └── number-entry.tsx
    ├── hooks/
    │   ├── use-contest.ts
    │   ├── use-squares.ts
    │   ├── use-realtime-squares.ts
    │   └── use-scores.ts
    ├── models/
    │   ├── contest.ts              # Zod schemas
    │   ├── square.ts
    │   ├── payment-option.ts
    │   └── score.ts
    ├── queries/
    │   ├── get-contest.ts
    │   ├── get-contests.ts
    │   ├── get-squares.ts
    │   └── get-participants.ts
    └── utils/
        ├── generate-code.ts
        ├── generate-slug.ts
        ├── calculate-winner.ts
        └── calculate-payout.ts
```

#### New Components

```
src/components/
├── ui/                             # shadcn (keep)
├── layout/
│   ├── header.tsx                  # NEW: Site header
│   ├── footer.tsx                  # NEW: Site footer
│   ├── dashboard-nav.tsx           # NEW: Dashboard sidebar
│   └── dashboard-header.tsx        # NEW: Dashboard top bar
├── shared/
│   ├── logo.tsx                    # NEW
│   ├── loading-spinner.tsx         # NEW
│   ├── empty-state.tsx             # NEW
│   ├── error-boundary.tsx          # NEW
│   └── share-buttons.tsx           # NEW
└── forms/
    ├── contest-form.tsx            # NEW: Create/edit contest
    ├── claim-form.tsx              # NEW: Claim square form
    ├── score-form.tsx              # NEW: Enter scores
    └── payment-option-form.tsx     # NEW: Add payment method
```

---

## New Database Migration

Create file: `supabase/migrations/[timestamp]_add_contests.sql`

```sql
-- =============================================
-- SUPER BOWL SQUARES TABLES
-- =============================================

-- Contest status enum
CREATE TYPE contest_status AS ENUM (
  'draft',
  'open', 
  'locked',
  'in_progress',
  'completed'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
  'available',
  'pending',
  'paid'
);

-- Payment option type enum
CREATE TYPE payment_option_type AS ENUM (
  'venmo',
  'paypal',
  'cashapp',
  'zelle',
  'other'
);

-- Quarter enum
CREATE TYPE game_quarter AS ENUM (
  'q1',
  'q2',
  'q3',
  'final'
);

-- =============================================
-- CONTESTS TABLE
-- =============================================
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Identification
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  status contest_status DEFAULT 'draft' NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  
  -- Branding
  hero_image_url TEXT,
  org_image_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  
  -- Game settings
  square_price DECIMAL(10,2) NOT NULL,
  max_squares_per_person INTEGER,
  row_team_name TEXT NOT NULL,
  col_team_name TEXT NOT NULL,
  row_numbers INTEGER[],
  col_numbers INTEGER[],
  numbers_auto_generated BOOLEAN DEFAULT false,
  
  -- Payouts
  payout_q1_percent INTEGER DEFAULT 20,
  payout_q2_percent INTEGER DEFAULT 20,
  payout_q3_percent INTEGER DEFAULT 20,
  payout_final_percent INTEGER DEFAULT 40,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- SQUARES TABLE
-- =============================================
CREATE TABLE squares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  
  -- Position
  row_index INTEGER NOT NULL CHECK (row_index >= 0 AND row_index <= 9),
  col_index INTEGER NOT NULL CHECK (col_index >= 0 AND col_index <= 9),
  
  -- Claimant info
  claimant_first_name TEXT,
  claimant_last_name TEXT,
  claimant_email TEXT,
  claimant_venmo TEXT,
  
  -- Status
  payment_status payment_status DEFAULT 'available' NOT NULL,
  claimed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Unique constraint
  UNIQUE(contest_id, row_index, col_index)
);

-- =============================================
-- PAYMENT OPTIONS TABLE
-- =============================================
CREATE TABLE payment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  
  type payment_option_type NOT NULL,
  handle_or_link TEXT NOT NULL,
  display_name TEXT,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- SCORES TABLE
-- =============================================
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  
  quarter game_quarter NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  winning_square_id UUID REFERENCES squares(id),
  
  entered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(contest_id, quarter)
);

-- =============================================
-- EMAIL LOG TABLE
-- =============================================
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  square_id UUID REFERENCES squares(id) ON DELETE SET NULL,
  
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  resend_id TEXT,
  status TEXT DEFAULT 'sent',
  
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Contests policies
CREATE POLICY "Users can view their own contests"
  ON contests FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public contests"
  ON contests FOR SELECT
  USING (is_public = true AND status != 'draft');

CREATE POLICY "Users can create contests"
  ON contests FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own contests"
  ON contests FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own contests"
  ON contests FOR DELETE
  USING (auth.uid() = owner_id);

-- Squares policies (anyone can view, claim if available)
CREATE POLICY "Anyone can view squares"
  ON squares FOR SELECT
  USING (true);

CREATE POLICY "Anyone can claim available squares"
  ON squares FOR UPDATE
  USING (payment_status = 'available')
  WITH CHECK (payment_status = 'pending');

CREATE POLICY "Contest owners can manage all squares"
  ON squares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = squares.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- Payment options policies
CREATE POLICY "Anyone can view payment options"
  ON payment_options FOR SELECT
  USING (true);

CREATE POLICY "Contest owners can manage payment options"
  ON payment_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = payment_options.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- Scores policies
CREATE POLICY "Anyone can view scores"
  ON scores FOR SELECT
  USING (true);

CREATE POLICY "Contest owners can manage scores"
  ON scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = scores.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- Email logs policies (owner only)
CREATE POLICY "Contest owners can view email logs"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = email_logs.contest_id 
      AND contests.owner_id = auth.uid()
    )
  );

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_contests_owner ON contests(owner_id);
CREATE INDEX idx_contests_code ON contests(code);
CREATE INDEX idx_contests_slug ON contests(slug);
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_squares_contest ON squares(contest_id);
CREATE INDEX idx_squares_status ON squares(payment_status);
CREATE INDEX idx_payment_options_contest ON payment_options(contest_id);
CREATE INDEX idx_scores_contest ON scores(contest_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Initialize 100 squares when contest is created
CREATE OR REPLACE FUNCTION initialize_squares()
RETURNS TRIGGER AS $$
BEGIN
  FOR r IN 0..9 LOOP
    FOR c IN 0..9 LOOP
      INSERT INTO squares (contest_id, row_index, col_index)
      VALUES (NEW.id, r, c);
    END LOOP;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_contest_squares
  AFTER INSERT ON contests
  FOR EACH ROW
  EXECUTE FUNCTION initialize_squares();

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE squares;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
```

---

## New Dependencies to Add

```json
{
  "dependencies": {
    // Already in template
    "@supabase/supabase-js": "^2.x",
    "@stripe/stripe-js": "^2.x",
    "stripe": "^14.x",
    "resend": "^2.x",
    "tailwindcss": "^3.x",
    
    // ADD THESE
    "@tanstack/react-query": "^5.x",
    "@sentry/nextjs": "^7.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "qrcode.react": "^3.x",
    "date-fns": "^3.x",
    "slugify": "^1.x",
    "nanoid": "^5.x"
  }
}
```

---

## Tailwind Config (Color Customization)

Update `tailwind.config.ts` to add Griddo brand colors:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  // ... existing config
  theme: {
    extend: {
      colors: {
        // Griddo brand colors
        griddo: {
          primary: '#F97316',    // Orange
          secondary: '#D97706',  // Amber
          accent: '#FBBF24',     // Yellow
          background: '#18181B', // Zinc-900
          surface: '#27272A',    // Zinc-800
          border: '#3F3F46',     // Zinc-700
          text: '#FAFAFA',       // Zinc-50
          muted: '#A1A1AA',      // Zinc-400
        },
      },
      backgroundImage: {
        'griddo-gradient': 'linear-gradient(135deg, #F97316 0%, #D97706 100%)',
        'griddo-glow': 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
```

Usage in components:
```tsx
// Background
<div className="bg-griddo-background">

// Primary button
<button className="bg-griddo-primary hover:bg-griddo-secondary">

// Gradient header
<header className="bg-griddo-gradient">

// Text
<p className="text-griddo-text">
<span className="text-griddo-muted">

// Cards/surfaces
<div className="bg-griddo-surface border border-griddo-border">
```

---

## Environment Variables to Add

```env
# Existing (from template)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_PASSWORD=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=

# ADD THESE
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Griddo"
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## Implementation Order

### Phase 1: Setup & Foundation (Week 1)

1. **Day 1-2: Project Setup**
   - [ ] Clone template
   - [ ] Install new dependencies
   - [ ] Configure Sentry
   - [ ] Set up TanStack Query provider
   - [ ] Update environment variables
   - [ ] Run existing migrations

2. **Day 3-4: Database**
   - [ ] Create contests migration
   - [ ] Run migration locally
   - [ ] Generate TypeScript types
   - [ ] Test RLS policies

3. **Day 5: Layout & Navigation**
   - [ ] Create dashboard layout
   - [ ] Create dashboard nav component
   - [ ] Update header/footer
   - [ ] Add protected route wrapper

### Phase 2: Core Contest Features (Week 2)

4. **Day 1-2: Contest CRUD**
   - [ ] Create contest form (Zod + RHF)
   - [ ] Create contest action
   - [ ] Contest list page
   - [ ] Contest detail page
   - [ ] Generate code/slug utilities

5. **Day 3-4: Image Upload**
   - [ ] Set up Supabase Storage bucket
   - [ ] Create upload component
   - [ ] Hero image upload
   - [ ] Org logo upload

6. **Day 5: Payment Options**
   - [ ] Payment option form
   - [ ] Add/edit/delete payment options
   - [ ] Display on contest page

### Phase 3: Grid & Claiming (Week 3)

7. **Day 1-2: Grid Component**
   - [ ] Build 10x10 grid
   - [ ] Square component with states
   - [ ] Color coding (available/pending/paid)
   - [ ] Responsive design

8. **Day 3-4: Claiming Flow**
   - [ ] Claim modal with form
   - [ ] Claim square action
   - [ ] Validation (max per person)
   - [ ] Confirmation email

9. **Day 5: Real-time**
   - [ ] Set up Supabase Realtime subscription
   - [ ] Update grid on square claims
   - [ ] Optimistic updates
   - [ ] Handle race conditions

### Phase 4: Manager Features (Week 4)

10. **Day 1-2: Participant Management**
    - [ ] Participant table component
    - [ ] Mark paid action
    - [ ] Release square action
    - [ ] Export to CSV

11. **Day 3: Numbers**
    - [ ] Manual number entry form
    - [ ] Auto-generate numbers function
    - [ ] Display numbers on grid

12. **Day 4-5: Scores & Winners**
    - [ ] Score entry form
    - [ ] Calculate winner function
    - [ ] Highlight winning squares
    - [ ] Winner notification emails

### Phase 5: Public & Sharing (Week 5)

13. **Day 1-2: Public Contest Page**
    - [ ] Contest hero component
    - [ ] Public grid view
    - [ ] Payment instructions display
    - [ ] Contest code lookup (/join/[code])

14. **Day 3: Sharing**
    - [ ] QR code generation
    - [ ] Copy link button
    - [ ] Share to social (optional)

15. **Day 4-5: Polish**
    - [ ] Loading states
    - [ ] Error handling
    - [ ] Empty states
    - [ ] Mobile responsiveness pass
    - [ ] SEO/meta tags

### Phase 6: Monetization (Week 6)

16. **Day 1-2: Tier Enforcement**
    - [ ] Check contest count on create
    - [ ] Upgrade prompts
    - [ ] Early adopter flag

17. **Day 3-4: Stripe Integration**
    - [ ] Update stripe-fixtures.json
    - [ ] Subscription checkout flow
    - [ ] Customer portal link
    - [ ] Webhook handling (already done)

18. **Day 5: Ads (Optional)**
    - [ ] Ad component wrapper
    - [ ] Placement in free tier
    - [ ] Hide for Pro/Org

---

## Quick Start Commands

```bash
# 1. Clone the template
git clone https://github.com/KolbySisk/next-supabase-stripe-starter.git griddo
cd griddo

# 2. Install dependencies
bun install

# 3. Add new dependencies
bun add @tanstack/react-query @sentry/nextjs react-hook-form @hookform/resolvers zod qrcode.react date-fns slugify nanoid

# 4. Copy env file
cp .env.local.example .env.local
# Edit .env.local with your values

# 5. Start Supabase locally
bun run supabase:start

# 6. Run migrations
bun run migration:up

# 7. Start dev server
bun run dev
```

---

## Files to Delete (Cleanup)

After adaptation, remove these template-specific files:

```
delete-me/                    # Template demo assets
public/demo-images/           # If any demo images
src/app/(marketing)/demo/     # If any demo pages
```

---

## Notes

- Keep all Stripe subscription logic - we'll use it for Pro/Org tiers
- The template uses `bun` as package manager - can switch to `pnpm` if preferred
- Feature-based file structure aligns with our plan
- Supabase migrations are already set up - just add our new migration file
- RLS policies in template are good examples for our own policies
