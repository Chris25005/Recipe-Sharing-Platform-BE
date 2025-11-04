import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json(user);
});

router.put('/me', requireAuth, async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { name, bio, avatarUrl } },
    { new: true }
  ).select('-passwordHash');
  res.json(updated);
});

// Favorites
router.get('/me/favorites', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('favorites');
  res.json(user.favorites || []);
});

router.post('/me/favorites/:recipeId', requireAuth, async (req, res) => {
  const recipeId = req.params.recipeId;
  const exists = await Recipe.findById(recipeId);
  if (!exists) return res.status(404).json({ message: 'Recipe not found' });
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: recipeId } });
  res.json({ ok: true });
});

router.delete('/me/favorites/:recipeId', requireAuth, async (req, res) => {
  const recipeId = req.params.recipeId;
  await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: recipeId } });
  res.json({ ok: true });
});

router.post('/:id/follow', requireAuth, async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });
  try {
    await Follow.create({ follower: req.user.id, following: targetId });
    await User.findByIdAndUpdate(req.user.id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });
  } catch (_) {}
  res.json({ ok: true });
});

router.post('/:id/unfollow', requireAuth, async (req, res) => {
  const targetId = req.params.id;
  await Follow.deleteOne({ follower: req.user.id, following: targetId });
  await User.findByIdAndUpdate(req.user.id, { $inc: { followingCount: -1 } });
  await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
  res.json({ ok: true });
});

// List and search users
router.get('/', async (req, res) => {
  const { q = '', page = 1, limit = 20 } = req.query;
  const filter = q ? {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  } : {};
  const users = await User.find(filter)
    .select('name avatarUrl followersCount followingCount')
    .sort('-followersCount')
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// List users they follow
router.get('/:id/following', async (req, res) => {
  const follows = await Follow.find({ follower: req.params.id }).populate('following', 'name avatarUrl');
  res.json(follows.map(f => f.following).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)));
});
// List followers
router.get('/:id/followers', async (req, res) => {
  const follows = await Follow.find({ following: req.params.id }).populate('follower', 'name avatarUrl');
  res.json(follows.map(f => f.follower).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)));
});

export default router;


