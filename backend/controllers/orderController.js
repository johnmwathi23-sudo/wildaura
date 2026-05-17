const Order = require('../models/Order');
const Product = require('../models/Product');
const { stkPush } = require('../services/mpesa');

const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode, discountAmount, mpesaPhone } = req.body;
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
      mpesaPhone: mpesaPhone || '',
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
    if (paymentMethod === 'mpesa' && mpesaPhone) {
      try {
        const result = await stkPush(mpesaPhone, totalPrice, order._id.toString());
        order.mpesaCheckoutRequestId = result.CheckoutRequestID || '';
        order.mpesaMerchantRequestId = result.MerchantRequestID || '';
        await order.save();
        return res.status(201).json({
          ...order.toObject(),
          mpesaCheckoutRequestId: result.CheckoutRequestID,
          mpesaMerchantRequestId: result.MerchantRequestID,
          mpesaResponseCode: result.ResponseCode,
          mpesaResponseDescription: result.ResponseDescription
        });
      } catch (mpesaError) {
        return res.status(201).json({
          ...order.toObject(),
          mpesaError: 'STK push failed. Order created but payment not initiated. Try again.',
          mpesaErrorMessage: mpesaError.message
        });
      }
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

const mpesaCallback = async (req, res) => {
  try {
    const result = req.body?.Body?.stkCallback;
    if (!result) return res.status(200).json({ ResultCode: 1, ResultDesc: 'Invalid callback' });
    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID, CallbackMetadata } = result;
    const order = await Order.findOne({ mpesaCheckoutRequestId: CheckoutRequestID });
    if (!order) return res.status(200).json({ ResultCode: 1, ResultDesc: 'Order not found' });
    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || [];
      const getItem = (name) => { const i = items.find(item => item.Name === name); return i ? i.Value : null; };
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: getItem('MpesaReceiptNumber') || CheckoutRequestID,
        status: 'completed',
        updateTime: new Date().toISOString()
      };
      order.status = 'processing';
      await order.save();
    } else {
      order.mpesaCheckoutRequestId = '';
      order.mpesaMerchantRequestId = '';
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      await order.save();
    }
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    res.status(200).json({ ResultCode: 1, ResultDesc: error.message });
  }
};

const checkMpesaStatus = async (req, res, next) => {
  try {
    const { queryStatus } = require('../services/mpesa');
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (!order.mpesaCheckoutRequestId) {
      return res.json({ status: 'no_pending_request' });
    }
    const result = await queryStatus(order.mpesaCheckoutRequestId);
    if (result.ResultCode === '0' || result.ResultCode === 0) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = { ...order.paymentResult, status: 'completed' };
      order.status = 'processing';
      await order.save();
      return res.json({ status: 'paid' });
    }
    res.json({ status: 'pending', resultCode: result.ResultCode, resultDesc: result.ResultDesc });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderPaid, updateOrderDelivered, getAllOrders, getRevenue, mpesaCallback, checkMpesaStatus };
