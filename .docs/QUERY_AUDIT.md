# Griddo Query Audit

**Date**: December 24, 2025

---

## Summary by Entity

### Contests

| File | Operation | Description |
|------|-----------|-------------|
| `src/app/dashboard/page.tsx` | SELECT | Lists all contests for owner with nested squares (for claimed count) |
| `src/app/dashboard/[contestId]/page.tsx` | SELECT | Fetches single contest by ID with all fields (`*`) |
| `src/app/c/[slug]/page.tsx` | SELECT | Fetches contest by slug for public page (specific fields only) |
| `src/features/contests/actions/create-contest.ts` | INSERT | Creates new contest with all settings, returns created record |
| `src/features/contests/actions/claim-square.ts` | SELECT | Fetches contest status and max_squares_per_person for validation |
| `src/features/contests/actions/verify-pin.ts` | SELECT | Fetches contest access_pin for PIN verification |
| `src/app/dashboard/[contestId]/actions.ts` | UPDATE | Opens contest (sets status='open', is_public=true) |

### Squares

| File | Operation | Description |
|------|-----------|-------------|
| `src/app/dashboard/[contestId]/page.tsx` | SELECT | Fetches all squares for contest grid (dashboard view) |
| `src/app/c/[slug]/page.tsx` | SELECT | Fetches all squares for contest grid (public view) |
| `src/app/dashboard/page.tsx` | SELECT | Fetches squares nested in contest query (for claimed count) |
| `src/features/contests/actions/claim-square.ts` | SELECT | Fetches single square to verify availability |
| `src/features/contests/actions/claim-square.ts` | SELECT (count) | Counts squares claimed by email for per-person limit check |
| `src/features/contests/actions/claim-square.ts` | UPDATE | Claims square with claimant info, uses optimistic locking |

### Users

| File | Operation | Description |
|------|-----------|-------------|
| `src/features/account/controllers/get-user.ts` | SELECT | Fetches current user's profile (`*`) |
| `src/features/account/controllers/upsert-user-subscription.ts` | UPDATE | Copies billing details (address, payment method) to user |

### Subscriptions

| File | Operation | Description |
|------|-----------|-------------|
| `src/features/account/controllers/get-subscription.ts` | SELECT | Fetches active subscription with nested prices and products |
| `src/features/subscriptions/has-active-subscription.ts` | SELECT (count) | Checks if user has active/trialing subscription |
| `src/features/account/controllers/upsert-user-subscription.ts` | UPSERT | Creates or updates subscription from Stripe webhook |

### Customers

| File | Operation | Description |
|------|-----------|-------------|
| `src/features/account/controllers/get-customer-id.ts` | SELECT | Fetches Stripe customer ID for user |
| `src/features/account/controllers/get-or-create-customer.ts` | SELECT | Checks if customer mapping exists |
| `src/features/account/controllers/get-or-create-customer.ts` | INSERT | Creates customer mapping (userId → stripe_customer_id) |
| `src/features/account/controllers/upsert-user-subscription.ts` | SELECT | Fetches user ID from Stripe customer ID |

### Products/Prices

| File | Operation | Description |
|------|-----------|-------------|
| `src/features/pricing/controllers/get-products.ts` | SELECT | Fetches active products with nested active prices |
| `src/features/pricing/controllers/upsert-product.ts` | UPSERT | Syncs product from Stripe webhook |
| `src/features/pricing/controllers/upsert-price.ts` | UPSERT | Syncs price from Stripe webhook |

---

## Observations

### Duplicate Queries

1. **Squares grid query** - Identical query pattern in two files:
   - `src/app/dashboard/[contestId]/page.tsx` (lines 56-61)
   - `src/app/c/[slug]/page.tsx` (lines 52-57)
   
   Both use:
   ```typescript
   .from('squares')
   .select('id, row_index, col_index, payment_status, claimant_first_name, claimant_last_name')
   .eq('contest_id', contestId)
   .order('row_index')
   .order('col_index')
   ```

2. **Customer ID lookup** - Similar pattern in two files:
   - `src/features/account/controllers/get-customer-id.ts`
   - `src/features/account/controllers/get-or-create-customer.ts`
   
   Both query `customers` table for `stripe_customer_id` by user ID.

### Consolidation Candidates

| Query Pattern | Current Locations | Suggested Consolidation |
|--------------|-------------------|------------------------|
| Get squares for contest | `dashboard/[contestId]/page.tsx`, `c/[slug]/page.tsx` | `src/features/contests/queries/get-squares.ts` |
| Get contest by ID | `dashboard/[contestId]/page.tsx`, `claim-square.ts` | `src/features/contests/queries/get-contest.ts` |
| Get contest by slug | `c/[slug]/page.tsx`, `verify-pin.ts` | `src/features/contests/queries/get-contest.ts` |
| Get customer ID | `get-customer-id.ts`, `get-or-create-customer.ts` | Keep `get-or-create-customer.ts`, remove redundant file |

### Recommendations

1. **Create `src/features/contests/queries/` folder**
   - Move contest SELECT queries to dedicated query functions
   - Suggested files:
     - `get-contest-by-id.ts` - Single contest fetch with configurable fields
     - `get-contest-by-slug.ts` - Public contest fetch
     - `get-squares-for-contest.ts` - Reusable squares grid query
     - `list-contests.ts` - Owner's contest list with counts

2. **Consolidate customer queries**
   - `get-customer-id.ts` could be removed - functionality exists in `get-or-create-customer.ts`
   - Or rename to `get-customer.ts` with optional create behavior

3. **Consider typed query helpers**
   - The `claim-square.ts` action has 4 separate queries - could benefit from a transaction wrapper
   - Contest field selections vary widely - consider a `ContestFields` type for consistency

4. **Add index on `squares.claimant_email`**
   - Already done: `supabase/migrations/20251224143500_add_claimant_email_index.sql`
   - The `ilike('claimant_email', ...)` query in `claim-square.ts` benefits from this

---

## Query Statistics

| Metric | Count |
|--------|-------|
| Total unique query locations | 15 |
| SELECT operations | 14 |
| INSERT operations | 2 |
| UPDATE operations | 3 |
| UPSERT operations | 3 |
| Queries using admin client | 7 |
| Queries using server client | 15 |
| Queries with nested joins | 3 |
| Queries with count aggregation | 2 |

