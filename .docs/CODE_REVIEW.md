# Griddo Code Review

**Date**: December 24, 2025  
**Reviewer**: Cursor AI

---

## Auth & Account

### Files Reviewed:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/auth/callback/route.ts`
- `src/app/(auth)/layout.tsx`
- `src/features/auth/auth-actions.ts`
- `src/features/auth/auth-ui.tsx`
- `src/app/(protected)/account/page.tsx`
- `src/app/(protected)/manage-subscription/route.ts`
- `src/features/account/controllers/get-session.ts`
- `src/features/account/controllers/get-subscription.ts`
- `src/features/account/controllers/get-user.ts`
- `src/features/account/controllers/get-customer-id.ts`
- `src/features/account/controllers/get-or-create-customer.ts`
- `src/features/account/controllers/upsert-user-subscription.ts`
- `src/middleware.ts`
- `src/libs/supabase/supabase-middleware-client.ts`
- `src/libs/supabase/supabase-server-client.ts`
- `src/components/account-menu.tsx`
- `src/types/action-response.ts`
- `src/app/navigation.tsx`
- `src/app/api/webhooks/route.ts`

---

### Critical

**[Route Guards Disabled in Middleware]**  
File: `src/libs/supabase/supabase-middleware-client.ts` (lines 48-55)  
Problem: The route guards for protected routes are entirely commented out. This means routes like `/dashboard` and `/account` are not protected at the middleware level. While individual pages check for sessions, the middleware should be the first line of defense.  
Fix: Uncomment and configure the route guards:

```typescript
const guardedRoutes = ['/dashboard', '/account', '/manage-subscription'];
if (!user && guardedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
```

**[Copy-Paste Bug in Middleware Client]**  
File: `src/libs/supabase/supabase-middleware-client.ts` (line 15)  
Problem: The error message references the wrong environment variable. The code reads `NEXT_PUBLIC_SUPABASE_ANON_KEY` but the error message says `'NEXT_PUBLIC_SUPABASE_URL'`.  
Fix: Change line 15 from:

```typescript
getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_URL'),
```

to:

```typescript
getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
```

---

### High

**[ActionResponse Uses `any` Type]**  
File: `src/types/action-response.ts` (lines 3-4)  
Problem: Both `data` and `error` fields use `any` type, bypassing TypeScript's type safety. This can lead to runtime errors and makes the codebase harder to maintain.  
Fix: Create a generic type with proper error typing:

```typescript
export type ActionResponse<T = null> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: { message: string; code?: string };
    }
  | undefined;
```

**[Non-Null Assertion Risk]**  
File: `src/features/account/controllers/upsert-user-subscription.ts` (line 26)  
Problem: The code uses a non-null assertion `customerData!` after checking for `noCustomerError`. However, `customerData` could still be null even if there's no error (e.g., no matching record found).  
Fix: Add explicit null check:

```typescript
if (noCustomerError || !customerData) {
  throw new Error('Customer not found');
}
const { id: userId } = customerData;
```

**[Webhook Returns Undefined on Missing Signature]**  
File: `src/app/api/webhooks/route.ts` (line 27)  
Problem: When `sig` or `webhookSecret` is missing, the function returns `undefined` instead of a proper error response. This could cause issues with Stripe's webhook retry logic.  
Fix: Return a proper error response:

```typescript
if (!sig || !webhookSecret) {
  return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
}
```

---

### Medium

**[Console Logs Left in Production Code]**  
Files: Multiple  
Problem: There are 7 instances of `console.error()` or `console.info()` that will appear in production logs without proper log levels or structured logging.  
Locations:

- `src/features/auth/auth-actions.ts` (lines 20, 38, 50)
- `src/features/account/controllers/get-session.ts` (line 9)
- `src/features/account/controllers/get-subscription.ts` (line 13)
- `src/features/account/controllers/get-user.ts` (line 9)
- `src/features/account/controllers/upsert-user-subscription.ts` (line 54)
- `src/app/api/webhooks/route.ts` (line 70)

