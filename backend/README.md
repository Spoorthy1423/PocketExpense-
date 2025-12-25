# Backend Setup

## Quick Start

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

Server will run on `http://localhost:8082`

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/sync` - Sync expenses
- `POST /api/expenses/sync-pending` - Sync pending expenses
- `GET /api/expenses/aggregate/daily?date=2024-01-15` - Daily expenses
- `GET /api/expenses/aggregate/monthly?month=2024-01` - Monthly expenses

## Note

This is a simple in-memory backend for development. For production, use a database (MongoDB, PostgreSQL, etc.).
