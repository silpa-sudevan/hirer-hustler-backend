# Quick Start Guide

## Fast Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Cloudinary (Free)
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Go to Dashboard
4. Copy your credentials:
   - Cloud Name
   - API Key  
   - API Secret

### 3. Configure Environment
Create a `.env` file :

```env
MONGODB_URI=mongodb://localhost:27017/job-marketplace
JWT_ACCESS_SECRET=dev-super-secret-access-key-2026
JWT_ACCESS_EXPIRATION=24h
JWT_REFRESH_SECRET=dev-super-secret-refresh-key-2026
JWT_REFRESH_EXPIRATION=7d

# Add your Cloudinary credentials here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

PORT=3000
NODE_ENV=development
```

### 4. Start MongoDB
**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas (cloud):**
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### 5. Run the Application
```bash
npm run start:dev
```

### 6. Test the API
Open http://localhost:3000/api for Swagger documentation

## Quick Test Flow

### 1. Register a Hirer
```bash
POST http://localhost:3000/auth/register
{
  "name": "John Hirer",
  "email": "hirer@test.com",
  "password": "password123",
  "role": "hirer"
}
```

### 2. Register a Hustler
```bash
POST http://localhost:3000/auth/register
{
  "name": "Jane Hustler",
  "email": "hustler@test.com",
  "password": "password123",
  "role": "hustler"
}
```

### 3. Login as Hirer
```bash
POST http://localhost:3000/auth/login
{
  "email": "hirer@test.com",
  "password": "password123"
}
```
Copy the `accessToken` from response.

### 4. Create a Job (as Hirer)
```bash
POST http://localhost:3000/jobs
Authorization: Bearer YOUR_ACCESS_TOKEN
{
  "title": "Full Stack Developer",
  "description": "Need a developer for web app",
  "budget": 5000,
  "requiredSkills": ["React", "Node.js"]
}
```
Copy the job `_id` from response.

### 5. Login as Hustler
```bash
POST http://localhost:3000/auth/login
{
  "email": "hustler@test.com",
  "password": "password123"
}
```

### 6. View Available Jobs
```bash
GET http://localhost:3000/jobs
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 7. Apply to Job (as Hustler)
```bash
POST http://localhost:3000/applications/job/JOB_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

message: "I have 5 years experience..."
expectedCost: 4500
file: [Upload a PDF/DOCX file]
```

### 8. View Applications (as Hirer)
```bash
GET http://localhost:3000/applications/job/JOB_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 9. Select Best Candidate (as Hirer)
```bash
POST http://localhost:3000/jobs/JOB_ID/select-candidate/HUSTLER_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Testing with Swagger UI

1. Go to http://localhost:3000/api
2. Click "Authorize" button
3. Enter: `Bearer YOUR_ACCESS_TOKEN`
4. Test all endpoints directly from the UI

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`

### Cloudinary Upload Error
- Verify Cloudinary credentials in `.env`
- Check if you have internet connection

### JWT Error
- Make sure you're including the Bearer token in Authorization header
- Format: `Authorization: Bearer YOUR_ACCESS_TOKEN`

### Build Error
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Useful Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## Next Steps

- Explore the [README.md](README.md) for complete documentation
- Check Swagger docs at http://localhost:3000/api
- Test all API endpoints
- Review the code structure in `src/` folder

## Support

For issues, check:
1. Console logs for errors
2. MongoDB connection
3. Environment variables
4. Cloudinary credentials