Fix: Either remove these logs or implement a proper logging utility that can be configured per environment.

**[Inconsistent Error Handling Pattern]**  
Files: Account controllers  
Problem: Some controllers throw errors (`get-customer-id.ts`), while others log and return undefined/null (`get-session.ts`, `get-user.ts`, `get-subscription.ts`). This inconsistency makes error handling unpredictable for consumers.  
Fix: Establish a consistent pattern. Recommended approach: controllers should throw errors for unexpected failures, and callers should handle them. Use the ActionResponse type for server actions that need to communicate errors to the client.

**[Missing Email Validation]**  
File: `src/features/auth/auth-ui.tsx` (lines 102-108)  
Problem: The email input only relies on browser's built-in `type="email"` validation. There's no Zod schema validation, which is the established pattern per the project rules.  
Fix: Add Zod validation before submitting:

```typescript
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

// In handleEmailSubmit:
const result = emailSchema.safeParse(email);
if (!result.success) {
  toast({ variant: 'destructive', description: result.error.errors[0].message });
  return;
}
```

**[No Visual Loading Indicator]**  
File: `src/features/auth/auth-ui.tsx` (lines 73-88)  
Problem: OAuth and email buttons are disabled during loading but show no visual feedback (spinner, loading text). Users may not realize the action is in progress.  
Fix: Add loading spinner or change button text during pending state:

```typescript
<button disabled={pending}>
  {pending ? <LoadingSpinner /> : <IoLogoGoogle size={20} />}
  {pending ? 'Connecting...' : 'Continue with Google'}
</button>
```

**[Broken Footer Links]**  
File: `src/app/(auth)/layout.tsx` (lines 47-54)  
Problem: Footer links point to pages that likely don't exist: `/about-us`, `/privacy`, `/terms`, `/support`. This will result in 404 errors for users.  
Fix: Either create these pages or remove/hide the links until the pages exist.

---

### Low

**[DRY Violation: Duplicate Login/Signup Pages]**  
Files: `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx`  
Problem: Both pages are nearly identical (same imports, same session check, same layout). The only difference is the `mode` prop passed to `AuthUI`.  
Fix: This is acceptable given the simplicity, but could optionally be consolidated into a single dynamic route like `/auth/[mode]/page.tsx` if more logic is added in the future.

**[Missing Accessibility Label on Account Menu]**  
File: `src/components/account-menu.tsx` (line 42)  
Problem: The menu trigger button only contains an icon with no accessible label. Screen readers will not be able to identify the button's purpose.  
Fix: Add an aria-label:

```typescript
<DropdownMenuTrigger className='rounded-full' aria-label='Account menu'>
  <IoPersonCircleOutline size={24} />
</DropdownMenuTrigger>
```

**[Inconsistent Button Component Usage]**  
File: `src/features/auth/auth-ui.tsx` (lines 73-97)  
Problem: The OAuth buttons use plain `<button>` elements with inline Tailwind classes, while the email form uses the `<Button>` component from shadcn/ui. This creates visual inconsistency and duplicates styling logic.  
Fix: Refactor OAuth buttons to use the `<Button>` component with appropriate variants.

**[Placeholder Social Media Links]**  
File: `src/app/(auth)/layout.tsx` (lines 60-72)  
Problem: All social media links (Twitter, Facebook, Instagram) point to `#`. These non-functional links create a poor user experience.  
Fix: Either add real URLs or remove the social links section until they're available.

---

## Dashboard & Contest Management

### Files Reviewed:

- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/loading.tsx`
- `src/app/dashboard/dashboard-shell.tsx`
- `src/app/dashboard/new/page.tsx`
- `src/app/dashboard/new/loading.tsx`
- `src/app/dashboard/new/steps/basic-info-step.tsx`
- `src/app/dashboard/new/steps/settings-step.tsx`
- `src/app/dashboard/new/steps/branding-step.tsx`
- `src/app/dashboard/[contestId]/page.tsx`
- `src/app/dashboard/[contestId]/loading.tsx`
- `src/app/dashboard/[contestId]/actions.ts`
- `src/app/dashboard/[contestId]/copy-link-button.tsx`
- `src/app/dashboard/[contestId]/open-contest-button.tsx`
- `src/features/contests/actions/create-contest.ts`
- `src/features/contests/actions/claim-square.ts`
- `src/features/contests/actions/verify-pin.ts`
- `src/features/contests/models/contest.ts`
- `src/features/contests/components/contest-card.tsx`
- `src/features/contests/components/squares-grid.tsx`
- `src/components/shared/loading-spinner.tsx`

---

### Critical

None found

---

### High

**[Links to Non-Existent Pages]**  
File: `src/app/dashboard/dashboard-shell.tsx` (lines 23-26)  
Problem: The sidebar navigation includes links to `/dashboard/account` and `/dashboard/billing` which do not exist. These will result in 404 errors.  
Fix: Either create these pages or remove/hide them from navigation until implemented:

```typescript
const navItems = [
  { href: '/dashboard', label: 'My Contests', icon: IoGridOutline },
  // TODO: Uncomment when pages are created
  // { href: '/dashboard/account', label: 'Account', icon: IoPersonOutline },
  // { href: '/dashboard/billing', label: 'Billing', icon: IoCardOutline },
];
```

**[More Links to Non-Existent Pages]**  
File: `src/app/dashboard/[contestId]/page.tsx` (lines 108, 199-209)  
Problem: Links to `/dashboard/${contestId}/settings`, `/dashboard/${contestId}/scores`, and `/dashboard/${contestId}/participants` point to pages that don't exist.  
Fix: Create these pages or remove/hide the buttons until they're implemented.

**[TODO Comment Left in Code]**  
File: `src/features/contests/actions/create-contest.ts` (line 75)  
Problem: There's a TODO comment about migrations that should be addressed: `// TODO: After running migrations, add: sport_type, payout_game_1-7_percent`  
Fix: Complete the migration work and remove the TODO, or create a tracked issue if this is intentional technical debt.

**[Recursive Function Call on Constraint Violation]**  
File: `src/features/contests/actions/create-contest.ts` (lines 108-111)  
Problem: On unique constraint violation, the function calls itself recursively without any depth limit. If the unique constraint keeps failing (e.g., due to a bug), this could cause a stack overflow.  
Fix: Add a retry limit:

```typescript
export async function createContest(input: CreateContestInput, retryCount = 0): Promise<ActionResponse> {
  // ... existing code ...

  if (insertError.code === '23505') {
    if (retryCount >= 3) {
      return { data: null, error: { message: 'Failed to generate unique code. Please try again.' } };
    }
    return createContest(input, retryCount + 1);
  }
}
```

---

### Medium

**[Console.error Statements in Production Code]**  
Files: Multiple contest-related files  
Problem: There are 7 additional instances of `console.error()` that will appear in production logs.  
Locations:

- `src/app/dashboard/[contestId]/actions.ts` (line 29)
- `src/app/dashboard/[contestId]/copy-link-button.tsx` (line 22)
- `src/features/contests/actions/create-contest.ts` (lines 48, 56, 105)
- `src/features/contests/actions/claim-square.ts` (lines 51, 75, 102, 138)
- `src/features/contests/actions/verify-pin.ts` (line 42)

Fix: Implement proper logging utility or remove console statements.

**[DRY Violation: Duplicate Navigation Rendering]**  
File: `src/app/dashboard/dashboard-shell.tsx` (lines 71-90, 125-145)  
Problem: The navigation items are rendered with nearly identical code in both the desktop sidebar and mobile sheet. The same logic for `isActive`, styling, and click handlers is duplicated.  
Fix: Extract navigation rendering into a reusable component:

```typescript
function NavItems({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return navItems.map((item) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <Link key={item.href} href={item.href} onClick={onClick} className={cn(/* ... */)}>
        <item.icon className='h-5 w-5' />
        {item.label}
      </Link>
    );
  });
}
```

