# 🎙️ PodCraft — Agentic AI Podcast Episode Planning System

PodCraft is an intelligent, agentic AI-based podcast episode planning system designed to automate and streamline the pre-production phase of podcast creation. It helps podcasters research topics, analyze guest backgrounds, and organize complete episode plans — all from a single platform.

This project was developed as part of the **Software Engineering (CSC291)** course at **COMSATS University, Islamabad**.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Modules Implemented](#modules-implemented)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Team](#team)

---

## 📖 Overview

Podcast creators often spend hours on manual research, unstructured planning, and scattered digital tools before recording an episode. PodCraft solves this by using autonomous AI agents that:

- Analyze podcast niche and guest information
- Research relevant, trending topics
- Generate structured episode plans
- Allow bookmarking and refining of research topics

The system is built as a cross-platform web dashboard with a complete **MVC architecture**.

---

## ✅ Modules Implemented

| Module | Description |
|--------|-------------|
| **Module 1 — User Authentication & Profile Management** | Registration, login, JWT-based sessions, account lockout, password recovery, profile and notification settings |
| **Module 2 — User Intent & Guest Analyzer** | Episode niche/topic intake, tone selection, guest profile management with AI-generated guest summaries |
| **Module 3 — Topic Research Agent** | AI-simulated topic research, relevance scoring, category filtering, bookmarking, and rejection of topics |

> Full use cases, functional requirements, and SRS documentation are available in the project report.

---

## 🛠️ Tech Stack

**Frontend**
- React JS (v18+)
- React Router DOM
- Axios
- React Toastify

**Backend**
- Node.js
- Express JS
- JWT (jsonwebtoken)
- bcryptjs

**Database**
- MongoDB (Atlas)
- Mongoose ODM

**Architecture**
- MVC (Model-View-Controller)

---

## 🏗️ Architecture

```
Client (React) ⇄ REST API (Express) ⇄ MongoDB (Mongoose)
```

- **Models** — Mongoose schemas for User, Episode, and Research
- **Controllers** — Business logic for auth, episodes, and research
- **Routes** — Express route definitions
- **Middleware** — JWT-based route protection

---

## 📂 Project Structure

```
podcraft/
├── Backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── episodeController.js
│   │   └── researchController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Episode.js
│   │   └── Research.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── episodeRoutes.js
│   │   └── researchRoutes.js
│   └── server.js
│
├── frontend/
│   └── podcraft-frontend/
│       ├── src/
│       │   ├── components/
│       │   │   └── common/
│       │   │       └── Navbar.js
│       │   ├── context/
│       │   │   └── AuthContext.js
│       │   ├── pages/
│       │   │   ├── Login.js
│       │   │   ├── Register.js
│       │   │   ├── Dashboard.js
│       │   │   ├── EpisodePage.js
│       │   │   ├── ResearchPage.js
│       │   │   ├── ProfilePage.js
│       │   │   └── EpisodeHistoryPage.js
│       │   ├── utils/
│       │   │   └── api.js
│       │   └── App.js
│
└── docs/
    ├── Podcraft_Scope.pdf
    ├── Podcraft_SRS.pdf
    ├── Podcraft_SRS_Presentation.pptx
    ├── Podcraft_Scope_Presentation.pptx
    ├── Podcraft_SDS.pdf
    ├── Podcraft_TestCases.pdf
    └── Podcraft-Final-Report-Presentation.pptx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/asna-154/Podcraft.git
cd Podcraft
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:3000
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend/podcraft-frontend
npm install
```

Create a `.env` file in the `podcraft-frontend` folder (optional, defaults to localhost):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Run the frontend:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

---

## 🔐 Environment Variables

| Variable | Description |
|----------|--------------|
| `PORT` | Backend server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `JWT_EXPIRE` | JWT token expiry duration |
| `FRONTEND_URL` | Allowed origin for CORS |
| `REACT_APP_API_URL` | Base URL the frontend uses to call the backend API |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current logged-in user |
| PUT | `/api/auth/update` | Update account details |
| PUT | `/api/auth/update-password` | Update password |
| POST | `/api/auth/logout` | Logout user |
| DELETE | `/api/auth/delete` | Delete account |

### Episodes
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/episodes` | Create a new episode |
| GET | `/api/episodes` | Get all episodes for logged-in user |
| GET | `/api/episodes/:id` | Get a single episode |
| PUT | `/api/episodes/:id` | Update an episode |
| DELETE | `/api/episodes/:id` | Delete an episode |
| POST | `/api/episodes/:id/guests` | Add a guest to an episode |
| PUT | `/api/episodes/:id/guests/:guestId` | Edit a guest |
| DELETE | `/api/episodes/:id/guests/:guestId` | Delete a guest |
| GET | `/api/episodes/history` | Get completed episode history |

### Research
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/research/generate/:episodeId` | Generate research for an episode |
| POST | `/api/research/refresh/:episodeId` | Refresh research topics |
| GET | `/api/research/:episodeId` | Get research topics for an episode |
| GET | `/api/research/:episodeId/bookmarks` | Get bookmarked topics |
| PUT | `/api/research/:researchId/bookmark` | Bookmark/unbookmark a topic |
| PUT | `/api/research/:researchId/reject` | Reject a topic |

---

## 👥 Team

| Name | Registration No. | Contribution |
|------|-------------------|--------------|
| Asna Hammad | FA23-BDS-051 | Web Dashboard Development |
| Awais Ashraf | FA23-BDS-053 | Mobile App Development |

**Supervisor:** Dr. Tehseen Riaz Abbasi
**Course:** Software Engineering (CSC291)
**Institution:** COMSATS University, Islamabad

---

## 📄 License

This project was developed for academic purposes as part of a university course assignment.
