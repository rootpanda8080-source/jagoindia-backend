# JagoIndia Backend

Production-ready blog backend built with Node.js, Express, and MongoDB.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables
- **nodemon** - Development server

## Project Structure

```
jagoindia-backend/
├── server.js                 # Express server entry point
├── .env                      # Environment variables (local)
├── .env.example              # Environment variables template
├── package.json              # Dependencies
├── config/
│   └── db.js                # MongoDB connection
├── models/
│   ├── User.js              # User schema (Admin)
│   └── Blog.js              # Blog schema
├── controllers/
│   ├── auth.controller.js   # Authentication logic
│   └── blog.controller.js   # Blog CRUD operations
├── routes/
│   ├── auth.routes.js       # Auth endpoints
│   └── blog.routes.js       # Blog endpoints
├── middleware/
│   ├── auth.middleware.js   # JWT verification
│   └── admin.middleware.js  # Admin authorization
└── utils/
    └── errorHandler.js      # Centralized error handling
```

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd jagoindia-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong secret key for JWT
   - `PORT` - Server port (default: 5000)

4. **Start MongoDB:**
   ```bash
   # Using local MongoDB
   mongod
   ```

## Running the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

**Login (Admin Only)**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@jagoindia.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@jagoindia.com",
    "role": "admin"
  }
}
```

**Get Current User**
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Blogs

**Get All Published Blogs** (PUBLIC)
```
GET /api/blogs?page=1&limit=10&sort=-createdAt
```

**Get Single Blog by Slug** (PUBLIC)
```
GET /api/blogs/:slug
```
Increments view count automatically.

**Create Blog** (ADMIN)
```
POST /api/blogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Blog",
  "content": "Blog content here...",
  "thumbnail": "https://image-url.jpg",
  "status": "published"
}
```

**Update Blog** (ADMIN)
```
PUT /api/blogs/:blogId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "thumbnail": "https://new-image.jpg",
  "status": "published"
}
```

**Toggle Blog Status** (ADMIN)
```
PATCH /api/blogs/:blogId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "published"
}
```

**Delete Blog** (ADMIN)
```
DELETE /api/blogs/:blogId
Authorization: Bearer <token>
```

## Creating an Admin User

Since there's no public registration, create admin manually in MongoDB:

```javascript
// Run in MongoDB CLI or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@jagoindia.com",
  password: "hashed_password", // Use bcrypt to hash
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use a script to create admin with hashed password.

## Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT authentication (7-day expiry)
- ✅ Admin-only routes protected with middleware
- ✅ Email validation & uniqueness
- ✅ Input validation on all endpoints
- ✅ Centralized error handling
- ✅ CORS enabled for frontend integration
- ✅ Sensitive fields excluded from responses

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized (auth failed)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Server Error

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/jagoindia
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## Features

✅ Admin authentication with JWT
✅ Blog CRUD operations
✅ Auto-generate unique slugs from titles
✅ View counter for blogs
✅ Publish/disable blogs
✅ Pagination for blog list
✅ MongoDB indexing for performance
✅ Error handling middleware
✅ CORS support
✅ ES Modules (modern JavaScript)

## Database Schema

### User Schema
- `name` - Admin name
- `email` - Unique email
- `password` - Hashed password
- `role` - Always "admin"
- `isActive` - Account status
- `createdAt`, `updatedAt` - Timestamps

### Blog Schema
- `title` - Blog title
- `slug` - Auto-generated unique slug
- `content` - Blog content
- `thumbnail` - Optional image URL
- `status` - "published" or "disabled"
- `views` - View count (incremented on read)
- `author` - Reference to User (Admin)
- `createdAt`, `updatedAt` - Timestamps

## Frontend Integration

This backend is designed to work with React + Vite frontend.

**API Base URL:** `http://localhost:5000/api`

### Example Frontend Requests:

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Get all blogs
const blogs = await fetch('http://localhost:5000/api/blogs');

// Get single blog
const blog = await fetch('http://localhost:5000/api/blogs/my-blog-slug');

// Create blog (with token)
const newBlog = await fetch('http://localhost:5000/api/blogs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(blogData)
});
```

## License

ISC

## Author

JagoIndia Team
