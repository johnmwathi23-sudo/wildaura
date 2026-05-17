const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide a product name'], trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: [true, 'Please provide a description'] },
  shortDescription: { type: String, required: true },
  price: { type: Number, required: [true, 'Please provide a price'] },
  comparePrice: { type: Number, default: 0 },
  images: [{ type: String }],
  category: { type: String, required: true, enum: ['face-oils', 'serums', 'sets', 'body', 'gifts'] },
  size: { type: String, default: '30ml' },
  ingredients: [{ type: String }],
  benefits: [{ type: String }],
  howToUse: { type: String, default: '' },
  stock: { type: Number, required: true, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  usageFor: { type: String, default: 'All skin types' },
  createdAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.model('Product', productSchema);
