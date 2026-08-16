# 🖋️ Inkly — Full-Stack Blog Application

> **Stories worth sharing** — A modern, responsive blog platform built with Node.js, Express, and Vite.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Testing the Application](#testing-the-application)
- [Deployment to GitHub](#deployment-to-github)
- [Developer](#developer)

---

## 🚀 About the Project

**Inkly** is a full-stack blog application where users can register, log in, create blog posts, and explore stories shared by the community. The application features a beautiful, responsive UI built with vanilla HTML/CSS/JavaScript served by Vite, and a RESTful backend powered by Node.js, Express, and SQLite.

This project was built as part of the **Frontend Development Internship — Module 2 (Backend Development)**.

---

## ✨ Features

### Frontend
- 🎨 Beautiful, responsive UI with custom design system
- 📱 Mobile-first responsive design
- 🔄 Client-side routing (SPA behavior)
- 🔔 Toast notifications for user feedback
- 📝 Rich blog editor with title, category, and content
- 🔍 Explore page with category filtering
- 📊 Dashboard with user statistics

### Backend
- 🔐 User registration with validation and duplicate email detection
- 🔑 JWT-based authentication
- 🔒 Password hashing with bcrypt (12 salt rounds)
- 📝 Full CRUD operations for blog posts
- 🛡️ Protected routes with auth middleware
- ✅ Input validation and error handling
- 💾 Persistent SQLite database (zero configuration)

---

## 🛠️ Tech Stack

| Layer      | Technology        | Purpose                        |
|------------|-------------------|--------------------------------|
| Frontend   | HTML, CSS, JS     | User interface                 |
| Bundler    | Vite              | Dev server, HMR, proxy         |
| Backend    | Node.js, Express  | REST API server                |
| Database   | SQLite (better-sqlite3) | Persistent data storage  |
| Auth       | JWT, bcryptjs     | Authentication & security      |
| IDs        | UUID v4           | Unique identifiers             |

---

## 📁 Project Structure

```
inkly-blog-app/
│
├── frontend/                  # Frontend application
│   ├── assets/                # Images and media
│   ├── index.html             # Main HTML (SPA)
│   ├── script.js              # Application logic & API integration
│   ├── styles.css             # Complete styling
│   ├── vite.config.js         # Vite configuration with API proxy
│   └── package.json
│
├── backend/                   # Backend API server
│   ├── config/
│   │   └── db.js              # SQLite database initialization
│   ├── controllers/
│   │   ├── authController.js  # Register, login, getMe logic
│   │   └── blogController.js  # Blog CRUD logic
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js    # Global error handling
│   ├── models/
│   │   ├── User.js            # User database operations
│   │   └── Blog.js            # Blog database operations
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/* routes
│   │   └── blogRoutes.js      # /api/blogs/* routes
│   ├── data/                  # SQLite database file (auto-created)
│   ├── server.js              # Express server entry point
│   ├── .env                   # Environment variables (git-ignored)
│   ├── .env.example           # Environment variable template
│   └── package.json
│
├── .gitignore
├── package.json               # Root workspace scripts
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

> **No database installation required!** SQLite runs as a library — no MongoDB, no PostgreSQL, no setup. The database file is created automatically.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/inkly-blog-app.git
cd inkly-blog-app
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately:
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```env
PORT=5000
JWT_SECRET=your_secret_key_here_change_this
CLIENT_URL=http://localhost:5173
```

### 4. Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
SQLite database connected: .../backend/data/inkly.db
Server running on http://localhost:5000
```

### 5. Start the Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready
➜  Local: http://localhost:5173/
```

### 6. Open the Application

Visit **http://localhost:5173** in your browser. The frontend automatically proxies API requests to the backend.

---

## 🔌 API Endpoints

### Health Check

| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| GET    | `/api/health`   | API health status |

### Authentication

| Method | Endpoint             | Description          | Auth Required |
|--------|----------------------|----------------------|---------------|
| POST   | `/api/auth/register` | Register a new user  | No            |
| POST   | `/api/auth/login`    | Login & get JWT      | No            |
| GET    | `/api/auth/me`       | Get logged-in user   | Yes           |

### Blogs

| Method | Endpoint           | Description            | Auth Required |
|--------|--------------------|------------------------|---------------|
| GET    | `/api/blogs`       | Get all blogs          | No            |
| GET    | `/api/blogs/mine`  | Get current user blogs | Yes           |
| GET    | `/api/blogs/:id`   | Get blog by ID         | No            |
| POST   | `/api/blogs`       | Create a new blog      | Yes           |
| DELETE | `/api/blogs/:id`   | Delete a blog          | Yes           |

### Example API Requests

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","confirmPassword":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Create Blog (with JWT):**
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"My First Blog","category":"Technology","content":"Hello world!"}'
```

---

## 🔐 Environment Variables

| Variable     | Description                          | Default                   |
|--------------|--------------------------------------|---------------------------|
| `PORT`       | Backend server port                  | `5000`                    |
| `JWT_SECRET` | Secret key for JWT signing           | *(required)*              |
| `CLIENT_URL` | Frontend URL for CORS                | `http://localhost:5173`   |

> ⚠️ **Never commit the `.env` file to GitHub.** It is included in `.gitignore`.

---

## 🔑 Authentication Flow

```
1. User fills Registration form
   └── POST /api/auth/register
       └── Server validates input, hashes password (bcrypt), saves user
           └── Returns success → Frontend redirects to Login

2. User fills Login form
   └── POST /api/auth/login
       └── Server verifies credentials
           └── Returns JWT token + user data
               └── Frontend stores token in localStorage
                   └── Redirects to Dashboard

3. Authenticated requests
   └── Frontend includes "Authorization: Bearer <token>" header
       └── Auth middleware verifies JWT, attaches user to request
           └── Protected routes execute normally

4. Logout
   └── Frontend clears localStorage
       └── Redirects to Home
```

---

## 🧪 Testing the Application

### Verification Checklist

After starting both servers, verify the following:

| # | Test                                     | Expected Result                  |
|---|------------------------------------------|----------------------------------|
| 1 | Backend starts                           | `Server running on :5000`        |
| 2 | Database connects                        | `SQLite database connected`      |
| 3 | GET `/api/health`                        | `{ success: true }`             |
| 4 | Register new user                        | 201 Created                      |
| 5 | Register duplicate email                 | 409 Conflict                     |
| 6 | Login with valid credentials             | 200 + JWT token                  |
| 7 | Login with wrong password                | 401 Unauthorized                 |
| 8 | Create blog (authenticated)              | 201 Created                      |
| 9 | Create blog (no token)                   | 401 Unauthorized                 |
| 10| GET `/api/blogs`                         | Lists all blogs                  |
| 11| GET `/api/blogs/mine`                    | Lists user's blogs               |
| 12| GET `/api/blogs/:id`                     | Returns single blog              |
| 13| DELETE `/api/blogs/:id` (owner)          | 200 Deleted                      |
| 14| Frontend registers user                  | Toast + redirect to Login        |
| 15| Frontend logs in                         | Toast + redirect to Dashboard    |
| 16| Frontend creates blog                    | Toast + blog appears on Dashboard|
| 17| Home page shows blogs                    | Blog cards rendered              |
| 18| Explore page filters by category         | Category pills work              |

---

## 📤 Deployment to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Module 2: Full-stack blog application with Node.js, Express, SQLite backend"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/inkly-blog-app.git

# Push
git push -u origin main
```

---

## 👨‍💻 Developer

**Jagadeesh Nayak V**

- 📧 Email: jagadeeshnayakv@gmail.com
- 📞 Phone: 8147011107

---

## 📄 License

This project is built for educational purposes as part of the Frontend Development Internship.

---

<p align="center">
  <strong>inkly.</strong> — Stories worth sharing.
</p>