**[DRY Violation: Duplicate Logout Button]**  
File: `src/app/dashboard/dashboard-shell.tsx` (lines 94-100, 147-157)  
Problem: The logout button with identical styling and logic is rendered twice - once in the desktop sidebar footer and once in the mobile sheet.  
Fix: Extract into a reusable `LogoutButton` component.

**[Inline Type Assertion]**  
File: `src/app/dashboard/page.tsx` (line 82)  
Problem: Uses inline type assertion `(sq: { payment_status: string })` instead of importing and using the proper `Square` type from the components.  
Fix: Import the Square type:

```typescript
import { Square } from '@/features/contests/components';

// Then use it:
const claimedCount = contest.squares?.filter((sq: Square) => sq.payment_status !== 'available').length ?? 0;
```

**[Parameter Typed as `unknown`]**  
File: `src/app/dashboard/new/page.tsx` (line 87)  
Problem: The `onSubmit` function parameter is typed as `unknown` and then cast to `CreateContestInput`. This bypasses type safety.  
Fix: Use proper typing with react-hook-form:

```typescript
async function onSubmit(data: CreateContestInput) {
  setIsSubmitting(true);
  try {
    const response = await createContest(data);
    // ...
  }
}
```

**[Mixed Icon Libraries]**  
Files: Multiple dashboard files  
Problem: The codebase uses both `react-icons/io5` (IoArrowBack, IoPlay, IoCheckmark, etc.) and `lucide-react` (Eye, EyeOff, RefreshCw, Loader2). This increases bundle size and creates visual inconsistency.  
Fix: Standardize on one icon library. Since shadcn/ui uses lucide-react by default, consider migrating all icons to lucide-react.

---

### Low

**[Unused Component Definition]**  
File: `src/app/dashboard/page.tsx` (lines 47-55)  
Problem: The `LoadingState` component is defined but never used. The `loading.tsx` file handles the loading state via Suspense.  
Fix: Remove the unused `LoadingState` component to reduce code clutter.

**[Missing Screen Reader Text for Step Buttons]**  
File: `src/app/dashboard/new/page.tsx` (lines 133-152)  
Problem: Step indicator buttons use numbers but lack descriptive text for screen readers to understand which step each button represents.  
Fix: Add aria-label to step buttons:

```typescript
<button
  aria-label={`Step ${step.id}: ${step.name}${step.id < currentStep ? ' (completed)' : step.id === currentStep ? ' (current)' : ''}`}
  // ...
>
```

**[Unused `code` Prop Display Only]**  
File: `src/app/dashboard/[contestId]/copy-link-button.tsx` (lines 9-11)  
Problem: The `code` prop is passed to the component but only used for display in the button text. Consider if this prop is necessary or if the button text should simply say "Share Link".  
Fix: Either remove the `code` prop if not needed or document its purpose.

**[Magic Number for Grid Size]**  
File: `src/features/contests/components/squares-grid.tsx` (line 54)  
Problem: The number 10 (grid size) is used as a magic number throughout the component. While unlikely to change, it would be clearer as a constant.  
Fix: Define a constant:

```typescript
const GRID_SIZE = 10;
const grid: (Square | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
```

---

## Public Page & Shared Components

### Files Reviewed:

- `src/app/c/[slug]/page.tsx`
- `src/app/c/[slug]/contest-page-client.tsx`
- `src/app/c/[slug]/loading.tsx`
- `src/features/contests/components/claim-square-modal.tsx`
- `src/features/contests/components/pin-entry-modal.tsx`
- `src/features/contests/components/squares-grid.tsx`
- `src/features/contests/components/index.ts`
- `src/features/subscriptions/has-active-subscription.ts`
- `src/components/shared/ad-placeholder.tsx`
- `src/components/shared/page-loader.tsx`
- `src/components/shared/loading-spinner.tsx`
- `src/components/shared/route-progress.tsx`
- `src/components/shared/index.ts`
- `src/components/layout/marketing-footer.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/toast.tsx`
- `src/components/ui/use-toast.ts`
- `src/components/sexy-boarder.tsx`

