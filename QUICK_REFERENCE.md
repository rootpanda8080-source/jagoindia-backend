# JagoIndia Backend - Quick Reference Card

## 🚀 Getting Started (Copy & Paste)

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Create admin user (email: admin@jagoindia.com, password: admin123456)
npm run create-admin

# Seed sample blogs (optional)
npm run seed

# Start development server
npm run dev
```

Server: http://localhost:5000

---

## 📡 API Quick Reference

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jagoindia.com","password":"admin123456"}'
```

### Get All Blogs
```bash
curl http://localhost:5000/api/blogs
```

### Get Single Blog
```bash
curl http://localhost:5000/api/blogs/blog-slug
```

### Create Blog (requires token)
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"My Blog",
    "content":"Content here",
    "thumbnail":"https://image.jpg",
    "status":"published"
  }'
```

### Update Blog
```bash
curl -X PUT http://localhost:5000/api/blogs/BLOG_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated","content":"New content"}'
```

### Change Blog Status
```bash
curl -X PATCH http://localhost:5000/api/blogs/BLOG_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"disabled"}'
```

### Delete Blog
```bash
curl -X DELETE http://localhost:5000/api/blogs/BLOG_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/jagoindia
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 📝 npm Scripts

```bash
npm run dev           # Development with auto-reload
npm start             # Production mode
npm run create-admin  # Create admin user
npm run seed          # Seed sample blogs
```

---

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: "admin",
  isActive: Boolean,
  createdAt, updatedAt
}
```

### Blog
```javascript
{
  title: String,
  slug: String (auto-generated),
  content: String,
  thumbnail: String,
  status: "published" | "disabled",
  views: Number,
  author: ObjectId (User ref),
  createdAt, updatedAt
}
```

---

## ⚡ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check MONGODB_URI in .env, ensure mongod is running |
| Cannot create admin | Verify MongoDB is connected, check email isn't duplicate |
| 401 Unauthorized | Verify JWT token is valid, check Authorization header format |
| 403 Forbidden | Ensure user is admin and account is active |
| 404 Not Found | Check endpoint path and HTTP method |

---

## 🔐 Security

- Passwords: Hashed with bcryptjs (10 rounds)
- Auth: JWT tokens (7-day expiry)
- Headers: `Authorization: Bearer <token>`
- CORS: Enabled (configure in server.js)
- Validation: Input & email format checked

---

## 📂 File Locations

| File | Purpose |
|------|---------|
| server.js | Main entry point |
| config/db.js | Database connection |
| models/User.js | Admin schema |
| models/Blog.js | Blog schema |
| controllers/auth.controller.js | Login logic |
| controllers/blog.controller.js | Blog CRUD |
| routes/auth.routes.js | Auth endpoints |
| routes/blog.routes.js | Blog endpoints |
| middleware/auth.middleware.js | JWT check |
| middleware/admin.middleware.js | Admin check |
| utils/errorHandler.js | Error handling |

---

## 🧪 Testing with Postman

1. Import `postman-collection.json`
2. Set variable: `baseUrl = http://localhost:5000`
3. Login to get token
4. Set variable: `token = <received_jwt>`
5. Test all endpoints

---

## 🌐 Frontend Integration

```javascript
const API = 'http://localhost:5000/api';

// Login
const res = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await res.json();

// Protected request
const res = await fetch(`${API}/blogs`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(blogData)
});
```

---

## 📊 Response Format

All API responses:
```json
{
  "success": true|false,
  "message": "Description",
  "data": { /* actual data */ }
}
```

---

## 🚢 Deployment

### Heroku
```bash
heroku create APP_NAME
heroku config:set MONGODB_URI=<uri> JWT_SECRET=<secret>
git push heroku main
```

### Docker
```bash
docker build -t jagoindia .
docker run -e MONGODB_URI=<uri> -p 5000:5000 jagoindia
```

---

## 📖 Documentation

- **README.md** - Full API documentation
- **SETUP.md** - Detailed setup guide
- **DEPLOYMENT.md** - Production deployment
- **SUMMARY.md** - Project overview

---

## 🆘 Support

1. Check documentation files
2. Review error message
3. Check MongoDB connection
4. Verify .env configuration
5. Review console logs

---

**Happy coding! 🎉**
