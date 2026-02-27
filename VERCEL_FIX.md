# Fix Vercel Deployment - Missing Features

## Problem
Screen sharing and other features work on localhost but not on Vercel deployment.

## Root Cause
Missing or incorrect environment variables on Vercel.

---

## Solution: Update Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your project: `collab-sphere-final-lyart`
3. Go to "Settings" tab
4. Click "Environment Variables" in the left sidebar

### Step 2: Add/Update These Variables

**VITE_API_URL**
```
https://collabsphere-final.onrender.com
```

**VITE_GOOGLE_CLIENT_ID**
```
378513825447-vq2v1j51hmnongle56sa36asm1ngavm1.apps.googleusercontent.com
```

### Step 3: Redeploy
1. Go to "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete (2-3 minutes)

---

## Verify It Works

After redeployment:
1. Open: https://collab-sphere-final-lyart.vercel.app
2. Login/Register
3. Create a room
4. You should now see:
   - 🖥️ Screen Share button (if you're host)
   - 🔒/🔓 Host Mode button (if you're host)
   - All other features

---

## Important Notes

1. **Environment variables MUST start with `VITE_`** for Vite to include them in the build
2. **No trailing slashes** in URLs
3. **Redeploy is required** after changing environment variables
4. Check browser console for any errors after deployment

---

## If Still Not Working

### Check Backend CORS Settings on Render

1. Go to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Verify these variables:
   ```
   FRONTEND_URL=https://collab-sphere-final-lyart.vercel.app
   CORS_ORIGIN=https://collab-sphere-final-lyart.vercel.app
   ```
5. Save (will auto-redeploy)

### Check Browser Console

1. Open your Vercel app
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for errors like:
   - "Failed to connect to socket"
   - "CORS error"
   - "API_URL is undefined"

If you see these errors, the environment variables are not set correctly.

---

## Quick Checklist

- [ ] `VITE_API_URL` set on Vercel
- [ ] `VITE_GOOGLE_CLIENT_ID` set on Vercel
- [ ] Redeployed after setting variables
- [ ] Backend `FRONTEND_URL` matches Vercel URL
- [ ] Backend `CORS_ORIGIN` matches Vercel URL
- [ ] No CORS errors in browser console
- [ ] Can login and create room
- [ ] Screen share button visible (when host)
- [ ] Host mode button visible (when host)

---

## Still Having Issues?

The most common issue is that environment variables are not set or have typos. Double-check:
1. Variable names are EXACTLY: `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`
2. URLs have NO trailing slashes
3. You clicked "Redeploy" after adding variables
