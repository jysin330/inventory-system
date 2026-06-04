# StockFlow — Inventory & Order Management System

A full-stack inventory and order management system built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python 3.12, FastAPI |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

---

## Features

- **Product Management** — CRUD with unique SKU enforcement
- **Customer Management** — CRUD with unique email enforcement
- **Order Management** — Create orders with automatic stock deduction
- **Inventory Validation** — Orders blocked if stock is insufficient
- **Dashboard** — Stats, low-stock alerts, recent orders
- **Fully containerized** — One command to run everything

---

## Quick Start (Docker)

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose installed

### Run locally

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd inventory-system

# 2. Copy env file
cp .env.example .env

# 3. Start all services
docker compose up --build

# Frontend → http://localhost:3000
# Backend API → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products/ | List all products |
| POST | /products/ | Create product |
| GET | /products/{id} | Get product |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /customers/ | List all customers |
| POST | /customers/ | Create customer |
| GET | /customers/{id} | Get customer |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /orders/ | List all orders |
| POST | /orders/ | Create order |
| GET | /orders/{id} | Get order details |
| DELETE | /orders/{id} | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/ | Get summary stats |

---

## Business Rules

- Product SKUs must be unique
- Customer emails must be unique  
- Product quantity cannot go negative
- Orders fail if requested quantity exceeds available stock
- Creating an order automatically reduces stock
- Cancelling an order restores stock
- Order total is calculated automatically by backend

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `ALLOWED_ORIGINS` — your frontend URL

### Database — Render PostgreSQL

1. Create a new **PostgreSQL** database on Render
2. Copy the **Internal Database URL** and use it as `DATABASE_URL` in your backend service

### Frontend — Vercel

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend/`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` — your deployed backend URL (e.g. `https://your-api.onrender.com`)

### Docker Hub

```bash
# Build and push backend image
docker build -t yourusername/stockflow-backend ./backend
docker push yourusername/stockflow-backend

# Build and push frontend image (with API URL)
docker build --build-arg VITE_API_URL=https://your-api.onrender.com \
  -t yourusername/stockflow-frontend ./frontend
docker push yourusername/stockflow-frontend
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/inventory_db` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `*` |
| `VITE_API_URL` | Backend API URL (build-time for frontend) | `http://localhost:8000` |
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `inventory_db` |

---

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL environment variable
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```