---

### Critical

**[Possible Wrong Column Name in Subscription Query]**  
File: `src/features/subscriptions/has-active-subscription.ts` (line 17)  
Problem: The query filters by `.eq('owner_id', ownerId)` but based on other files in the codebase (e.g., `get-subscription.ts`), the subscriptions table uses `user_id` not `owner_id`. This could cause subscription checks to always return `false`, meaning ads would always show even for paying customers.  
Fix: Verify the correct column name and update:

```typescript
.eq('user_id', ownerId)
```

---

### High

**[DRY Violation: Duplicate Footer Components]**  
Files: `src/components/layout/marketing-footer.tsx` and `src/app/(auth)/layout.tsx` (lines 30-84)  
Problem: The footer content is nearly identical in both files, including the same broken links. Any footer updates need to be made in two places.  
Fix: The `MarketingFooter` component already exists - update `src/app/(auth)/layout.tsx` to import and use it instead of duplicating the footer code.

**[External Images May Fail Without Domain Configuration]**  
File: `src/app/c/[slug]/contest-page-client.tsx` (lines 125-129, 183-189)  
Problem: User-provided `hero_image_url` and `org_image_url` are rendered using `next/image`, but external domains need to be configured in `next.config.js`. Without proper configuration, images from external URLs will fail to load.  
Fix: Either configure remote patterns in `next.config.js`:

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
  ],
},
```

Or use a regular `<img>` tag with proper security considerations for user-provided URLs.

**[Missing Error Handling in PIN Modal]**  
File: `src/features/contests/components/pin-entry-modal.tsx` (lines 56-74)  
Problem: Unlike `ClaimSquareModal` which wraps the async operation in try-catch, `PinEntryModal` doesn't catch exceptions from `verifyPin()`. If the server action throws, the error won't be handled gracefully.  
Fix: Add try-catch:

```typescript
startTransition(async () => {
  try {
    const result = await verifyPin({ contestSlug, enteredPin: data.pin });
    if (result.error) {
      setServerError(result.error.message);
      return;
    }
    if (result.data?.success) {
      reset();
      onSuccess();
    }
  } catch (error) {
    setServerError('An unexpected error occurred. Please try again.');
  }
});
```

---

### Medium

**[TODO Comment in Production Code]**  
File: `src/components/shared/ad-placeholder.tsx` (lines 31-38)  
Problem: Contains a TODO comment about replacing the placeholder with Google AdSense code. This is technical debt that should be tracked.  
Fix: Create a tracked issue for implementing AdSense integration or add to project backlog.

**[Broken Footer Links (Duplicate Issue)]**  
File: `src/components/layout/marketing-footer.tsx` (lines 25-33)  
Problem: Same as previously noted - links to `/about-us`, `/privacy`, and `/support` point to pages that don't exist. This affects the public contest pages.  
Fix: Create the pages or remove/hide the links.

**[Placeholder Social Media Links]**  
File: `src/components/layout/marketing-footer.tsx` (lines 38-52)  
Problem: All social media links point to `#`. These non-functional links create a poor user experience on public pages.  
Fix: Either add real URLs or remove the social section until available.

**[Contest Status Check Could Use Early Return]**  
File: `src/app/c/[slug]/contest-page-client.tsx` (lines 50-67)  
Problem: The `handleSquareClick` function has nested conditionals that could be simplified with early returns for better readability.  
Fix: Refactor to use guard clauses:

```typescript
const handleSquareClick = (square: Square) => {
  if (contest.status !== 'open') return;

  if (square.payment_status !== 'available') {
    toast({ title: 'Square Unavailable', description: '...', variant: 'destructive' });
    return;
  }

  setSelectedSquare(square);
  setIsClaimModalOpen(true);
};
```

