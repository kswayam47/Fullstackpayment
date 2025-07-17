# Full-Stack Payment Dashboard App

A secure, mobile-first dashboard for managing payments, built with React Native (Expo) and NestJS.

---

## 🚀 Project Overview

**Features:**
- View and filter payment transactions
- Simulate new payments
- View payment trends and metrics
- Manage users (admin view)
- JWT-based authentication
- Real-time updates (WebSockets)
- Optional: Export to CSV, push notifications, basic tests

---

## 🛠️ Tech Stack

| Layer     | Tech                          |
|-----------|------------------------------|
| Frontend  | React Native (Expo)           |
| Backend   | NestJS                        |
| Auth      | JWT                           |
| Database  | PostgreSQL (default)          |
| Charts    | react-native-chart-kit        |
| Realtime  | WebSockets (socket.io, Redis optional) |

---

## ✨ Features

### Frontend (React Native)
- **Login/Register**: Secure JWT auth, role selection
- **Dashboard**: Key metrics (total payments, revenue, failed count), line chart, recent activity, navigation
- **Transactions List**: Paginated, filterable by date/status/method, tap for details
- **Add Payment**: Form for amount, receiver, status, method
- **User Management**: (Admin only) List, delete users
- **Payment Stats**: Revenue trends chart

### Backend (NestJS)
- **Auth Module**:
  - `POST /auth/login` (JWT, bcrypt, role support)
- **Payments Module**:
  - `GET /payments` (filters, pagination)
  - `GET /payments/:id`
  - `POST /payments`
  - `GET /payments/stats`
  - (WebSocket) Real-time payment events
- **Users Module**:
  - `GET /users` (admin only)
  - `POST /users` (register)
  - `DELETE /users/:id` (admin only)
  - `GET /users/list?q=` (search/autocomplete)

---

## ⚡ Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (or MongoDB, but default is Postgres)
- Yarn or npm

### 1. Clone the Repo
```sh
git clone <your-repo-url>
cd Interndemo
```

### 2. Backend Setup (NestJS)
```sh
cd server
cp .env.example .env   # Edit DB credentials as needed
npm install
npm run seed           # Seeds demo users/payments
npm run start:dev
```
- Runs on `http://localhost:3000`

### 3. Frontend Setup (React Native)
```sh
cd ../client
npm install
npx expo start
```
- Runs on Expo Go app or web (`http://localhost:19006`)

---

## 📚 API Endpoints

### Auth
- `POST /auth/login` — `{ username, password }` → `{ access_token, user }`

### Payments
- `GET /payments?status=&method=&startDate=&endDate=&page=&limit=`
- `GET /payments/:id`
- `POST /payments` — `{ amount, receiverId, status, method }`
- `GET /payments/stats`

### Users
- `POST /users` — `{ username, password, role }`
- `GET /users` (admin only)
- `DELETE /users/:id` (admin only)
- `GET /users/list?q=`

---

## 🧑‍💻 Sample Credentials

| Username | Password   | Role   |
|----------|------------|--------|
| admin    | admin123   | admin  |
| user     | user123    | user   |
| alice    | demo123    | user   |
| ...      | ...        | ...    |

---

## 🎁 Bonus Features

- Real-time dashboard updates (WebSockets)
- Export transactions to CSV
- Push notifications (simulated)
- Basic tests (Jest + Supertest)

---

## 📁 Folder Structure

```
Interndemo/
  client/    # React Native app (Expo)
    app/
    components/
    services/
    utils/
  server/    # NestJS backend
    src/
      auth/
      users/
      payments/
      common/
```

---

## 🎯 Learning Outcomes

- Mobile UI (React Native)
- JWT Auth & secure storage
- REST API integration
- State management, navigation, forms
- Charts & data visualization
- Backend modules, validation, auth

---
## 📸 Screenshots / Demo

(Add screenshots or a video here)

---


