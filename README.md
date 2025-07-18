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
| eve      | demo123    | user   |
| alice    | demo123    | user   |
| charlie  | demo123    | user   |

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

<img width="1254" height="967" alt="Screenshot 2025-07-18 165359" src="https://github.com/user-attachments/assets/ec5b45dc-65c9-4a2a-a7e7-16719a4f5ab6" />
<img width="1919" height="472" alt="Screenshot 2025-07-18 160703" src="https://github.com/user-attachments/assets/249c1347-a06a-438e-a72b-90c2da9f1336" />
<img width="1690" height="460" alt="Screenshot 2025-07-18 161340" src="https://github.com/user-attachments/assets/3e5d26a4-f920-43d1-a8f8-48e3afc8371b" />
<img width="1518" height="623" alt="Screenshot 2025-07-18 161619" src="https://github.com/user-attachments/assets/7ed41ded-6c40-4426-86a4-8559652c3e02" />
<img width="1892" height="704" alt="Screenshot 2025-07-18 162143" src="https://github.com/user-attachments/assets/ff65bb06-e57c-4baa-ba15-767313b38709" />
<img width="1914" height="967" alt="Screenshot 2025-07-18 165222" src="https://github.com/user-attachments/assets/2b48e275-2cb0-49a2-9872-878fc9da09ad" />
<img width="1919" height="969" alt="Screenshot 2025-07-18 165238" src="https://github.com/user-attachments/assets/99a2dae6-5ce6-452f-8531-acb7ae1057ec" />
<img width="1919" height="968" alt="Screenshot 2025-07-18 165259" src="https://github.com/user-attachments/assets/178911d2-e801-4811-8f0b-544f898d2819" />
<img width="1919" height="965" alt="Screenshot 2025-07-18 165308" src="https://github.com/user-attachments/assets/ec7174b4-e76d-45ab-a2c7-fa3a49911a0d" />
<img width="1919" height="935" alt="Screenshot 2025-07-18 165320" src="https://github.com/user-attachments/assets/81cf57b8-2931-4c12-8af9-814cca8f1061" />
<img width="1919" height="962" alt="Screenshot 2025-07-18 165340" src="https://github.com/user-attachments/assets/805933a6-dce0-43bb-9321-626883f56d6b" />
<img width="1259" height="965" alt="Screenshot 2025-07-18 165413" src="https://github.com/user-attachments/assets/6261ca42-c784-408c-baa9-db6aa8deb618" />

---


