# CollabSphere Deployment Guide

This guide provides step-by-step instructions for deploying the CollabSphere application to production.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
- ✅ MongoDB Atlas account (or other MongoDB hosting)
- ✅ Google OAuth credentials configured
- ✅ All code tested locally
- ✅ Environment variables documented
- ✅ Git repository ready

---

## 🚀 Backend Deployment (Render/Railway/Heroku)

### Option 1: Deploy to Render (Recommended)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   ```
   Name: collabsphere-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   Go to "Environment" tab and add:
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string_here
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the backend URL (e.g., `https://collabsphere-backend.onrender.com`)

### Option 2: Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - Go to "Variables" tab
   - Add all environment variables (same as Render above)

4. **Deploy**
   - Railway will auto-deploy
   - Copy the generated URL

---

## 🎨 Frontend Deployment (Vercel/Netlify)

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub (Easier)**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Select `collabsphere-frontend` as root directory

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Root Directory: collabsphere-frontend
   ```

4. **Set Environment Variables**
   Go to "Settings" → "Environment Variables":
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy the frontend URL (e.g., `https://collabsphere.vercel.app`)

### Option 2: Deploy to Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Configure Build Settings**
   ```
   Base directory: collabsphere-frontend
   Build command: npm run build
   Publish directory: collabsphere-frontend/dist
   ```

4. **Set Environment Variables**
   Go to "Site settings" → "Environment variables":
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for deployment
   - Copy the site URL

---

## 🔄 Update CORS Configuration

After deploying frontend, update backend CORS:

1. **Update Backend Environment Variable**
   - Go to your backend hosting (Render/Railway)
   - Update `CORS_ORIGIN` to include your frontend URL:
   ```
   CORS_ORIGIN=https://your-frontend-url.vercel.app,https://your-frontend-url.netlify.app
   ```

2. **Redeploy Backend**
   - Save changes
   - Backend will auto-redeploy

---

## 🔐 Update Google OAuth

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project

2. **Update Authorized Origins**
   - Go to "APIs & Services" → "Credentials"
   - Click your OAuth 2.0 Client ID
   - Add to "Authorized JavaScript origins":
     ```
     https://your-frontend-url.vercel.app
     ```

3. **Update Authorized Redirect URIs**
   - Add to "Authorized redirect URIs":
     ```
     https://your-frontend-url.vercel.app
     https://your-frontend-url.vercel.app/dashboard
     ```

4. **Save Changes**

---

## 🗄️ MongoDB Atlas Setup

If you haven't set up MongoDB Atlas:

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select region closest to your backend

3. **Create Database User**
   - Go to "Database Access"
   - Add new database user
   - Save username and password

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to your backend IP

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Use this as `MONGO_URI` in backend environment variables

---

## ✅ Post-Deployment Verification

### Test Backend
1. Visit `https://your-backend-url.onrender.com/api/health`
2. Should return: `{"status":"ok","message":"Server is running"}`

### Test Frontend
1. Visit `https://your-frontend-url.vercel.app`
2. Try to register a new account
3. Try to login
4. Create a room
5. Test drawing on whiteboard
6. Test chat functionality
7. Test dark mode toggle

### Test Real-time Features
1. Open whiteboard in two different browsers
2. Draw in one browser
3. Verify drawing appears in other browser
4. Send chat message
5. Verify message appears in other browser

---

## 📝 Update README with Live URLs

After successful deployment, update your README.md:

```markdown
## 🌐 Live Demo

- **Frontend**: https://collabsphere.vercel.app
- **Backend API**: https://collabsphere-backend.onrender.com

## 🚀 Quick Start

Visit the live demo and:
1. Register a new account
2. Create a room or join existing room
3. Start collaborating!
```

---

## 🐛 Common Deployment Issues

### Issue: CORS Error
**Solution**: Ensure `CORS_ORIGIN` in backend includes your frontend URL

### Issue: Socket.io Connection Failed
**Solution**: 
- Check backend URL in frontend `.env`
- Ensure WebSocket is enabled on hosting platform
- Render and Railway support WebSockets by default

### Issue: MongoDB Connection Failed
**Solution**:
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas network access allows your backend IP
- Ensure database user credentials are correct

### Issue: Google OAuth Not Working
**Solution**:
- Add production URLs to Google Cloud Console
- Update `VITE_GOOGLE_CLIENT_ID` in frontend
- Clear browser cache and cookies

### Issue: Build Failed
**Solution**:
- Check build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong `JWT_SECRET` (32+ characters)
   - Rotate secrets regularly

2. **MongoDB**
   - Use strong database passwords
   - Restrict network access to backend IP only
   - Enable MongoDB authentication

3. **CORS**
   - Only allow specific frontend URLs
   - Don't use `*` in production

4. **Rate Limiting**
   - Consider adding rate limiting middleware
   - Protect against DDoS attacks

---

## 📊 Monitoring

### Render
- View logs in Render dashboard
- Set up health checks
- Monitor resource usage

### Vercel
- View deployment logs
- Monitor function invocations
- Check analytics

### MongoDB Atlas
- Monitor database performance
- Set up alerts for high usage
- Review slow queries

---

## 🎯 Performance Optimization

1. **Frontend**
   - Enable Vite build optimizations
   - Use lazy loading for routes
   - Optimize images

2. **Backend**
   - Enable compression middleware
   - Use MongoDB indexes
   - Implement caching

3. **Socket.io**
   - Use rooms efficiently
   - Throttle frequent events
   - Clean up disconnected sockets

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Socket.io Documentation](https://socket.io/docs/v4/)

---

## ✅ Deployment Complete!

Your CollabSphere application is now live and ready for users! 🎉

**Next Steps:**
1. Share the live URL with your instructor
2. Test all features thoroughly
3. Monitor logs for any issues
4. Gather user feedback
5. Iterate and improve

---

**Need Help?**
- Check the troubleshooting section above
- Review hosting platform documentation
- Check application logs for errors
