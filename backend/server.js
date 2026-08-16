import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize SQLite database (synchronous)
connectDB();

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Inkly API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
