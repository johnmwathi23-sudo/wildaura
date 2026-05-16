const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getProductById, createProduct, updateProduct, deleteProduct, createReview, getFeatured } = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:slug', getProduct);
router.get('/id/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, createReview);

module.exports = router;
