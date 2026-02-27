# CollabSphere Project Structure

## 📁 Root Directory

```
CollabSphere/
├── docs/                           # Documentation files
│   ├── DROPDOWN_FIX.md            # Dropdown positioning fix documentation
│   ├── ENHANCED_FEATURES.md       # Enhanced features documentation
│   ├── FINAL_IMPROVEMENTS.md      # Final improvements summary
│   ├── PROJECT_STRUCTURE.md       # This file
│   ├── UI_UX_IMPROVEMENTS.md      # UI/UX improvements documentation
│   └── WHITEBOARD_IMPROVEMENTS.md # Whiteboard improvements documentation
│
├── collabsphere-frontend/         # React frontend application
│   ├── dist/                      # Build output (generated)
│   ├── node_modules/              # Frontend dependencies (generated)
│   ├── public/                    # Static assets
│   │   └── vite.svg              # Vite logo
│   ├── src/                       # Source code
│   │   ├── assets/               # Images, fonts, etc.
│   │   │   └── react.svg        # React logo
│   │   ├── components/           # Reusable React components
│   │   │   └── ProtectedRoute.jsx # Route protection component
│   │   ├── context/              # React Context providers
│   │   │   ├── AuthContext.jsx  # Authentication context
│   │   │   └── ThemeContext.jsx # Theme (dark/light) context
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── .gitkeep         # Placeholder for future hooks
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboard.jsx    # Dashboard page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Whiteboard.jsx   # Main whiteboard component
│   │   │   └── Whiteboard.css   # Whiteboard styles
│   │   ├── services/             # API and service utilities
│   │   │   ├── .gitkeep         # Placeholder
│   │   │   └── socket.js        # Socket.io client setup
│   │   ├── App.css               # App component styles
│   │   ├── App.jsx               # Main App component
│   │   ├── index.css             # Global styles
│   │   └── main.jsx              # Application entry point
│   ├── .env                       # Environment variables (local)
│   ├── .env.example               # Environment variables template
│   ├── .gitignore                 # Git ignore rules
│   ├── eslint.config.js           # ESLint configuration
│   ├── index.html                 # HTML template
│   ├── package.json               # Frontend dependencies
│   ├── package-lock.json          # Locked dependencies
│   ├── README.md                  # Frontend documentation
│   └── vite.config.js             # Vite configuration
│
├── config/                        # Backend configuration
│   └── db.js                     # MongoDB connection setup
│
├── controllers/                   # Request handlers
│   ├── authController.js         # Authentication logic
│   ├── googleAuthController.js   # Google OAuth logic
│   ├── healthController.js       # Health check endpoint
│   ├── index.js                  # Controller exports
│   └── roomController.js         # Room management logic
│
├── middleware/                    # Express middleware
│   ├── errorHandler.js           # Global error handler
│   ├── notFound.js               # 404 handler
│   └── protect.js                # JWT authentication middleware
│
├── models/                        # MongoDB models
│   ├── index.js                  # Model exports
│   ├── Room.js                   # Room schema
│   └── User.js                   # User schema
│
├── routes/                        # API routes
│   ├── authRoutes.js             # Authentication routes
│   ├── healthRoutes.js           # Health check routes
│   ├── index.js                  # Route aggregator
│   └── roomRoutes.js             # Room routes
│
├── sockets/                       # Socket.io setup
│   ├── index.js                  # Socket initialization
│   └── socketHandler.js          # Socket event handlers
│
├── node_modules/                  # Backend dependencies (generated)
├── public/                        # Static files served by Express
├── .env                           # Backend environment variables (local)
├── .gitignore                     # Git ignore rules
├── package.json                   # Backend dependencies
├── package-lock.json              # Locked dependencies
├── README.md                      # Project documentation
└── server.js                      # Express server entry point
```

## 🎯 Key Directories Explained

### Frontend (`collabsphere-frontend/`)

#### `src/components/`
Reusable React components that can be used across multiple pages.
- **ProtectedRoute.jsx**: Wrapper component for authenticated routes

#### `src/context/`
React Context API providers for global state management.
- **AuthContext.jsx**: Manages user authentication state
- **ThemeContext.jsx**: Manages light/dark theme state

#### `src/pages/`
Full page components that represent different routes.
- **Login.jsx**: User login page with Google OAuth
- **Register.jsx**: User registration page
- **Dashboard.jsx**: Main dashboard with room creation/joining
- **Whiteboard.jsx**: Collaborative whiteboard with drawing tools

#### `src/services/`
Service layer for API calls and external integrations.
- **socket.js**: Socket.io client configuration and connection management

### Backend (Root Directory)

#### `config/`
Configuration files for various services.
- **db.js**: MongoDB connection setup with Mongoose

#### `controllers/`
Business logic and request handling.
- **authController.js**: Login, register, token management
- **googleAuthController.js**: Google OAuth integration
- **roomController.js**: Room CRUD operations

#### `middleware/`
Express middleware functions.
- **protect.js**: JWT token verification
- **errorHandler.js**: Centralized error handling
- **notFound.js**: 404 error handling

#### `models/`
MongoDB schemas using Mongoose.
- **User.js**: User data model
- **Room.js**: Room data model with canvas state

#### `routes/`
API endpoint definitions.
- **authRoutes.js**: `/api/auth/*` endpoints
- **roomRoutes.js**: `/api/rooms/*` endpoints
- **healthRoutes.js**: `/api/health` endpoint

#### `sockets/`
Real-time communication setup.
- **socketHandler.js**: Socket event handlers for drawing, chat, presence

#### `docs/`
Project documentation and improvement logs.

## 🔧 Configuration Files

### Frontend
- **vite.config.js**: Vite build tool configuration
- **eslint.config.js**: Code linting rules
- **.env**: Environment variables (API URL, Google Client ID)

### Backend
- **server.js**: Express app setup and server initialization
- **.env**: Environment variables (PORT, MONGO_URI, JWT_SECRET, etc.)

## 📦 Dependencies

### Frontend Main Dependencies
- **React 19**: UI library
- **React Router DOM**: Client-side routing
- **Socket.io Client**: Real-time communication
- **Vite**: Build tool and dev server

### Backend Main Dependencies
- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **Socket.io**: Real-time communication
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

## 🚀 Running the Application

### Backend
```bash
npm run dev
```
Runs on: `http://localhost:5000`

### Frontend
```bash
cd collabsphere-frontend
npm run dev
```
Runs on: `http://localhost:5173` or `http://localhost:5174`

## 📝 Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (`collabsphere-frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🎨 Code Organization Principles

1. **Separation of Concerns**: Frontend and backend are separate
2. **Modular Structure**: Each feature has its own file/folder
3. **Reusability**: Components and utilities are reusable
4. **Scalability**: Easy to add new features
5. **Maintainability**: Clear naming and organization

## 📚 Documentation

All documentation is organized in the `docs/` folder:
- Feature improvements
- Bug fixes
- UI/UX changes
- Project structure (this file)

## ✅ Clean Structure Benefits

- Easy to navigate
- Clear separation of concerns
- Scalable architecture
- Well-documented
- No unused files
- Consistent naming conventions
