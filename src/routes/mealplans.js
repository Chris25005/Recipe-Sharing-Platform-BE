import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import MealPlan from '../models/MealPlan.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const plans = await MealPlan.find({ owner: req.user.id }).sort('-updatedAt');
  res.json(plans);
});

router.post('/', requireAuth, async (req, res) => {
  const { title, items } = req.body;
  const plan = await MealPlan.create({ owner: req.user.id, title: title || 'Weekly Plan', items: items || [] });
  res.status(201).json(plan);
});

router.put('/:id', requireAuth, async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Meal plan not found' });
  if (plan.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const { title, items } = req.body;
  if (title !== undefined) plan.title = title;
  if (items !== undefined) plan.items = items;
  await plan.save();
  res.json(plan);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Meal plan not found' });
  if (plan.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await plan.deleteOne();
  res.json({ ok: true });
});

router.post('/:id/share', requireAuth, async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Meal plan not found' });
  if (plan.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const { userId } = req.body;
  if (userId && !plan.sharedWith.includes(userId)) plan.sharedWith.push(userId);
  await plan.save();
  res.json(plan);
});

router.post('/:id/unshare', requireAuth, async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Meal plan not found' });
  if (plan.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const { userId } = req.body;
  plan.sharedWith = plan.sharedWith.filter((id) => id.toString() !== userId);
  await plan.save();
  res.json(plan);
});

router.post('/shopping-list', requireAuth, async (req, res) => {
  // Generate shopping list from items array [{ date, mealType, recipe: { ingredients } }]
  const items = req.body.items || [];
  const aggregated = {};
  for (const item of items) {
    const ing = item.ingredients || [];
    for (const line of ing) {
      const key = line.toLowerCase();
      aggregated[key] = (aggregated[key] || 0) + 1;
    }
  }
  res.json({ list: Object.keys(aggregated) });
});

export default router;