**[Missing Image Alt Text Descriptiveness]**  
File: `src/app/c/[slug]/contest-page-client.tsx` (line 185)  
Problem: The org_image_url image uses `alt="Organization"` which is not descriptive enough for screen readers.  
Fix: Use a more descriptive alt text:

```typescript
alt={`${contest.name} organization logo`}
```

---

### Low

**[Typo in Component Name]**  
File: `src/components/sexy-boarder.tsx`  
Problem: The component is named `SexyBoarder` but "boarder" is misspelled - it should be `SexyBorder`.  
Fix: Rename the file to `sexy-border.tsx` and the component to `SexyBorder`. Update all imports.

**[Unusual Toast Remove Delay]**  
File: `src/components/ui/use-toast.ts` (line 7)  
Problem: `TOAST_REMOVE_DELAY = 1000000` (about 16 minutes) is unusually long. This may be intentional but could cause memory issues if many toasts are shown.  
Fix: If this is intentional for the UI pattern, add a comment explaining why. Otherwise, consider a more typical value like 5000ms (5 seconds).

**[Empty InputProps Interface]**  
File: `src/components/ui/input.tsx` (line 5)  
Problem: `InputProps` is defined as extending `React.InputHTMLAttributes<HTMLInputElement>` without adding any additional properties. While not incorrect, it could simply use the HTML type directly.  
Fix: This is a minor issue but the interface exists for future extensibility. Consider adding a comment explaining this is intentional for future additions.

**[RouteProgress Click Handler on All Links]**  
File: `src/components/shared/route-progress.tsx` (lines 49-59)  
Problem: The click handler attaches to the document and checks every click for anchor tags. While functional, this could be more efficient with event delegation or using Next.js Router events.  
Fix: Consider using Next.js `usePathname` changes more directly or `router.events` (if available in App Router) for more reliable route change detection.

**[Missing aria-label on Contest Circle Logo]**  
File: `src/app/c/[slug]/contest-page-client.tsx` (lines 179-200)  
Problem: When no org_image_url is provided, the fallback shows initials but the container div lacks an accessible label describing what it represents.  
Fix: Add aria-label to the circle container:

```typescript
<div
  className="flex h-40 w-40 items-center justify-center..."
  aria-label={`${contest.name} logo`}
  role="img"
>
```

---

## Actions, Libs & Config

### Files Reviewed:

- `src/libs/stripe/stripe-admin.ts`
- `src/libs/resend/resend-client.ts`
- `src/libs/supabase/supabase-admin.ts`
- `src/libs/supabase/supabase-server-client.ts`
- `src/libs/supabase/supabase-middleware-client.ts`
- `src/libs/supabase/types.ts`
- `src/utils/cn.ts`
- `src/utils/get-env-var.ts`
- `src/utils/get-url.ts`
- `src/utils/to-date-time.ts`
- `src/types/action-response.ts`
- `src/features/pricing/actions/create-checkout-action.ts`
- `src/features/pricing/controllers/get-products.ts`
- `src/features/pricing/controllers/upsert-price.ts`
- `src/features/pricing/controllers/upsert-product.ts`
- `src/features/contests/actions/create-contest.ts`
- `src/features/contests/actions/claim-square.ts`
- `src/features/contests/actions/verify-pin.ts`
- `src/features/auth/auth-actions.ts`
- `src/app/dashboard/[contestId]/actions.ts`
- `supabase/migrations/20240115041359_init.sql`
- `supabase/migrations/20241223000000_add_contests.sql`
- `supabase/migrations/20241224000000_add_sport_type.sql`
- `supabase/migrations/20241224000001_add_baseball_payouts.sql`
- `supabase/migrations/20241225000000_add_access_pin.sql`
- `next.config.js`
- `tailwind.config.ts`
- `package.json`
- `tsconfig.json`

---

### Critical

**[Confirmed: Subscription Query Uses Wrong Column]**  
File: `src/features/subscriptions/has-active-subscription.ts` (line 17)  
Problem: The query filters by `owner_id` but according to `src/libs/supabase/types.ts` (line 420), the subscriptions table uses `user_id`. This will cause the subscription check to always return `false`, meaning ads will always show even for paying customers.  
Fix: Change the column name:

