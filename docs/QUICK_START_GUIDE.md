# CollabSphere - Quick Start Guide

A quick reference for getting your project up and running.

---

## 🚀 Local Development Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd CollabSphere
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# Required: MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Start backend server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend
cd collabsphere-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# Required: VITE_API_URL, VITE_GOOGLE_CLIENT_ID

# Start frontend server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🌐 Quick Deployment

### Backend (Render)
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Build: `npm install` | Start: `npm start`
4. Add environment variables from `.env`
5. Deploy and copy URL

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Root: `collabsphere-frontend`
4. Add environment variables
5. Deploy and copy URL

### Update CORS
- Update backend `CORS_ORIGIN` with frontend URL
- Redeploy backend

---

## 📋 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
CORS_ORIGIN=https://your-frontend.vercel.app
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_client_id
```

---

## 🧪 Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Login with Google
- [ ] Create room
- [ ] Join room with ID
- [ ] Draw with pencil
- [ ] Use eraser
- [ ] Change colors
- [ ] Change brush sizes
- [ ] Send chat message
- [ ] Upload image
- [ ] Undo/Redo
- [ ] Save as image
- [ ] Toggle dark mode
- [ ] Clear canvas (host only)
- [ ] Test with 2+ users

---

## 📚 Key Files

### Frontend
- `src/pages/Whiteboard.jsx` - Main whiteboard component
- `src/context/AuthContext.jsx` - Authentication state
- `src/context/ThemeContext.jsx` - Theme state
- `src/services/socket.js` - Socket.io client

### Backend
- `server.js` - Express server setup
- `sockets/socketHandler.js` - Socket.io events
- `controllers/authController.js` - Authentication logic
- `controllers/roomController.js` - Room management
- `models/User.js` - User schema
- `models/Room.js` - Room schema

---

## 🐛 Common Issues

### CORS Error
- Check `CORS_ORIGIN` includes frontend URL
- Restart backend after changes

### Socket Connection Failed
- Verify `VITE_API_URL` is correct
- Check backend is running
- Check browser console for errors

### MongoDB Connection Failed
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas network access
- Ensure database user exists

### Google OAuth Not Working
- Add URLs to Google Cloud Console
- Check `GOOGLE_CLIENT_ID` matches
- Clear browser cache

---

## 📖 Documentation

- `README.md` - Main documentation
- `docs/ASSESSMENT_CHECKLIST.md` - Feature checklist
- `docs/DEPLOYMENT_GUIDE.md` - Deployment instructions
- `docs/FINAL_VERIFICATION.md` - Verification report
- `docs/PROJECT_STRUCTURE.md` - Folder structure

---

## 🎯 Submission Requirements

1. **GitHub Repository**
   - All source code
   - README with setup instructions
   - .gitignore file
   - Documentation folder

2. **Live Deployment**
   - Frontend URL
   - Backend URL
   - All features working

3. **Documentation**
   - Installation guide
   - Usage instructions
   - Tech stack details

---

## 💡 Tips

- Test locally before deploying
- Use environment variables for all secrets
- Never commit .env files
- Test with multiple browsers
- Check console for errors
- Monitor deployment logs

---

## 🆘 Need Help?

1. Check documentation in `docs/` folder
2. Review error messages in console
3. Check deployment logs
4. Verify environment variables
5. Test API endpoints directly

---

## ✅ Project Status

- ✅ All core features complete
- ✅ All intermediate features complete
- ✅ Key advanced features complete
- ✅ Documentation complete
- ✅ Ready for deployment
- ⏳ Awaiting GitHub push
- ⏳ Awaiting live deployment

---

**Good luck with your submission!** 🚀
