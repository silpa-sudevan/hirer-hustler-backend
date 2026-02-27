# Job Marketplace API - NestJS Backend

A complete job marketplace backend API built with NestJS, MongoDB, and TypeScript. This application enables two types of users (Hirers and Hustlers) to interact: Hirers can post jobs, and Hustlers can apply with supporting documents.

##  Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Hirer and Hustler roles)
- Secure user registration and login
- Password reset functionality

### For Hirers
- Register and login as a Hirer
- Post jobs with title, description, budget, and required skills
- View all posted jobs
- View all applicants for their jobs
- Select the best candidate for a job
- Update job status (Open → In Progress → Closed)
- Update or delete their own jobs

### For Hustlers
- Register and login as a Hustler
- Browse all open jobs
- Apply to jobs with:
  - A short message
  - Expected cost
  - Supporting file upload (resume/portfolio)
- View all their applications with status
- Delete pending applications

### File Management
- File uploads to **Cloudinary** (free cloud storage service)
- Automatic file deletion when application is removed
- Support for various file formats (PDF, DOCX, images, etc.)

##  Tech Stack

- **Framework:** NestJS 10.x
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (Passport)
- **File Storage:** Cloudinary
- **Validation:** class-validator, class-transformer
- **API Documentation:** Swagger/OpenAPI

##  Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account (free tier available)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally from https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  # Windows
  net start MongoDB
  
  # macOS/Linux
  sudo systemctl start mongod
  ```

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get your connection string
- Whitelist your IP address

### 4. Set up Cloudinary

1. Create a free account at https://cloudinary.com/users/register/free
2. Go to your Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 5. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/job-marketplace
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job-marketplace

# JWT Configuration (Change these in production!)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRATION=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 6. Run the application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the application is running, access the Swagger Api documentation at:
```
http://localhost:3000/api
```

## 🔐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Authenticated |
| POST | `/auth/refresh-token` | Refresh access token | Authenticated |
| POST | `/auth/reset-password` | Reset password | Authenticated |
| POST | `/auth/logout` | Logout user | Authenticated |

### Job Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/jobs` | Create a new job | Hirer only |
| GET | `/jobs` | Get all open jobs | Authenticated |
| GET | `/jobs/my-jobs` | Get hirer's jobs | Hirer only |
| GET | `/jobs/:id` | Get job by ID | Authenticated |
| PATCH | `/jobs/:id` | Update job | Hirer (own jobs) |
| DELETE | `/jobs/:id` | Delete job | Hirer (own jobs) |
| POST | `/jobs/:id/select-candidate/:hustlerId` | Select candidate | Hirer (own jobs) |
| POST | `/jobs/:id/close` | Close job | Hirer (own jobs) |

### Application Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/applications/job/:jobId` | Apply to a job | Hustler only |
| GET | `/applications/job/:jobId` | Get job applications | Hirer (own jobs) |
| GET | `/applications/my-applications` | Get own applications | Hustler only |
| PATCH | `/applications/:id/status/:status` | Update application status | Hirer |
| DELETE | `/applications/:id` | Delete application | Hustler (own) |

## 📝 Usage Examples

### 1. Register as a Hirer

```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "hirer"
}
```

### 2. Register as a Hustler

```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "hustler"
}
```

### 3. Login

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Create a Job (Hirer)

```bash
POST http://localhost:3000/jobs
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Full Stack Developer Needed",
  "description": "Looking for an experienced developer to build a web application",
  "budget": 5000,
  "requiredSkills": ["React", "Node.js", "MongoDB"]
}
```

### 5. Apply to a Job (Hustler)

```bash
POST http://localhost:3000/applications/job/<job_id>
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "message": "I have 5 years of experience in full stack development...",
  "expectedCost": 4500,
  "file": <upload file>
}
```

### 6. View Applications (Hirer)

```bash
GET http://localhost:3000/applications/job/<job_id>
Authorization: Bearer <access_token>
```

### 7. Select Best Candidate (Hirer)

```bash
POST http://localhost:3000/jobs/<job_id>/select-candidate/<hustler_id>
Authorization: Bearer <access_token>
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── database/               # Database configuration
│   │   └── database.module.ts
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   │   ├── decorator/     # Custom decorators (Roles)
│   │   │   ├── dto/          # Data transfer objects
│   │   │   ├── guards/       # Auth guards (JWT, Roles)
│   │   │   ├── strategies/   # Passport strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── job/              # Job management module
│   │   │   ├── dto/
│   │   │   ├── job.controller.ts
│   │   │   ├── job.service.ts
│   │   │   └── job.module.ts
│   │   ├── application/      # Application module
│   │   │   ├── dto/
│   │   │   ├── application.controller.ts
│   │   │   ├── application.service.ts
│   │   │   └── application.module.ts
│   │   └── common/           # Shared services
│   │       ├── services/
│   │       │   └── cloudinary.service.ts
│   │       └── common.module.ts
│   ├── schemas/              # MongoDB schemas
│   │   ├── user.schema.ts
│   │   ├── job.schema.ts
│   │   └── application.schema.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── .env                      # Environment variables (create from .env.example)
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

##  Database Schema

### User Schema
```typescript
{
  email: string (unique, required)
  name: string
  password: string (hashed)
  role: 'hirer' | 'hustler' (required)
  isActive: boolean
  timestamps: true
}
```

### Job Schema
```typescript
{
  title: string (required)
  description: string (required)
  budget: number (required)
  requiredSkills: string[] (required)
  status: 'open' | 'in_progress' | 'closed'
  hirerId: ObjectId (ref: User)
  selectedHustlerId: ObjectId (ref: User)
  isDeleted: boolean
  timestamps: true
}
```

### Application Schema
```typescript
{
  jobId: ObjectId (ref: Job, required)
  hustlerId: ObjectId (ref: User, required)
  message: string (required)
  expectedCost: number (required)
  fileUrl: string (required)
  status: 'pending' | 'accepted' | 'rejected'
  isDeleted: boolean
  timestamps: true
}
```

## 🔒 Security Features

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Role-based access control (RBAC)
- Input validation using class-validator
- MongoDB injection prevention via Mongoose
- Secure file uploads with type validation

##  File Storage Service

This application uses **Cloudinary** for file storage:

- **Service:** Cloudinary (https://cloudinary.com/)
- **Tier:** Free tier available (25 credits/month, 25GB storage)
- **Features:**
  - Automatic file optimization
  - CDN delivery
  - Multiple format support
  - Secure URL generation
  - Easy file management

### Why Cloudinary?
- ✅ Free tier with generous limits
- ✅ Easy integration
- ✅ Automatic backups
- ✅ CDN for fast file delivery
- ✅ No server storage required

##  Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Environment Variables for Production

Make sure to update these in production:

1. Generate strong JWT secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Use MongoDB Atlas for database
3. Set `NODE_ENV=production`
4. Update CORS settings in `main.ts` if needed

### Deploy to platforms like:
- Heroku
- Railway
- Render
- AWS
- DigitalOcean

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using NestJS

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Note:** Remember to never commit your `.env` file to version control. The `.env.example` file is provided as a template.




