import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectToDatabase } from './utils/db.js';
import path from 'path';
import uploadsRoutes from './routes/uploads.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';
import commentRoutes from './routes/comments.js';
import mealPlanRoutes from './routes/mealplans.js';
import searchRoutes from './routes/search.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'server', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/uploads', uploadsRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on https://remarkable-daifuku-cebf99.netlify.app/`));
  })
  .catch((e) => {
    console.error('Failed to connect to database', e);
    process.exit(1);
  });


