const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/images', require('./routes/imageRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wild Aura API is running' });
});

const siteUploadDir = path.join(__dirname, 'uploads', 'site');
if (!fs.existsSync(siteUploadDir)) {
  fs.mkdirSync(siteUploadDir, { recursive: true });
  console.log('Created uploads/site directory');
}

app.use(errorHandler);

connectDB().then(() => {
  const { seedDefaults } = require('./controllers/imageController');
  seedDefaults().catch(() => {});
}).catch(() => {});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Wild Aura server running on port ${PORT}`);
});
