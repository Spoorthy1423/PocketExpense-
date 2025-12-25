const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.BACKEND_PORT || 8082;

app.use(cors());
app.use(express.json());

let expenses = [];
let users = [];

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'All fields required' });
  }
  const user = {
    id: Date.now().toString(),
    email,
    name,
  };
  users.push(user);
  const token = `token_${Date.now()}`;
  res.json({ success: true, user, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }
  let user = users.find(u => u.email === email);
  if (!user) {
    user = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
    };
    users.push(user);
  }
  const token = `token_${Date.now()}`;
  res.json({ success: true, user, token });
});

app.get('/api/expenses', (req, res) => {
  res.json({ expenses });
});

app.post('/api/expenses', (req, res) => {
  const expense = {
    id: Date.now().toString(),
    ...req.body,
  };
  expenses.push(expense);
  res.json({ success: true, expense });
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Expense not found' });
  }
  expenses[index] = { ...expenses[index], ...req.body };
  res.json({ success: true, expense: expenses[index] });
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  expenses = expenses.filter(e => e.id !== id);
  res.json({ success: true });
});

app.post('/api/expenses/sync', (req, res) => {
  const { expenses: syncedExpenses } = req.body;
  if (Array.isArray(syncedExpenses)) {
    syncedExpenses.forEach(exp => {
      const existing = expenses.findIndex(e => e.id === exp.id);
      if (existing === -1) {
        expenses.push(exp);
      } else {
        expenses[existing] = exp;
      }
    });
  }
  res.json({ success: true, message: `Synced ${syncedExpenses?.length || 0} expenses` });
});

app.post('/api/expenses/sync-pending', (req, res) => {
  const { expenses: pendingExpenses } = req.body;
  if (Array.isArray(pendingExpenses)) {
    pendingExpenses.forEach(exp => {
      const existing = expenses.findIndex(e => e.id === exp.id);
      if (existing === -1) {
        expenses.push(exp);
      } else {
        expenses[existing] = exp;
      }
    });
  }
  res.json({ success: true, message: `Synced ${pendingExpenses?.length || 0} pending expenses` });
});

app.get('/api/expenses/aggregate/daily', (req, res) => {
  const { date } = req.query;
  const dailyExpenses = expenses.filter(e => {
    const expDate = new Date(e.date).toDateString();
    return expDate === new Date(date).toDateString();
  });
  const total = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
  res.json({ date, total, expenses: dailyExpenses });
});

app.get('/api/expenses/aggregate/monthly', (req, res) => {
  const { month } = req.query;
  const [year, monthNum] = month.split('-').map(Number);
  const monthlyExpenses = expenses.filter(e => {
    const expDate = new Date(e.date);
    return expDate.getFullYear() === year && expDate.getMonth() === monthNum - 1;
  });
  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryBreakdown = {};
  monthlyExpenses.forEach(e => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
  });
  res.json({ month, total, categoryBreakdown, expenses: monthlyExpenses });
});

const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.log('To fix this, run: lsof -ti:8082 | xargs kill -9');
    process.exit(1);
  } else {
    throw error;
  }
});

