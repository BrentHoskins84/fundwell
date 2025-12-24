# Griddo - Project Plan

## Branding

**Name:** Griddo
**Tagline:** "Host your game day fundraiser"
**Domain:** griddo.io (or griddo.app - verify availability)

### Color Scheme (Vibrant Orange)

| Role | Color | Hex | Tailwind |
|------|-------|-----|----------|
| Primary | Orange | `#F97316` | `orange-500` |
| Secondary | Amber | `#D97706` | `amber-600` |
| Accent | Yellow | `#FBBF24` | `amber-400` |
| Background | Zinc | `#18181B` | `zinc-900` |
| Surface | Zinc | `#27272A` | `zinc-800` |
| Text | Zinc | `#FAFAFA` | `zinc-50` |
| Muted | Zinc | `#A1A1AA` | `zinc-400` |

### Logo Concept
- Simple wordmark "Griddo" with a subtle 3x3 grid icon
- Orange gradient on dark background
- Clean, modern sans-serif font (Inter or similar)

---

## Overview

A Next.js web application that allows organizations to host game day square fundraisers (Super Bowl, World Series, NBA Finals, etc.). Contest managers create branded contests, participants claim squares and pay via external payment links, and the platform tracks payments and announces winners.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime |
| Storage | Supabase Storage |
| Email | Resend |
| Payments | Stripe (subscriptions only, not square purchases) |
| Styling | Tailwind CSS |
| UI Components | Shadcn/ui |
| Forms | React Hook Form + Zod |
| Server State | TanStack Query |
| Error Tracking | Sentry |
| Hosting | Vercel |

---

## User Roles

### Contest Manager (Authenticated)
- Creates an account (email/password or Google OAuth)
- Creates and manages contests
- Configures branding, pricing, payouts
- Monitors square claims and payment status
- Enters numbers and scores
- Receives subscription tier benefits

### Participant (Unauthenticated)
- Accesses contest via URL, code, or QR
- Views grid in real-time
- Claims squares by entering contact info
- Sees payment instructions
- Receives email notifications

---

## Core Features

### Contest Creation & Configuration

**Branding**
- Hero image (Facebook-style banner)
- Organization logo (circular, overlapping hero in lower-left)
- Primary color
- Secondary color

**Game Settings**
- Contest name and description
- Square price (decimal, e.g., $10.00)
- Row team name (e.g., "Chiefs")
- Column team name (e.g., "Eagles")
- Max squares per person (optional, default: unlimited)
- Payout percentages (Q1, Q2, Q3, Final - must total 100% or less, remainder to org)

**Numbers**
- Manual entry (manager inputs 0-9 for rows and columns)
- Auto-generate (random shuffle of 0-9)
- Numbers revealed once entered (not before)

**Visibility**
- Public (discoverable in browse directory)
- Private (accessible only via direct link/code)

**Contest Code**
- Auto-generated random code (e.g., "A7X9K2")
- Manager can customize if desired
- Must be unique across platform

### Contest Status Flow

```
draft → open → locked → in_progress → completed
```

| Status | Description |
|--------|-------------|
| `draft` | Contest created but not accepting claims |
| `open` | Accepting square claims |
| `locked` | Grid full or manually locked, no more claims |
| `in_progress` | Game day, scores being entered |
| `completed` | All scores entered, winners announced |

### Square Claiming

**Process**
1. Participant views grid
2. Clicks available square
3. Modal/form appears requesting:
   - First name (required)
   - Last name (required)
   - Email (required)
   - Venmo handle (optional)
4. On submit:
   - Square marked as claimed (pending payment)
   - Confirmation email sent
   - Grid updates in real-time for all viewers

**Square States**
- `available` - No claimant
- `pending` - Claimed, awaiting payment confirmation
- `paid` - Payment confirmed by manager
- `released` - Manager released the square (becomes available)

**Selection UX**
- Single square selection (click to claim)
- Multi-select as enhancement if straightforward to implement

### Payment Management

**Payment Options (configured by manager)**
- Venmo (handle or link)
- PayPal (link)
- Cash App (handle)
- Zelle (email/phone)
- Other (custom label + instructions)

Each payment option can include:
- Type
- Handle or link
- Display name
- Optional instructions (e.g., "Put your name in the memo")

**Payment Tracking**
- Manager views participant list with payment status
- Manager can mark squares as "paid"
- Manager can release unpaid squares (returns to available)
- Paid timestamp recorded

### Scoring & Winners

**Score Entry**
- Manager manually enters scores for each quarter
- Fields: Home score (row team), Away score (column team)
- Quarters: Q1, Q2, Q3, Final

**Winner Calculation**
- Winner determined by last digit of each team's score
- Example: Chiefs 17, Eagles 24 → Row 7, Col 4
- System identifies winning square for each quarter
- Payout calculated: square_price × 100 × payout_percent

