const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderPaid, updateOrderDelivered, getAllOrders, getRevenue } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/all', protect, admin, getAllOrders);
router.get('/revenue', protect, admin, getRevenue);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderPaid);
router.put('/:id/deliver', protect, admin, updateOrderDelivered);

module.exports = router;
