# MongoDB Setup Instructions

## 1. Install MongoDB

**Option A: MongoDB Community Server**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/atlas
- Create free cluster
- Get connection string

## 2. Configure Environment

Update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/notes_app
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes_app
```

## 3. Test Connection

```bash
cd backend
node test-db.js
```

## 4. Start Application

```bash
# Backend
cd backend
npm run dev

# Frontend
npm run dev
```

## MongoDB Collections

The app will automatically create:
- `users` - User accounts
- `notes` - User notes

## Features
✅ MongoDB with Mongoose ODM
✅ Automatic schema validation
✅ ObjectId references
✅ Timestamps (createdAt, updatedAt)
✅ No SQL injection vulnerabilities