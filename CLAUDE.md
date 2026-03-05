# CLAUDE.md — Dev Reference for Cool Soccer For Cool People

Quick reference for adding features, fixing bugs, or onboarding Claude to this codebase.

## Dev Commands

```bash
cd backend && npm run dev      # Express on :3000 (nodemon)
cd frontend && npm run dev     # Vite on :5173
```

Frontend proxies `/api` and `/uploads` to `:3000` via `frontend/vite.config.js`.

## Architecture at a Glance

```
Request → Vite proxy → Express
                        ├── /api/auth/*     routes/auth.js
                        ├── /api/players/*  routes/players.js
                        ├── /api/upload     routes/upload.js
                        └── /uploads/*      static (multer files)
```

**Auth flow:** Login → JWT stored in `localStorage` → Axios interceptor (`src/api/axios.js`) attaches `Authorization: Bearer <token>` to every request → backend `middleware/auth.js` verifies and sets `req.user = { id, role }`.

## Backend

### Models

**`backend/models/User.js`**
```
username, email, password (bcrypt pre-save hook), role ('user' | 'admin')
```
Method: `user.comparePassword(plain)` → Promise\<boolean\>

**`backend/models/Player.js`**
```
name, position, nationality, club, photo (filename), overall (1–99),
stats: { pac, sho, pas, dri, def, phy } (all 1–99),
owner: ObjectId ref User (nullable)
```

### Middleware

- `middleware/auth.js` — verifies JWT, sets `req.user`, returns 401 on failure
- `middleware/adminOnly.js` — checks `req.user.role === 'admin'`, returns 403

### Routes

**`routes/auth.js`**
- `POST /api/auth/register` — role becomes `admin` only if `x-admin-secret` header matches `process.env.ADMIN_SECRET`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` — requires auth

**`routes/players.js`**
- `GET /api/players?search=foo` — regex search on name, sorted by overall desc
- `GET /api/players/:id`
- `POST /api/players` — admin only
- `PUT /api/players/:id` — admin only, full replace
- `DELETE /api/players/:id` — admin only
- `PATCH /api/players/:id/profile` — JWT required; checks `player.owner.toString() === req.user.id` OR admin; **only updates `name` and `photo`**, ignores all other fields
- `GET /api/players/users/list` — admin only, returns `[{ _id, username, email }]`

**`routes/upload.js`**
- `POST /api/upload` — JWT required, multer single file `photo`, returns `{ filename }`
- Files land in `backend/uploads/`, served at `/uploads/<filename>`
- Limits: images only (jpeg/jpg/png/gif/webp), 5 MB max

### Adding a new route
1. Create or edit a file in `backend/routes/`
2. Wire it in `backend/server.js` with `app.use('/api/...', require('./routes/...'))`
3. Apply `auth` and/or `adminOnly` middleware as needed

## Frontend

### Stores (Pinia)

**`stores/auth.js` — `useAuthStore`**
```js
state:   { token, user }
getters: isLoggedIn, isAdmin
actions: login(email, pw), register(username, email, pw, adminSecret?), logout()
```

**`stores/players.js` — `usePlayerStore`**
```js
state:   { players[], loading, error }
actions:
  fetchPlayers(search?)           → populates players[]
  createPlayer(payload)           → prepends to players[]
  updatePlayer(id, payload)       → updates in place
  deletePlayer(id)                → removes from players[]
  updateProfile(id, { name, photo }) → PATCH owner-only endpoint
  uploadPhoto(file)               → POST /api/upload, returns filename string
  fetchUsers()                    → GET /api/players/users/list (admin)
```

### Router (`router/index.js`)

| Route | Guard |
|---|---|
| `/login` | redirect to `/` if already logged in |
| `/` | redirect to `/login` if not logged in |
| `/admin` | redirect to `/` if not admin |

### Components

**`FifaCard.vue`**
- Props: `player` (Player object)
- Photo src logic: `blob:` or `http` or `/` → used directly; otherwise prefixed with `${VITE_API_URL}/uploads/`
- Slot: pass icons/controls as slot content — they render over the card
- Tier: `overall >= 75` → `gold`, `>= 65` → `silver`, else `bronze`
- 3D tilt: `perspective(1000px) rotateX/Y` on mousemove, resets on mouseleave

**`PlayerFormModal.vue`** (admin)
- Props: `show`, `editingPlayer` (null = create mode)
- Emits: `close`, `saved`
- Live preview: `FifaCardPreviewPlayer` computed object passed to FifaCard
- Photo flow: file selected → blob URL for preview → on submit: `uploadPhoto()` → save filename

**`ProfileEditModal.vue`** (card owner)
- Props: `show`, `player`
- Emits: `close`, `saved`
- Same photo flow, calls `updateProfile()` which hits `PATCH /api/players/:id/profile`

**`SearchBar.vue`**
- Emits `search` event with 300ms debounce

### CSS / Styling

Global styles in `frontend/src/style.css`. Key CSS classes:

| Class | Purpose |
|---|---|
| `.fifa-card` | Base card — apply `.gold`, `.silver`, or `.bronze` |
| `.fifa-card-inner` | Inner layout container |
| `.login-bg` | Animated gradient background for login page |
| `.modal-overlay` | Full-screen backdrop for modals |
| `.modal-box` | Modal content box (max-w 560px default) |
| `.fade-*` | Vue `<Transition name="fade">` |
| `.slide-up-*` | Vue `<Transition name="slide-up">` |

Tailwind is loaded via `@import "tailwindcss"` in style.css, using the `@tailwindcss/vite` plugin (not postcss config).

## Adding a New Feature — Checklist

**New backend field on Player:**
1. Add to schema in `backend/models/Player.js`
2. Accept it in `POST /api/players` and `PUT /api/players/:id` in `routes/players.js`
3. If non-admin editable: add to the allowed fields in `PATCH /:id/profile`
4. Update `PlayerFormModal.vue` form + preview player object

**New backend endpoint:**
1. Add route handler in `routes/players.js` (or new route file)
2. Wire in `server.js` if new file
3. Add corresponding action to `stores/players.js`
4. Call from the relevant view/component

**New view:**
1. Create in `frontend/src/views/`
2. Add route in `router/index.js` with appropriate meta guards
3. Include `<AppHeader />` at the top

**New admin-only UI element:**
- Check `auth.isAdmin` from `useAuthStore()` or use `v-if="auth.isAdmin"`

## Env Variables

**Backend (`backend/.env`)**

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Sign/verify JWTs |
| `PORT` | Express port (set automatically by Railway, default 3000 locally) |
| `ADMIN_SECRET` | Header value to grant admin role on register |
| `NODE_ENV` | Set to `production` on Railway to enable frontend static serving |

No frontend env vars needed — in production everything is same-origin.

## Deployment

Hosted on **Railway** as a single service. Build command runs `npm run build` (root `package.json`) which builds `frontend/dist`. Start command runs `node backend/server.js`, which serves the API and — when `NODE_ENV=production` — serves `frontend/dist` as static files with a SPA fallback.

**CORS** is only applied in local dev (when `NODE_ENV !== 'production'`). In production, frontend and backend share the same origin so no CORS header is needed.

**SPA routing** uses `createWebHistory` (clean URLs like `/login`, `/admin`). The Express catch-all `app.get('*', ...)` returns `index.html` for any non-API path, letting Vue Router handle navigation client-side.

Railway build + start config (set in Railway dashboard):
```
Build command: npm run build
Start command: npm start
```

Required Railway env vars: `MONGO_URI`, `JWT_SECRET`, `ADMIN_SECRET`, `NODE_ENV=production`
