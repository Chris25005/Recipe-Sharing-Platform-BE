import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [
    body('title').isLength({ min: 2 }),
    body('ingredients').isArray({ min: 1 }),
    body('steps').isArray({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const data = req.body;
    const recipe = await Recipe.create({
      author: req.user.id,
      title: data.title,
      ingredients: data.ingredients,
      steps: data.steps,
      cookingTimeMinutes: data.cookingTimeMinutes || 0,
      servings: data.servings || 1,
      mealType: data.mealType || 'dinner',
      cuisine: data.cuisine || '',
      dietary: data.dietary || [],
      imageUrls: data.imageUrls || [],
      videoUrl: data.videoUrl || ''
    });
    res.status(201).json(recipe);
  }
);

router.get('/', async (req, res) => {
  const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const docs = await Recipe.find()
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('author', 'name avatarUrl');
  res.json(docs);
});

router.get('/:id', async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate('author', 'name avatarUrl');
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json(recipe);
});

router.put('/:id', requireAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (recipe.author.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const fields = [
    'title',
    'ingredients',
    'steps',
    'cookingTimeMinutes',
    'servings',
    'cuisine',
    'mealType',
    'dietary',
    'imageUrls',
    'videoUrl'
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) recipe[f] = req.body[f];
  });
  await recipe.save();
  res.json(recipe);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (recipe.author.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await recipe.deleteOne();
  res.json({ ok: true });
});

router.post('/:id/rate', requireAuth, [body('value').isInt({ min: 1, max: 5 })], async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  const value = Number(req.body.value);
  const existing = recipe.ratings.find((r) => r.user.toString() === req.user.id);
  if (existing) existing.value = value;
  else recipe.ratings.push({ user: req.user.id, value });
  recipe.recalculateAverageRating();
  await recipe.save();
  res.json({ averageRating: recipe.averageRating });
});

router.post('/:id/like', requireAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (!recipe.likes.some((u) => u.toString() === req.user.id)) {
    recipe.likes.push(req.user.id);
    recipe.likesCount = recipe.likes.length;
    await recipe.save();
  }
  res.json({ likesCount: recipe.likesCount });
});

router.post('/:id/unlike', requireAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  recipe.likes = recipe.likes.filter((u) => u.toString() !== req.user.id);
  recipe.likesCount = recipe.likes.length;
  await recipe.save();
  res.json({ likesCount: recipe.likesCount });
});

export default router;


