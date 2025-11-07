// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import morgan from 'morgan';
// import { connectToDatabase } from './utils/db.js';
// import path from 'path';
// import uploadsRoutes from './routes/uploads.js';
// import authRoutes from './routes/auth.js';
// import userRoutes from './routes/users.js';
// import recipeRoutes from './routes/recipes.js';
// import commentRoutes from './routes/comments.js';
// import mealPlanRoutes from './routes/mealplans.js';
// import searchRoutes from './routes/search.js';

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: '10mb' }));
// app.use(morgan('dev'));
// app.use('/uploads', express.static(path.resolve(process.cwd(), 'server', 'uploads')));

// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/recipes', recipeRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/mealplans', mealPlanRoutes);
// app.use('/api/search', searchRoutes);
// app.use('/api/uploads', uploadsRoutes);

// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(err.status || 500).json({ message: err.message || 'Server error' });
// });

// const PORT = process.env.PORT || 5000;

// connectToDatabase()
//   .then(() => {
//     app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
//   })
//   .catch((e) => {
//     console.error('Failed to connect to database', e);
//     process.exit(1);
//   });

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
 
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://jolly-basbousa-3cadfa.netlify.app')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
 
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
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
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Failed to connect to database', e);
    process.exit(1);
  });


