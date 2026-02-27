# 🚀 Deployment Guide

## Backend Deployment (Render)

### Step 1: Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Service
- **Name:** collabsphere-backend
- **Root Directory:** `backend`
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Step 3: Add Environment Variables
```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-strong-secret-key
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Step 4: Deploy
Click "Create Web Service" and wait for deployment.

Your backend URL will be: `https://collabsphere-backend.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository

### Step 2: Configure Project
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 3: Add Environment Variable
```
VITE_API_URL=https://collabsphere-backend.onrender.com
```

### Step 4: Deploy
Click "Deploy" and wait for deployment.

Your frontend URL will be: `https://your-project.vercel.app`

---

## Update CORS After Deployment

After frontend is deployed, update backend environment variable:

**On Render:**
1. Go to your backend service
2. Environment → Edit
3. Update `CORS_ORIGIN` to your Vercel URL
4. Save changes (will auto-redeploy)

---

## Test Deployment

1. Open your Vercel URL
2. Register/Login
3. Create a room
4. Test drawing, chat, and all features

---

## Troubleshooting

### Backend Issues
- Check Render logs
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend Issues
- Check browser console
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend

### Connection Issues
- Ensure backend is running
- Check CORS_ORIGIN matches frontend URL
- Verify MongoDB is accessible

---

**Done! Your app is live!** 🎉