```typescript
.eq('user_id', ownerId)
```

---

### High

**[Empty next.config.js - Missing Image Configuration]**  
File: `next.config.js`  
Problem: The config is completely empty (`{}`), but the application uses `next/image` with user-provided external URLs (hero_image_url, org_image_url). Without `remotePatterns` configuration, these images will fail to load with an error.  
Fix: Add image configuration:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
```

**[Incorrect Unix Epoch in toDateTime Utility]**  
File: `src/utils/to-date-time.ts` (line 2)  
Problem: The function uses `'1970-01-01T00:30:00Z'` as the Unix epoch start, but the correct epoch start is `'1970-01-01T00:00:00Z'`. This adds 30 minutes to all Stripe timestamp conversions.  
Fix: Correct the epoch:

```typescript
export function toDateTime(secs: number) {
  const t = new Date('1970-01-01T00:00:00Z');
  t.setSeconds(secs);
  return t;
}
```

**[Missing Payout Validation in Database]**  
File: `supabase/migrations/20241223000000_add_contests.sql`  
Problem: There's no database-level constraint ensuring total payouts don't exceed 100%. The validation only happens in Zod on the client, but direct database inserts could bypass this.  
Fix: Add a CHECK constraint in a new migration:

```sql
ALTER TABLE contests ADD CONSTRAINT check_payout_total
CHECK (
  COALESCE(payout_q1_percent, 0) +
  COALESCE(payout_q2_percent, 0) +
  COALESCE(payout_q3_percent, 0) +
  COALESCE(payout_final_percent, 0) <= 100
);
```

---

### Medium

**[Additional Console Statements in Production]**  
Files: Pricing controllers  
Problem: More console statements found in pricing-related files.  
Locations:

- `src/features/pricing/controllers/get-products.ts` (line 15)
- `src/features/pricing/controllers/upsert-price.ts` (line 28)
- `src/features/pricing/controllers/upsert-product.ts` (line 23)

Fix: Remove or replace with proper logging utility.

**[Unused Dependency: classnames]**  
File: `package.json` (line 39)  
Problem: The `classnames` package is installed but the codebase uses `clsx` with `tailwind-merge` via the `cn` utility. Having both increases bundle size unnecessarily.  
Fix: Remove `classnames` from dependencies:

```bash
npm uninstall classnames
```

**[Stripe API Version May Be Outdated]**  
File: `src/libs/stripe/stripe-admin.ts` (line 7)  
Problem: The Stripe API version `2023-10-16` is over a year old. While not critical, keeping up with Stripe API versions is recommended for security and new features.  
Fix: Consider updating to the latest stable Stripe API version and testing webhook compatibility.

**[Use of `var` Instead of `const`/`let`]**  
File: `src/utils/to-date-time.ts` (line 2)  
Problem: Uses `var` keyword which is outdated and can cause scoping issues. The codebase otherwise follows modern ES6+ patterns.  
Fix: Replace with `const`:

```typescript
export function toDateTime(secs: number) {
  const t = new Date('1970-01-01T00:00:00Z');
  t.setSeconds(secs);
  return t;
}
```

---

### Low

**[Placeholder in npm Script]**  
File: `package.json` (line 13)  
Problem: The `stripe:listen` script contains `UPDATE_THIS_WITH_YOUR_STRIPE_PROJECT_NAME` placeholder that should be configured.  
Fix: Update with actual Stripe project name or remove the placeholder from the script.

**[RLS Policy May Allow Draft Contest Viewing]**  
File: `supabase/migrations/20241223000000_add_contests.sql` (lines 169-175)  
Problem: The SELECT policies allow owners to view their own contests AND public contests. However, there's no explicit denial if somehow `is_public` is set to true while still in draft. The code handles this, but a more explicit policy would be safer.  
Fix: This is low priority as the code already handles this, but could add explicit policy refinement.

**[TypeScript Types Are Generated - Consider CI Integration]**  
File: `package.json` (line 14)  
Problem: Types are generated manually via `npm run generate-types`. If schema changes in production without regenerating, TypeScript won't catch the mismatch.  
Fix: Consider adding type generation to CI pipeline or pre-commit hooks.

**[Missing Index on claimant_email]**  
File: `supabase/migrations/20241223000000_add_contests.sql`  
Problem: The `claim-square.ts` action queries by `claimant_email` with `ilike()`, but there's no index on this column. This could be slow for large contests.  
Fix: Add index in new migration:

```sql
CREATE INDEX idx_squares_claimant_email ON squares(claimant_email);
```

---

## Summary

| Severity  | Auth & Account | Dashboard & Contests | Public & Shared | Actions, Libs & Config | Total  |
| --------- | -------------- | -------------------- | --------------- | ---------------------- | ------ |
| Critical  | 2              | 0                    | 1               | 1                      | 4      |
| High      | 3              | 4                    | 3               | 3                      | 13     |
| Medium    | 5              | 6                    | 5               | 4                      | 20     |
| Low       | 4              | 4                    | 5               | 4                      | 17     |
| **Total** | **14**         | **14**               | **14**          | **12**                 | **54** |

---

## Top 5 Priority Fixes

1. **Fix middleware copy-paste bug** - Wrong env var name in error message causes confusing debugging (Critical, 1 min fix)
2. **Fix subscription query column** - Using `owner_id` instead of `user_id` breaks ad-free experience for paying customers (Critical, 1 min fix)
3. **Enable route guards in middleware** - Protected routes are not actually protected at middleware level (Critical, 5 min fix)
4. **Add next.config.js image config** - User-provided images will fail without remotePatterns (High, 2 min fix)
5. **Fix toDateTime epoch bug** - All Stripe timestamps are off by 30 minutes (High, 1 min fix)

---

## Recurring Patterns

| Pattern                         | Occurrences | Files Affected                                                                    |
| ------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| Console.log/error statements    | 16+         | Auth actions, account controllers, contest actions, pricing controllers, webhooks |
| Broken/placeholder links        | 3           | Auth layout, marketing footer (duplicated)                                        |
| Duplicate code (DRY violations) | 4           | Login/signup pages, footer, dashboard nav, logout button                          |
| Missing try-catch               | 2           | PinEntryModal, some webhook handlers                                              |
| Links to non-existent pages     | 7+          | Dashboard nav, contest detail page                                                |

---

## Quick Wins (< 5 minutes each)

1. Fix copy-paste bug in `supabase-middleware-client.ts` line 15
2. Change `owner_id` to `user_id` in `has-active-subscription.ts`
3. Fix epoch time in `to-date-time.ts`
4. Add image config to `next.config.js`
5. Remove `classnames` dependency from `package.json`
6. Add `aria-label` to account menu trigger
7. Fix spelling of `SexyBoarder` to `SexyBorder`
8. Update webhook to return proper error response when signature missing

---

## Technical Debt

| Item                                                                              | Effort | Impact | Priority |
| --------------------------------------------------------------------------------- | ------ | ------ | -------- |
| Implement proper logging utility (replace console.\*)                             | Medium | High   | High     |
| Create missing dashboard pages (account, billing, settings, scores, participants) | High   | High   | High     |
| Add database constraint for payout totals                                         | Low    | Medium | Medium   |
| Standardize on single icon library (lucide-react)                                 | Medium | Low    | Low      |
| Refactor duplicate navigation code in dashboard shell                             | Low    | Low    | Low      |
| Add missing indexes (claimant_email)                                              | Low    | Medium | Medium   |
| Remove/fix placeholder footer links                                               | Low    | Low    | Low      |
| Replace `any` types with proper generics in ActionResponse                        | Low    | Medium | Medium   |
| Add retry limit to recursive contest creation                                     | Low    | High   | High     |
| Add CI pipeline for type generation                                               | Medium | Medium | Low      |
