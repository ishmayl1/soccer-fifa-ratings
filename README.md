# Cool Soccer For Cool People

A FIFA-style player card showcase app. Admins create and manage player cards; regular users browse, search, and — if assigned as an owner — edit their own card's name and photo.

## Hosting

Deployed as a single service on [Railway](https://railway.app). Express serves the built Vue frontend alongside the API — one URL, no CORS config, no separate frontend host.

| What | Where |
|---|---|
| Frontend + Backend | Railway (one service) |
| Database | MongoDB Atlas free tier |

See [Deployment](#deployment) below for setup steps.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vue 3, Vite, Pinia, Vue Router, Axios, Tailwind CSS |
| Backend | Express.js, MongoDB + Mongoose, JWT, Multer |
| Auth | JWT in localStorage, role-based (admin / user) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit values if needed
npm install
npm run dev            # starts on http://localhost:3000
```

**Default `.env` values:**

| Variable | Default |
|---|---|
| `MONGO_URI` | `mongodb://localhost:27017/soccer-fifa-ratings` |
| `JWT_SECRET` | `super_secret_jwt_key_change_in_prod` |
| `PORT` | `3000` |
| `ADMIN_SECRET` | `admin_secret_123` |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # starts on http://localhost:5173
```

## First-Time Setup

**Register an admin account** (requires the `ADMIN_SECRET` header):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: admin_secret_123" \
  -d '{"username":"admin","email":"admin@example.com","password":"yourpassword"}'
```

**Register a regular user** (no secret header):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"player1@example.com","password":"yourpassword"}'
```

Then log in at `http://localhost:5173`.

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create user (`x-admin-secret` header for admin role) |
| POST | `/api/auth/login` | public | Returns JWT |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/api/players` | JWT | List all players (`?search=name`) |
| GET | `/api/players/:id` | JWT | Single player |
| POST | `/api/players` | admin | Create player |
| PUT | `/api/players/:id` | admin | Full update (stats, owner, etc.) |
| DELETE | `/api/players/:id` | admin | Delete player |
| PATCH | `/api/players/:id/profile` | JWT + owner | Update own card's name + photo only |
| POST | `/api/upload` | JWT | Upload a photo — returns `{ filename }` |
| GET | `/api/players/users/list` | admin | List all users for owner dropdown |

Uploaded files are served at `/uploads/<filename>` (proxied through Vite in dev).

## Roles

**Admin**
- Create, edit, delete any player card
- Assign any user as a card owner
- See edit/delete controls on every card in `/admin`

**User**
- Browse and search all cards
- If assigned as a card's owner: edit their own card's name and photo (pencil icon appears on hover)
- Cannot change stats, position, overall, or ownership

## Card Tiers

| Overall | Tier | Color |
|---|---|---|
| 75 – 99 | Gold | `#b8922a → #f5d577` |
| 65 – 74 | Silver | `#7a7a7a → #c0c0c0` |
| 1 – 64 | Bronze | `#8b5a2b → #cd8c52` |

## Deployment

Everything deploys as one service on Railway. Express builds and serves the Vue frontend alongside the API.

### 1. Get a MongoDB Atlas URI

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Under **Database Access**, create a user with read/write permissions
3. Under **Network Access**, allow `0.0.0.0/0` (all IPs — Railway uses dynamic IPs)
4. Copy the connection string — it looks like `mongodb+srv://user:pass@cluster.mongodb.net/soccer-fifa-ratings`

### 2. Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repo. Railway will detect the root `package.json` automatically.
4. In the Railway dashboard, go to your service → **Variables** and add:

   | Variable | Value |
   |---|---|
   | `MONGO_URI` | Your Atlas connection string |
   | `JWT_SECRET` | Any long random string |
   | `ADMIN_SECRET` | Your chosen admin secret |
   | `NODE_ENV` | `production` |

   > `PORT` is set automatically by Railway — do not override it.

5. Under **Settings → Deploy**, set:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`

6. Deploy. Your app will be live at `https://your-app.up.railway.app`

### 3. Create your admin account

Once live, register an admin via curl (or any HTTP client):

```bash
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your_admin_secret" \
  -d '{"username":"admin","email":"admin@example.com","password":"yourpassword"}'
```

### Production env vars

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string — keep secret |
| `ADMIN_SECRET` | Header value required to create admin accounts |
| `NODE_ENV` | Must be `production` to enable frontend serving |

## Project Structure

```
soccer-fifa-ratings/
├── backend/
│   ├── server.js
│   ├── .env / .env.example
│   ├── config/db.js
│   ├── middleware/auth.js, adminOnly.js
│   ├── models/User.js, Player.js
│   ├── routes/auth.js, players.js, upload.js
│   └── uploads/
└── frontend/src/
    ├── api/axios.js          — Axios instance + JWT interceptor
    ├── router/index.js       — Route guards
    ├── stores/auth.js        — Auth state (Pinia)
    ├── stores/players.js     — Player CRUD + upload (Pinia)
    ├── components/
    │   ├── FifaCard.vue      — The card (3D tilt, gold/silver/bronze)
    │   ├── AppHeader.vue
    │   ├── SearchBar.vue
    │   ├── PlayerFormModal.vue   — Admin: add/edit with live preview
    │   └── ProfileEditModal.vue  — User: name + photo only
    └── views/
        ├── LoginView.vue
        ├── HomeView.vue
        └── AdminView.vue
```