**Winner Notification**
- Email sent to winner with:
  - Quarter won
  - Score at time of win
  - Payout amount
  - Contact info to claim prize

### Email Notifications

**Triggered Emails**
| Event | Recipient | Content |
|-------|-----------|---------|
| Square claimed | Participant | Confirmation, payment instructions |
| Payment confirmed | Participant | Thank you, square details |
| Numbers revealed | All participants | Grid is set, good luck |
| Winner (per quarter) | Winner | Congratulations, payout details |
| Contest completed | All participants | Final results summary |

**Email Provider**: Resend
- Simple API
- Good deliverability
- Generous free tier

### QR Code

- Generated client-side (lighter, no server load)
- Displays contest URL
- Download button to save as image
- Useful for flyers, social media, printed materials

---

## Data Model

### User
```sql
id: uuid (PK)
email: text (unique)
name: text
avatar_url: text (nullable)
subscription_tier: enum ('free', 'pro', 'org') default 'free'
subscription_expires_at: timestamp (nullable)
stripe_customer_id: text (nullable)
is_early_adopter: boolean default false  -- grandfathered users
created_at: timestamp
updated_at: timestamp
```

### Contest
```sql
id: uuid (PK)
owner_id: uuid (FK → User)
code: text (unique) -- shareable code, e.g., "A7X9K2"
slug: text (unique) -- URL-friendly, e.g., "st-marys-2025"
name: text
description: text (nullable)
status: enum ('draft', 'open', 'locked', 'in_progress', 'completed')
is_public: boolean default false

-- Branding
hero_image_url: text (nullable)
org_image_url: text (nullable)
primary_color: text default '#3B82F6' -- blue
secondary_color: text default '#1E40AF'

-- Game settings
square_price: decimal(10,2)
max_squares_per_person: int (nullable) -- null = unlimited
row_team_name: text
col_team_name: text
row_numbers: int[] (nullable) -- [3,7,1,9,0,5,2,8,4,6]
col_numbers: int[] (nullable)
numbers_auto_generated: boolean default false

-- Payouts (percentages, should sum to ≤100)
payout_q1_percent: int default 20
payout_q2_percent: int default 20
payout_q3_percent: int default 20
payout_final_percent: int default 40

created_at: timestamp
updated_at: timestamp
```

### Square
```sql
id: uuid (PK)
contest_id: uuid (FK → Contest)
row: int (0-9)
col: int (0-9)
claimant_first_name: text (nullable)
claimant_last_name: text (nullable)
claimant_email: text (nullable)
claimant_venmo: text (nullable)
payment_status: enum ('available', 'pending', 'paid') default 'available'
claimed_at: timestamp (nullable)
paid_at: timestamp (nullable)

UNIQUE(contest_id, row, col)
```

### PaymentOption
```sql
id: uuid (PK)
contest_id: uuid (FK → Contest)
type: enum ('venmo', 'paypal', 'cashapp', 'zelle', 'other')
handle_or_link: text
display_name: text (nullable)
instructions: text (nullable)
sort_order: int default 0

created_at: timestamp
```

### Score
```sql
id: uuid (PK)
contest_id: uuid (FK → Contest)
quarter: enum ('q1', 'q2', 'q3', 'final')
home_score: int -- row team
away_score: int -- col team
winning_square_id: uuid (FK → Square, nullable)
entered_at: timestamp

UNIQUE(contest_id, quarter)
```

### EmailLog
```sql
id: uuid (PK)
contest_id: uuid (FK → Contest)
square_id: uuid (FK → Square, nullable)
recipient_email: text
email_type: enum ('claim_confirmation', 'payment_confirmed', 'numbers_revealed', 'winner', 'contest_complete')
resend_id: text (nullable) -- for tracking
status: enum ('sent', 'delivered', 'failed')
sent_at: timestamp
```

---

## URL Structure

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page (hero, features, pricing preview) |
| `/pricing` | Subscription tiers and Stripe checkout |
| `/browse` | Public contests directory |
| `/c/[slug]` | Contest page (participant view) |
| `/join/[code]` | Redirect to contest by code |
| `/login` | Sign in page |
| `/signup` | Create account page |

### Protected Routes (Manager)
| Route | Description |
|-------|-------------|
| `/dashboard` | Contest list, quick stats |
| `/dashboard/new` | Create new contest wizard |
| `/dashboard/[contestId]` | Contest overview/manage |
| `/dashboard/[contestId]/grid` | View/manage grid |
| `/dashboard/[contestId]/participants` | Participant list, payments |
| `/dashboard/[contestId]/scores` | Enter/edit scores |
| `/dashboard/[contestId]/settings` | Contest settings |
| `/dashboard/account` | Account settings |
| `/dashboard/billing` | Subscription management |

