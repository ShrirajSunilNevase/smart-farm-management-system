# 🌾 Smart Farm Management System

Full-stack web app connecting Farmers and Land Officers.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, React Router v6, Recharts, Lucide Icons
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs

## Quick Start

### 1. Backend
```bash
cd backend
npm install
# Edit .env: set MONGO_URI to your MongoDB connection
node seed.js          # loads sample data
npm run dev           # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev           # starts on http://localhost:3000
```

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Land Officer | admin@smartfarm.com | admin123 |
| Farmer 1 | farmer@demo.com | farmer123 |
| Farmer 2 | suresh@demo.com | farmer123 |
| Farmer 3 | anita@demo.com | farmer123 |

> Run `node seed.js` in the backend folder first.

## Project Structure
```
smart-farm/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/        (User, Land, Crop, Equipment)
│   ├── routes/        (auth, land, crops, equipment, admin)
│   ├── seed.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/ (AuthLayout, FarmerLayout, AdminLayout)
        ├── context/    (AuthContext)
        ├── pages/      (Landing, Login, Register, Dashboards)
        └── utils/      (api.js)
```

## API Overview
- `POST /api/auth/register` - Farmer registration
- `POST /api/auth/login` - Login (farmer or admin)
- `GET/POST/PUT/DELETE /api/land` - Land management
- `GET/POST/PUT/DELETE /api/crops` - Crop management
- `GET/POST/PUT/DELETE /api/equipment` - Equipment management
- `PUT /api/land/:id/verify` - Admin: approve/reject land
- `GET /api/admin/stats` - Admin dashboard stats
- `GET /api/admin/farmers` - All farmers list

## Features
- Role-based auth (Farmer / Land Officer)
- Farmer: manage land, crops, equipment, view notifications
- Admin: analytics dashboard, land verification with remarks, crop monitoring
- Responsive design: mobile, tablet, desktop

---

## 🚀 Deploy to Vercel

This project is configured for **one-click Vercel deployment** with the frontend served as a static site and the backend running as a Vercel Serverless Function.

### Prerequisites
1. A **MongoDB Atlas** account with a cloud cluster (free tier works).  
   Get your connection string from: Atlas → Clusters → Connect → Drivers

### Steps

1. **Push to GitHub** — make sure `smart-farm/` is at the root of your repo.

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
   - Set the **Root Directory** to `smart-farm`

3. **Set Environment Variables** in Vercel dashboard  
   (Project → Settings → Environment Variables):

   | Variable | Value |
   |----------|-------|
   | `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/smart-farm` |
   | `JWT_SECRET` | A long random string |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |

4. Click **Deploy** — Vercel will:
   - Build the React frontend (`frontend/dist`)
   - Deploy the Express API as a serverless function (`api/index.js`)
   - Route `/api/*` → serverless backend, everything else → React app

### File Structure for Vercel
```
smart-farm/          ← Set as "Root Directory" in Vercel
├── api/
│   └── index.js    ← Serverless function entry point
├── backend/        ← Express app (required by api/index.js)
├── frontend/       ← Vite/React (built to frontend/dist)
└── vercel.json     ← Routing config
```

> **Note**: The `.env` file is for local development only. Never commit it.  
> Set all secrets via the Vercel dashboard Environment Variables.
