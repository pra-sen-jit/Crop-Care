# 🚀 Deployment Guide

## Environment Variables Required

Before deploying, make sure you have these environment variables set:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Application URL (update for production)
NEXTAUTH_URL=https://your-domain.com

# Security
BCRYPT_ROUNDS=12
```

## Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings

3. **Deploy**
   - Vercel will automatically deploy on every push to main

## Manual Server Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Database Setup

1. **MongoDB Atlas**
   - Create a cluster at [mongodb.com](https://cloud.mongodb.com)
   - Get connection string
   - Whitelist your deployment IP

2. **Local MongoDB** (Development)
   ```bash
   # Install MongoDB locally
   brew install mongodb/brew/mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

## Email Configuration

1. **SendGrid Setup**
   - Create account at [sendgrid.com](https://sendgrid.com)
   - Verify sender email
   - Get API key
   - For production: verify domain

## Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] Environment variables secured
- [ ] HTTPS enabled in production
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] CORS properly configured

## Performance Optimization

- [ ] Enable compression
- [ ] Configure CDN
- [ ] Optimize images
- [ ] Enable caching headers
- [ ] Monitor performance

## Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Monitor database performance
- [ ] Set up uptime monitoring