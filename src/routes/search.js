import express from 'express';
import Recipe from '../models/Recipe.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q, ingredients, cuisine, dietary, mealType, minRating } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (ingredients) {
    const list = Array.isArray(ingredients) ? ingredients : String(ingredients).split(',');
    filter.ingredients = { $all: list.map((s) => new RegExp(s.trim(), 'i')) };
  }
  if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' };
  if (mealType) filter.mealType = mealType;
  if (dietary) {
    const list = Array.isArray(dietary) ? dietary : String(dietary).split(',');
    filter.dietary = { $all: list };
  }
  if (minRating !== undefined) {
    const ratingNum = Number(minRating);
    if (!Number.isNaN(ratingNum)) {
      filter.averageRating = { $gte: ratingNum };
    }
  }

  const results = await Recipe.find(filter).sort('-averageRating').limit(50).populate('author', 'name');
  res.json(results);
});

export default router;


