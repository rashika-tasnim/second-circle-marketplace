# Second Circle

Second Circle is a full-stack marketplace for discovering, saving, listing, and discussing pre-owned items. It combines a responsive Next.js interface with Supabase authentication, PostgreSQL data, row-level security, and image storage.

## Features

- Email registration, confirmation, login, and logout
- Search, category browsing, price and condition filters
- Detailed item pages and persistent saved items
- Authenticated listing creation with image upload
- Seller contact messages and a personal inbox
- Account area for saved items and owned listings
- Responsive layout for desktop and mobile

## Technology

- Next.js 16 and React 19
- TypeScript
- Supabase Auth, PostgreSQL, Storage, and row-level security
- Tailwind CSS tooling with a custom CSS design system

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and add your Supabase project values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable-key
   ```

4. In the Supabase SQL Editor, run [`supabase/setup.sql`](supabase/setup.sql). This creates the marketplace tables, row-level-security policies, storage bucket, and sample catalogue.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

Do not commit `.env.local` or any private service-role key. The browser application only needs the Supabase project URL and publishable key; access control is enforced through the included row-level-security policies.

## Author

Designed and developed by Rashika Tasnim Keya.
# second-circle-marketplace
