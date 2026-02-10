# Deployment Guide

This guide covers deploying Auraya to production using **Vercel** (frontend) and **Railway** (backend + database).

---

## Prerequisites

- GitHub account with repository pushed
- Vercel account (free tier available)
- Railway account (free tier available)

---

## Step 1: Push to GitHub

```bash
cd /Users/lixiong/Desktop/auraya
git add .
git commit -m "Add deployment configurations"
git remote add origin https://github.com/YOUR_USERNAME/auraya.git
git push -u origin master
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to [Railway](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `auraya` repository
4. Railway will detect the monorepo - select the `backend` folder

### 2.2 Add PostgreSQL Database

1. In your Railway project, click **New** → **Database** → **PostgreSQL**
2. Railway will automatically create a `DATABASE_URL` variable

### 2.3 Add Redis (Optional - for background jobs)

1. Click **New** → **Database** → **Redis**
2. Railway will create a `REDIS_URL` variable

### 2.4 Configure Environment Variables

In the backend service settings, add these variables:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-a-secure-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app  # Update after Vercel deploy
```

Optional (for image uploads):
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2.5 Deploy

Railway will automatically deploy. Your backend URL will be:
`https://auraya-backend-production.up.railway.app` (or similar)

### 2.6 Run Database Seed (Optional)

In Railway, open the backend service shell and run:
```bash
npx prisma db push
npx ts-node prisma/seed.ts
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect Repository

1. Go to [Vercel](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Set the **Root Directory** to `frontend`

### 3.2 Configure Environment Variables

Add this environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app
```

### 3.3 Deploy

Click **Deploy**. Vercel will build and deploy automatically.

---

## Step 4: Update CORS

After getting your Vercel URL, update the Railway backend:

1. Go to Railway → Backend service → Variables
2. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://auraya.vercel.app`)
3. Railway will automatically redeploy

---

## Alternative: Deploy with Docker Compose

For self-hosted deployment:

```bash
# Set environment variables
export JWT_SECRET="your-secure-secret"
export POSTGRES_PASSWORD="secure-db-password"

# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Run migrations and seed
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec backend npx ts-node prisma/seed.ts
```

---

## Test Credentials

After seeding the database:

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@auraya.com    | admin123   |
| Seller | seller@auraya.com   | seller123  |

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check that credentials are being sent (`credentials: 'include'`)

### Database Connection
- Verify `DATABASE_URL` is set correctly in Railway
- Run `npx prisma migrate deploy` if tables don't exist

### Build Failures
- Check Node.js version (requires 18+)
- Ensure all dependencies are in package.json