---

## Page Layouts & Components

### Landing Page (`/`)
- Hero section with tagline
- How it works (3 steps)
- Feature highlights
- Pricing preview (link to full pricing)
- CTA: "Create Your Contest"

### Contest Page - Participant View (`/c/[slug]`)
```
┌─────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓ HERO IMAGE ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ┌────┐                                              │
│ │ ○○ │ Org Logo                                     │
│ └────┘                                              │
├─────────────────────────────────────────────────────┤
│ Contest Name                                        │
│ $10 per square · 45/100 claimed                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│        [COLUMN TEAM NAME: EAGLES]                   │
│        0  1  2  3  4  5  6  7  8  9                 │
│      ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐               │
│   0  │  │██│  │  │██│  │  │  │██│  │               │
│   1  │██│  │  │██│  │  │██│  │  │  │               │
│  [R] │  │  │██│  │  │██│  │██│  │  │  [ROW TEAM]   │
│  [O] │██│  │  │  │  │  │  │  │  │██│  [CHIEFS]     │
│  [W] │  │██│  │██│  │  │  │  │██│  │               │
│      └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘               │
│                                                     │
│  ██ = Claimed    ░░ = Available                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Payment Options                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │ Venmo   │ │ PayPal  │ │ CashApp │                │
│ │@Booster │ │ [Link]  │ │ $Boost  │                │
│ └─────────┘ └─────────┘ └─────────┘                │
├─────────────────────────────────────────────────────┤
│ Share: [Copy Link] [QR Code]                        │
└─────────────────────────────────────────────────────┘
```

### Square Claim Modal
```
┌─────────────────────────────────────────┐
│ Claim Square (3, 7)                 [X] │
├─────────────────────────────────────────┤
│                                         │
│ First Name*    [__________________]     │
│ Last Name*     [__________________]     │
│ Email*         [__________________]     │
│ Venmo Handle   [__________________]     │
│                                         │
│ ─────────────────────────────────────── │
│ Total: $10.00                           │
│                                         │
│ Payment Instructions:                   │
│ Send $10 to @BoosterClub on Venmo      │
│ Include "Square 3,7 - [Your Name]"     │
│                                         │
│         [Claim Square]                  │
│                                         │
└─────────────────────────────────────────┘
```

### Manager Dashboard (`/dashboard`)
- List of contests with status badges
- Quick stats (total claimed, total paid, revenue)
- "Create New Contest" button
- Free tier: show 1 contest limit, upgrade prompt

### Manager Grid View (`/dashboard/[contestId]/grid`)
- Same grid as participant view
- Click square to see details/edit
- Bulk actions: "Mark all as paid", "Release unpaid"
- Color coding: Available (gray), Pending (yellow), Paid (green)

### Participants Table (`/dashboard/[contestId]/participants`)
```
┌────┬───────────┬───────────────────┬────────┬─────────┬─────────┐
│ Sq │ Name      │ Email             │ Venmo  │ Status  │ Actions │
├────┼───────────┼───────────────────┼────────┼─────────┼─────────┤
│ 0,3│ John Doe  │ john@email.com    │ @john  │ ● Paid  │ [···]   │
│ 2,7│ Jane Doe  │ jane@email.com    │ @jane  │ ○ Pend  │ [···]   │
└────┴───────────┴───────────────────┴────────┴─────────┴─────────┘

Actions dropdown: Mark Paid, Release Square, Send Reminder
```

---

## Real-time Implementation

### Supabase Realtime Subscriptions

**Contest Page (Participants)**
Subscribe to `squares` table filtered by `contest_id`:
- On INSERT: Show square as claimed
- On UPDATE: Reflect payment status changes (for manager view)
- On DELETE: Show square as available (released)

**Manager Dashboard**
Subscribe to own contests:
- Real-time claim notifications
- Updated counts

### Optimistic Updates
- When claiming a square, immediately show as "claiming..."
- If fails (race condition), show error and refresh grid

---

## Monetization

### Subscription Tiers

| Feature | Free | Pro ($9.99/yr) | Org ($29.99/yr) |
|---------|------|----------------|-----------------|
| Active contests | 1 | Unlimited | Unlimited |
| Ads displayed | Yes | No | No |
| Custom branding | Yes | Yes | Yes |
| Email notifications | Basic | Full | Full |
| Priority support | No | Yes | Yes |
| Multiple admins | No | No | Yes |
| Analytics | No | Basic | Advanced |

### Implementation Notes
- `is_early_adopter` flag for grandfathered users (free Pro forever)
- Check tier on contest creation (enforce limit)
- Show upgrade prompts contextually (not annoyingly)
- Stripe Customer Portal for subscription management

### Ad Placement (Free Tier)
- Banner below hero on contest page
- Sidebar on desktop dashboard
- Between sections on mobile
- **Never** on the grid itself or claim modal

