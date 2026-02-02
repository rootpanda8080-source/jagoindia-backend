# JagoIndia Backend - Deployment Guide

Production-ready deployment instructions for JagoIndia Backend.

## Pre-Deployment Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update `MONGODB_URI` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Verify all environment variables
- [ ] Run tests
- [ ] Create admin user with strong password
- [ ] Setup SSL/HTTPS
- [ ] Configure CORS for frontend domain
- [ ] Setup logging and monitoring
- [ ] Backup database

## Environment Variables (Production)

```env
# MongoDB - Use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jagoindia?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# JWT - CHANGE THIS! Generate strong secret
JWT_SECRET=generate-random-string-here-minimum-32-characters
JWT_EXPIRES_IN=7d

# CORS - Set frontend domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Email notifications, CDN URLs, etc
```

## Deployment Options

### Option 1: Heroku (Easiest)

```bash
# 1. Install Heroku CLI
# 2. Create Heroku app
heroku create jagoindia-backend

# 3. Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main
```

### Option 2: AWS EC2

```bash
# 1. SSH into EC2 instance
ssh -i key.pem ec2-user@your-instance.compute.amazonaws.com

# 2. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Install MongoDB or use AWS DocumentDB
sudo yum install -y mongodb-server

# 4. Clone repository
git clone your-repo.git
cd jagoindia-backend

# 5. Install dependencies
npm install

# 6. Create .env file with production values
nano .env

# 7. Create admin user
npm run create-admin

# 8. Use PM2 to keep app running
npm install -g pm2
pm2 start server.js --name "jagoindia-backend"
pm2 startup
pm2 save
```

### Option 3: Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t jagoindia-backend .
docker run -e MONGODB_URI=your-uri -e JWT_SECRET=secret -p 5000:5000 jagoindia-backend
```

### Option 4: DigitalOcean App Platform

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect GitHub to DigitalOcean
# 3. Select repository
# 4. Configure environment variables in DigitalOcean dashboard
# 5. Deploy
```

## Security for Production

### 1. HTTPS/SSL
```bash
# Use Let's Encrypt
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

### 2. Rate Limiting
Add to `server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### 3. CORS Configuration
Update `server.js`:
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

### 4. Helmet (Security Headers)
```bash
npm install helmet
```

Add to `server.js`:
```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 5. Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Rotate `JWT_SECRET` periodically
- Keep database credentials secure

## Monitoring & Logging

### Option 1: PM2 Monitoring
```bash
npm install -g pm2
pm2 install pm2-logrotate
pm2 start server.js
pm2 logs
```

### Option 2: New Relic
```bash
npm install newrelic
```

Create `newrelic.js`:
```javascript
exports.config = {
  app_name: ['JagoIndia Backend'],
  license_key: 'your_license_key',
};
```

### Option 3: Datadog
Integrate with Datadog dashboard for monitoring.

## Database Backup

### MongoDB Atlas (Automatic)
- Automatic daily backups
- Point-in-time recovery
- 7-day retention by default

### Manual Backup
```bash
mongodump --uri="mongodb+srv://user:pass@cluster/jagoindia" --out=./backup
mongorestore --uri="mongodb+srv://user:pass@cluster/jagoindia" ./backup
```

## Performance Optimization

### 1. Database Indexing
Indexes are already created in models:
- Blog.slug
- Blog.status
- Blog.createdAt

### 2. Caching
Consider adding Redis for:
```javascript
import redis from 'redis';
const client = redis.createClient();

// Cache blog list
const cached = await client.get('blogs:all');
```

### 3. Content Delivery
- Use CDN for thumbnails (CloudFlare, Cloudinary)
- Update thumbnail URLs in `.env`

### 4. API Optimization
- Pagination enabled (limit 10 blogs per page)
- Selective field queries
- Compression enabled via Express

## Scaling Strategies

### Horizontal Scaling
1. Deploy multiple instances behind load balancer (AWS ELB, Nginx)
2. Use managed MongoDB (Atlas) for distributed database
3. Use sticky sessions or JWT for stateless architecture

### Vertical Scaling
1. Increase server resources (RAM, CPU)
2. Optimize database queries
3. Enable caching layer

## Monitoring Checklist

- [ ] CPU usage < 80%
- [ ] Memory usage < 85%
- [ ] Database response time < 100ms
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%
- [ ] API response time < 500ms

## Health Check Endpoint

```
GET /api/health

Returns:
{
  "status": "OK",
  "message": "JagoIndia Backend is running"
}
```

Use this for load balancer health checks.

## Troubleshooting Production Issues

### High CPU Usage
- Check slow queries: `db.currentOp()`
- Review database indexes
- Check for infinite loops

### Memory Leaks
- Use `clinic.js` to profile
- Check for unclosed connections
- Review middleware chains

### Database Connection Issues
- Check `MONGODB_URI` credentials
- Verify IP whitelist in MongoDB Atlas
- Check connection pool settings

### JWT Token Errors
- Verify `JWT_SECRET` is same across instances
- Check token expiry times
- Monitor clock synchronization

## Disaster Recovery

### In Case of Breach
1. Rotate `JWT_SECRET` immediately
2. Change database password
3. Invalidate all active tokens
4. Review access logs

### In Case of Data Loss
1. Restore from backup
2. Check backup retention policy
3. Update backup schedule

## Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        run: |
          # Your deployment commands
          npm install
          npm test
          # Deploy to production
```

## Cost Optimization

- **Heroku**: ~$7-50/month (including PostgreSQL)
- **AWS EC2**: ~$5-20/month (t3.micro eligible for free tier)
- **DigitalOcean**: ~$4-6/month
- **MongoDB Atlas**: Free tier available (512MB)

## Support & Documentation

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [Heroku Documentation](https://devcenter.heroku.com)
- [AWS EC2 Guide](https://docs.aws.amazon.com/ec2)

---

**Backend production-ready! Deploy with confidence. 🚀**
