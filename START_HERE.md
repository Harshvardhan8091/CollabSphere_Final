# 🚀 CollabSphere - Start Here

## Quick Deployment Guide

This guide will help you deploy CollabSphere to production.

---

## What You Need

1. **GitHub Account** - Your code repository
2. **Render Account** - For backend hosting (free tier available)
3. **Vercel Account** - For frontend hosting (free tier available)
4. **MongoDB Atlas** - For database (free tier available)

---

## Deployment Steps

### 1. Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables (see below)
6. Click "Create Web Service"

### 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables (see below)
6. Click "Deploy"

### 3. Update Backend CORS

After frontend is deployed:
1. Go to Render dashboard
2. Update `FRONTEND_URL` and `CORS_ORIGIN` with your Vercel URL
3. Save (auto-redeploys)

---

## Environment Variables

### Backend (Render)
```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## Testing

1. Open your Vercel URL
2. Register a new account
3. Create a room
4. Test whiteboard features
5. Done! 🎉

---

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