---

## Security Considerations

### Row Level Security (RLS)
- Users can only read/write their own contests
- Squares are readable by anyone (public grid)
- Squares writable only if:
  - Status is 'available' (claiming)
  - Or user is contest owner (managing)
- Payment options readable by anyone (public)
- Scores readable by anyone, writable by owner

### Rate Limiting
- Square claims: Prevent rapid-fire claims
- Account creation: Standard anti-bot measures
- API endpoints: Reasonable limits

### Validation
- Contest code uniqueness
- Email format validation
- Square position bounds (0-9)
- Payout percentages ≤ 100 total

---

## Development Phases

### Phase 1: Foundation (MVP Core)
- [ ] Project setup (Next.js, Supabase, Tailwind)
- [ ] Supabase schema + RLS policies
- [ ] Auth flow (signup, login, logout)
- [ ] Basic dashboard layout
- [ ] Contest CRUD (create, read, update, delete)
- [ ] Image upload (hero, org logo)

### Phase 2: Grid & Claims
- [ ] Grid component (10x10 display)
- [ ] Real-time subscriptions
- [ ] Square claiming flow
- [ ] Claim modal with form
- [ ] Participant list view
- [ ] Payment status management

### Phase 3: Numbers & Scores
- [ ] Number entry (manual)
- [ ] Auto-generate numbers
- [ ] Score entry per quarter
- [ ] Winner calculation logic
- [ ] Winner highlighting on grid

### Phase 4: Notifications
- [ ] Resend integration
- [ ] Email templates
- [ ] Claim confirmation email
- [ ] Winner notification email
- [ ] Contest complete summary

### Phase 5: Polish & Share
- [ ] QR code generation
- [ ] Share buttons (copy link, etc.)
- [ ] Contest code lookup (`/join/[code]`)
- [ ] Public contest directory
- [ ] Mobile responsiveness pass
- [ ] Loading states & error handling

### Phase 6: Monetization
- [ ] Stripe integration
- [ ] Subscription checkout flow
- [ ] Customer portal
- [ ] Tier enforcement (1 contest limit)
- [ ] Early adopter flagging
- [ ] Ad placement (free tier)

### Phase 7: Enhancements (v1.5+)
- [ ] Multi-select squares
- [ ] Contest cloning
- [ ] Bulk email (reminders)
- [ ] Export participants (CSV)
- [ ] Printable grid view

### Phase 8: Future (v2)
- [ ] Live score API integration
- [ ] SMS notifications
- [ ] Organization tier (multi-admin)
- [ ] Analytics dashboard
- [ ] Native mobile app?

---

## File Structure (Proposed)

```
/app
  /layout.tsx
  /page.tsx                    # Landing page
  /login/page.tsx
  /signup/page.tsx
  /pricing/page.tsx
  /browse/page.tsx             # Public contests
  /join/[code]/page.tsx        # Redirect by code
  /c/[slug]/page.tsx           # Contest participant view
  /dashboard
    /layout.tsx                # Auth wrapper
    /page.tsx                  # Contest list
    /new/page.tsx              # Create contest
    /[contestId]
      /page.tsx                # Contest overview
      /grid/page.tsx           # Manage grid
      /participants/page.tsx   # Participant list
      /scores/page.tsx         # Enter scores
      /settings/page.tsx       # Contest settings
    /account/page.tsx
    /billing/page.tsx

/components
  /ui                          # Shadcn/ui or custom primitives
  /layout
    Header.tsx
    Footer.tsx
    DashboardNav.tsx
  /contest
    ContestCard.tsx
    ContestHero.tsx
    Grid.tsx
    Square.tsx
    ClaimModal.tsx
    PaymentOptions.tsx
    ScoreBoard.tsx
    QRCode.tsx
  /forms
    ContestForm.tsx
    ClaimForm.tsx
    ScoreForm.tsx

/lib
  /supabase
    client.ts                  # Browser client
    server.ts                  # Server client
    admin.ts                   # Service role client
  /utils
    generateCode.ts
    calculateWinner.ts
    formatCurrency.ts
  /email
    resend.ts
    templates/

/types
  database.ts                  # Generated from Supabase
  index.ts

/hooks
  useContest.ts
  useSquares.ts
  useRealtimeSquares.ts
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Finalized Decisions

| Decision | Choice |
|----------|--------|
| UI Components | Shadcn/ui |
| Form handling | React Hook Form + Zod |
| Server state | TanStack Query |
| Error tracking | Sentry (errors only, skip perf monitoring initially) |

---

## Notes

- Contest managers are the paying customers; participant experience drives their satisfaction
- Keep the grid fast and responsive - it's the core UX
- Mobile-first for participants (they'll access via text/social)
- Desktop-friendly for managers (they're doing admin work)
