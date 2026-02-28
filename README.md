# CollabSphere - Real-Time Collaborative Whiteboard

🚀 **Live Deployment**: [https://collab-sphere-final-steel.vercel.app/](https://collab-sphere-final-steel.vercel.app/)

Full-stack collaborative whiteboard application with real-time drawing, chat, and screen sharing.

## 📁 Project Structure

```
CollabSphere/
├── backend/     # Node.js + Express + Socket.io backend
├── frontend/    # React + Vite frontend
└── docs/        # Documentation
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/collabsphere
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## ✨ Features

- 🎨 Real-time collaborative drawing
- 💬 Live chat with online presence
- 🖥️ Screen sharing (host only)
- 🔒 Host mode (control drawing permissions)
- 💾 Save and load whiteboard sessions
- 📤 Image & PDF upload
- 🌓 Dark/Light theme
- 👥 JWT + Google OAuth authentication

## 🚀 Deployment

### Deploy Backend to Render

1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT`
   - `NODE_ENV=production`
   - `CORS_ORIGIN` (your frontend URL)

### Deploy Frontend to Vercel

1. Create new project on Vercel
2. Connect your GitHub repository
3. Set root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable:
   - `VITE_API_URL` (your backend URL)

## 📚 Tech Stack

**Backend:**
- Node.js
- Express.js
- Socket.io
- MongoDB + Mongoose
- JWT Authentication

**Frontend:**
- React 18
- Vite
- Socket.io Client
- React Router
- Context API

## 📖 Documentation

See the `docs/` folder for detailed documentation.

---

Made with ❤️ using React, Node.js, and Socket.io
