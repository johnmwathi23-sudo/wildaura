const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode, discountAmount } = req.body;
    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }
    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 5000 ? 0 : 350;
    const taxPrice = Number((itemsPrice * 0.16).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice - (discountAmount || 0);
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      couponCode: couponCode || '',
      discountAmount: discountAmount || 0
    });
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { id: req.body.id, status: 'completed' };
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const updateOrderDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 }, avgOrderValue: { $avg: '$totalPrice' } } }
    ]);
    const monthly = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: { $month: '$paidAt' }, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const orderStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({
      totalRevenue: stats[0]?.total || 0,
      totalOrders: stats[0]?.count || 0,
      avgOrderValue: stats[0]?.avgOrderValue || 0,
      monthly,
      orderStatus
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderPaid, updateOrderDelivered, getAllOrders, getRevenue };
