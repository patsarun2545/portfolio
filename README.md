This is a [Next.js](https://nextjs.org) portfolio project with admin panel.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel + Neon

### Prerequisites

1. **Neon Database**
   - Create a free account at [Neon](https://neon.tech)
   - Create a new PostgreSQL database
   - Copy the `DATABASE_URL` from the Neon dashboard

2. **ImageKit Account**
   - Create a free account at [ImageKit](https://imagekit.io)
   - Copy your ImageKit URL endpoint, public key, and private key

### Setup Steps

1. **Set Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     ```
     DATABASE_URL=postgresql://...@...neon.tech/portfolio?sslmode=require
     NEXTAUTH_SECRET=your-random-secret-string
     NEXTAUTH_URL=https://your-domain.vercel.app
     NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
     NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxx
     IMAGEKIT_PRIVATE_KEY=private_xxx
     ```

2. **Run Database Migration**
   - In Vercel dashboard, go to Settings → Git → Build & Development Settings
   - Add `npm run db:migrate` to the "Build Command" or run it manually after deployment
   - Alternatively, run locally: `npm run db:migrate`

3. **Seed Database**
   - Seed admin user: `npm run db:seed:admin`
   - Seed sample data: `npm run db:seed:data`

4. **Deploy**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically deploy on push

### Local Development with Production Database

To use your Neon database locally:

```bash
cp .env.example .env
# Edit .env with your production DATABASE_URL
npm run db:migrate
npm run db:seed:admin
npm run db:seed:data
npm run dev
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
