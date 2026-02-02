# JagoIndia Backend - Setup Guide

## Complete Backend Implementation

This is a production-ready, full-featured blog backend with:
- ✅ Admin authentication (JWT)
- ✅ Complete blog CRUD API
- ✅ MongoDB with Mongoose ORM
- ✅ Security best practices
- ✅ Error handling
- ✅ Clean architecture

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# Make sure MONGODB_URI points to your MongoDB instance
```

### Step 3: Start MongoDB
```bash
# If using local MongoDB
mongod

# OR if using MongoDB Atlas, update MONGODB_URI in .env with:
# mongodb+srv://username:password@cluster.mongodb.net/jagoindia
```

### Step 4: Create Admin User
```bash
npm run create-admin
```
This creates a default admin:
- Email: `admin@jagoindia.com`
- Password: `admin123456`

### Step 5: Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

---

## Project Structure

```
jagoindia-backend/
├── server.js                      # Main entry point
├── .env                           # Environment (local, not in git)
├── .env.example                   # Environment template
├── package.json                   # Dependencies & scripts
├── README.md                      # Full documentation
├── .gitignore                     # Git ignore rules
│
├── config/
│   └── db.js                      # MongoDB connection
│
├── models/
│   ├── User.js                    # Admin user schema
│   └── Blog.js                    # Blog post schema
│
├── controllers/
│   ├── auth.controller.js         # Login logic
│   └── blog.controller.js         # CRUD operations
│
├── routes/
│   ├── auth.routes.js             # /api/auth endpoints
│   └── blog.routes.js             # /api/blogs endpoints
│
├── middleware/
│   ├── auth.middleware.js         # JWT verification
│   └── admin.middleware.js        # Admin role check
│
├── utils/
│   └── errorHandler.js            # Global error handler
│
└── scripts/
    └── createAdmin.js             # Admin creation script
```

---

## API Reference

### Authentication

**Login (Admin Only)**
```
POST /api/auth/login

{
  "email": "admin@jagoindia.com",
  "password": "admin123456"
}

Returns: { token, user }
```

**Get Current User**
```
GET /api/auth/me
Headers: Authorization: Bearer <token>

Returns: { user }
```

### Blogs (Public)

**Get All Blogs**
```
GET /api/blogs?page=1&limit=10&sort=-createdAt

Returns: { blogs, pagination }
```

**Get Single Blog**
```
GET /api/blogs/:slug

Returns: { blog }
Note: Increments view count
```

### Blogs (Admin Only)

**Create Blog**
```
POST /api/blogs
Headers: Authorization: Bearer <token>

{
  "title": "My Blog",
  "content": "Content here...",
  "thumbnail": "https://image.jpg",
  "status": "published"
}

Returns: { blog }
```

**Update Blog**
```
PUT /api/blogs/:blogId
Headers: Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": "New content...",
  "thumbnail": "https://image.jpg",
  "status": "published"
}

Returns: { blog }
```

**Change Blog Status**
```
PATCH /api/blogs/:blogId/status
Headers: Authorization: Bearer <token>

{
  "status": "published" // or "disabled"
}

Returns: { blog }
```

**Delete Blog**
```
DELETE /api/blogs/:blogId
Headers: Authorization: Bearer <token>

Returns: { message }
```

---

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("admin"),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Model
```javascript
{
  title: String,
  slug: String (unique, auto-generated),
  content: String,
  thumbnail: String (optional),
  status: String ("published" | "disabled"),
  views: Number,
  author: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

✅ **Password Security**
- Hashed with bcryptjs (10 salt rounds)
- Never returned in API responses
- Compared securely

✅ **Authentication**
- JWT tokens with 7-day expiry
- Bearer token in Authorization header
- Verification middleware on protected routes

✅ **Authorization**
- Admin-only routes protected
- Blog ownership verification
- Role-based access control

✅ **Data Validation**
- Email format validation
- Required field checks
- String length limits
- Enum validation for status

✅ **Error Handling**
- Centralized error middleware
- Consistent error responses
- Sensitive data not exposed
- Proper HTTP status codes

✅ **Database**
- Connection pooling
- Indexed queries
- Mongoose schema validation

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/jagoindia
# For MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/jagoindia

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here (change in production!)
JWT_EXPIRES_IN=7d
```

---

## Common Tasks

### Change Admin Password
```bash
# Connect to MongoDB and run:
use jagoindia
db.users.updateOne(
  { email: "admin@jagoindia.com" },
  { $set: { password: "newHashedPassword" } }
)
```

Better: Use script to hash password:
```javascript
import bcryptjs from 'bcryptjs';
const salt = await bcryptjs.genSalt(10);
const hashed = await bcryptjs.hash('newPassword', salt);
```

### Create Multiple Admins
Edit `scripts/createAdmin.js` and run multiple times with different emails.

### Reset Database
```bash
# In MongoDB
db.dropDatabase()

# Then run create-admin again
npm run create-admin
```

---

## Troubleshooting

### MongoDB Connection Error
- ✅ Check `MONGODB_URI` in `.env`
- ✅ Verify MongoDB is running (`mongod`)
- ✅ Check network connectivity for Atlas

### JWT Token Errors
- ✅ Ensure token is passed as: `Authorization: Bearer <token>`
- ✅ Check `JWT_SECRET` is consistent
- ✅ Token expires in 7 days

### Admin Routes Return 403
- ✅ Verify token is valid
- ✅ Check user exists and has "admin" role
- ✅ Check `isActive` is true

### Blog Slug Not Unique
- ✅ Slug is auto-generated from title
- ✅ Duplicate titles will cause conflict
- ✅ Edit title to make it unique

---

## Performance Tips

- ✅ Blogs list excludes full content (use single-blog endpoint for that)
- ✅ Pagination limits large queries (default 10 per page)
- ✅ Indexed fields: slug, status, createdAt
- ✅ View increments use atomic operation

---

## Frontend Integration Example

```javascript
// React component example
import { useState } from 'react';

const API_URL = 'http://localhost:5000/api';

export function BlogList() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/blogs`)
      .then(r => r.json())
      .then(data => setBlogs(data.blogs));
  }, []);

  return (
    <div>
      {blogs.map(blog => (
        <article key={blog._id}>
          <h2>{blog.title}</h2>
          <p>Views: {blog.views}</p>
        </article>
      ))}
    </div>
  );
}

export function LoginForm() {
  const handleLogin = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const { token } = await res.json();
    localStorage.setItem('token', token);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {/* form inputs */}
    </form>
  );
}
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup `.env` file
3. ✅ Start MongoDB
4. ✅ Create admin: `npm run create-admin`
5. ✅ Start server: `npm run dev`
6. ✅ Test API with Postman/Insomnia
7. ✅ Connect React frontend

---

## Support

- Check [README.md](./README.md) for full documentation
- Review code comments in source files
- Check example .env settings

---

**Backend ready for production! 🚀**
