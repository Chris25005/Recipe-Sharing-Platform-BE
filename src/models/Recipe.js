import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, min: 1, max: 5, required: true }
  },
  { _id: false, timestamps: true }
);

const recipeSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    ingredients: [{ type: String, required: true }],
    steps: [{ type: String, required: true }],
    cookingTimeMinutes: { type: Number, min: 0, default: 0 },
    servings: { type: Number, min: 1, default: 1 },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'side'], default: 'dinner' },
    cuisine: { type: String, default: '' },
    dietary: [{ type: String }],
    imageUrls: [{ type: String }],
    videoUrl: { type: String, default: '' },
    ratings: [ratingSchema],
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

recipeSchema.methods.recalculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
};

export default mongoose.model('Recipe', recipeSchema);


