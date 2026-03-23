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
