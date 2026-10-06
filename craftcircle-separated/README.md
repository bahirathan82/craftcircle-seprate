# CraftCircle — Prototype (Separate Frontend & Backend, No Database)

Two independent Node projects in one folder:

```
backend/     Express API, in-memory data store (no MongoDB, no setup)
frontend/    Static HTML/CSS/JS, served by a zero-dependency Node server
```

They run as two separate processes on two separate ports and talk to each
other over HTTP — the frontend calls the backend's REST API.

> **Data resets on every backend restart.** Everything (users, tutorials,
> products, carts, orders) lives in server memory, not a database.

## Run it

Open **two terminals**:

```bash
# Terminal 1 — backend (API on port 5000)
cd backend
npm install
npm start
```

```bash
# Terminal 2 — frontend (static site on port 3000)
cd frontend
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

On StackBlitz: open both `backend` and `frontend` in separate terminal tabs
and run the same two commands — StackBlitz's WebContainer runs them as
separate processes on separate ports within the same project, and
`http://localhost:5000` calls from the frontend reach the backend
automatically.

## Demo accounts

The backend seeds demo data every time it starts:

| Role  | Email                     | Password      |
|-------|---------------------------|---------------|
| Admin | `admin@craftcircle.test`  | `admin123`    |
| User  | `maya@craftcircle.test`   | `password123` |
| User  | `sam@craftcircle.test`    | `password123` |

Two sample tutorials and two sample marketplace products are also seeded.

## If you change the backend's port

The frontend calls the API at a fixed address set in `frontend/script.js`:

```js
const API_BASE = window.CRAFTCIRCLE_API_BASE || 'http://localhost:5000/api';
```

If you run the backend on a different port, either change that line, or set
`window.CRAFTCIRCLE_API_BASE` before `script.js` loads (e.g. a small inline
`<script>` tag in `index.html`).

## backend/ — structure

```
server.js            App entry point — seeds data, mounts /api routes
data/
  store.js             The in-memory "database" — plain arrays, nothing else
  seed.js               Populates demo data on startup
models/               Plain JS data-access functions per entity (no ORM)
middleware/            auth (JWT check + adminOnly), errorHandler
controllers/            business logic per module
routes/                  Express routers
utils/generateToken.js  JWT signing/verification secret + helper
```

### API reference

All routes are mounted under `/api` on the backend (`http://localhost:5000`).

**User Management** — `/api/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Log in, returns JWT |
| GET | `/me` | user | Get own profile |
| PUT | `/me` | user | Update name/bio/avatar |

**DIY Tutorial Management** — `/api/tutorials`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/?search=&category=&page=&limit=` | — | List/search tutorials |
| GET | `/:id` | — | Tutorial detail |
| POST | `/` | user | Upload a tutorial |
| PUT | `/:id` | owner/admin | Edit tutorial |
| DELETE | `/:id` | owner/admin | Delete tutorial |
| PUT | `/:id/like` | user | Like / unlike |
| POST | `/:id/comments` | user | Add comment |

**Marketplace** — `/api/products`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/?search=&category=&page=&limit=` | — | Browse/search products |
| GET | `/:id` | — | Product detail |
| POST | `/` | user | List a product |
| PUT | `/:id` | owner/admin | Edit listing |
| DELETE | `/:id` | owner/admin | Remove listing |

**Shopping Cart** — `/api/cart` (requires login)
| Method | Route | Description |
|---|---|---|
| GET | `/` | View cart |
| POST | `/` `{ productId, quantity }` | Add item |
| PUT | `/:productId` `{ quantity }` | Update quantity |
| DELETE | `/:productId` | Remove item |
| DELETE | `/` | Clear cart |

**Order Management** — `/api/orders` (requires login)
| Method | Route | Description |
|---|---|---|
| POST | `/` `{ shippingAddress }` | Checkout current cart to an order |
| GET | `/` | List own orders |
| GET | `/:id` | Order detail (owner or admin) |

**Admin Panel** — `/api/admin` (requires admin JWT)
| Method | Route | Description |
|---|---|---|
| GET | `/stats` | Dashboard counts |
| GET | `/users` | List all users |
| PUT | `/users/:id/status` `{ isActive }` | Activate/deactivate user |
| GET | `/orders` | List all orders |
| PUT | `/orders/:id/status` `{ status }` | Update order status |
| PUT | `/products/:id/approval` `{ isApproved }` | Approve/hide a listing |

## frontend/ — structure

```
server.js       Zero-dependency static file server (just Node's http/fs)
index.html      App shell — Home / Tutorials / Marketplace / Cart / Orders / Admin
style.css        Terracotta craft theme
script.js         Fetch-based SPA logic; JWT stored in localStorage
```

No build step, no framework, no `npm install` downloads anything (the
frontend has zero dependencies) — just plain JS served as-is.

## Adding a real database later

Each file in `backend/models/` exposes the same shape (`create`, `findById`,
`findAll`, `save`, `remove`, etc.) that the controllers call — swapping in a
real database later means rewriting the *inside* of these functions (e.g.
MongoDB/Mongoose, or Postgres/Prisma) without touching controllers or routes.
