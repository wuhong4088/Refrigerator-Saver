import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import recipeRoutes from './routes/recipes.js';
import { db } from './db/connector.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/recipes', recipeRoutes);

// Server health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: db ? 'CONNECTED' : 'DISCONNECTED',
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
