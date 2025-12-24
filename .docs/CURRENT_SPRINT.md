# Current Sprint: Project Setup & Branding

## Completed

- [x] Template cloned
- [x] Dependencies installed
- [x] Environment configured

## In Progress

- [x] Update Tailwind config with Griddo colors
- [x] Update landing page copy and branding
- [x] Add contest database migration

## Next Up

- [ ] Contest creation form
- [ ] Dashboard layout

## Key Files to Modify

- `tailwind.config.ts` - Add brand colors
- `src/app/(marketing)/page.tsx` - Landing page
- `src/app/layout.tsx` - Metadata, fonts
- `supabase/migrations/` - Add contests migration

```

---

## 4. Don't Overwhelm Cursor

When chatting with Cursor:

**DO:**
- Ask for one thing at a time
- Reference specific files: "Update `tailwind.config.ts` to add Griddo brand colors"
- Point to the docs: "Following the color scheme in `.cursorrules`, update the landing page"

**DON'T:**
- Paste entire planning docs into chat
- Ask it to "build the whole app"
- Give vague instructions like "make it look good"

---

## 5. Suggested First Prompts for Cursor

Once you have everything set up, try these prompts in order:

**Prompt 1 - Colors:**
```

Update tailwind.config.ts to add Griddo brand colors as defined in .cursorrules. Add a "griddo" color palette with primary, secondary, accent, background, surface, and text colors.

```

**Prompt 2 - Landing Page:**
```

Update src/app/(marketing)/page.tsx to be a landing page for Griddo - a game day squares fundraiser platform. Use the Griddo brand colors. Include:

- Hero section with tagline "Host your game day fundraiser"
- 3-step "How it works" section
- Features grid
- CTA button to sign up

```

**Prompt 3 - Database Migration:**
```

Create a new Supabase migration file in supabase/migrations/ for the Griddo contests feature. Reference `/.docs/TEMPLATE_ADAPTATION.md` for the full schema including contests, squares, payment_options, and scores tables with RLS policies.

**Prompt 4 - Dashboard Layout:**

```
Create a dashboard layout at src/app/(protected)/dashboard/layout.tsx with:
- A sidebar navigation with links: My Contests, Account, Billing
- A header with the Griddo logo and user menu
- Use Griddo brand colors
- Make it responsive (collapsible sidebar on mobile)
```

**Prompt 5 - Dashboard Home Page:**

```
Create src/app/(protected)/dashboard/page.tsx that shows:
- A welcome message with the user's name
- A "Create Contest" button
- A list of the user's contests (empty state for now with placeholder)
- Use Griddo brand colors and shadcn/ui components
```

**Prompt 6 - Contest Creation Form:**

```
Create src/app/(protected)/dashboard/new/page.tsx with a multi-step contest creation form:

Step 1 - Basic Info:
- Contest name
- Description
- Row team name, Column team name

Step 2 - Settings:
- Square price
- Max squares per person (optional)
- Payout percentages (Q1, Q2, Q3, Final)

Step 3 - Branding:
- Hero image upload
- Org logo upload
- Primary and secondary color pickers

Use React Hook Form with Zod validation. Reference the contest schema in docs/TEMPLATE_ADAPTATION.md.
```
