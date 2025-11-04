import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import Comment from '../models/Comment.js';

const router = express.Router();

router.get('/recipe/:recipeId', async (req, res) => {
  const comments = await Comment.find({ recipe: req.params.recipeId })
    .sort('-createdAt')
    .populate('author', 'name avatarUrl');
  res.json(comments);
});

router.post(
  '/recipe/:recipeId',
  requireAuth,
  [body('content').isLength({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const comment = await Comment.create({
      recipe: req.params.recipeId,
      author: req.user.id,
      content: req.body.content
    });
    const populated = await comment.populate('author', 'name avatarUrl');
    res.status(201).json(populated);
  }
);

router.delete('/:id', requireAuth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.author.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await comment.deleteOne();
  res.json({ ok: true });
});

export default router;



