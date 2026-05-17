const SiteImage = require('../models/SiteImage');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'site');

const defaultImages = [
  { key: 'hero', label: 'Hero Banner', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200', aspectRatio: '16:9', width: 1200, height: 675, alt: 'Wild Aura hero banner' },
  { key: 'hero-product', label: 'Hero Product', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600', aspectRatio: '1:1', width: 600, height: 600, alt: 'Wild Aura featured product' },
  { key: 'glow-main', label: 'Glow Section Main', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800', aspectRatio: '4:5', width: 800, height: 1000, alt: 'Wild Aura glow section' },
  { key: 'glow-accent', label: 'Glow Section Accent', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', aspectRatio: '1:1', width: 400, height: 400, alt: 'Wild Aura product detail' },
  { key: 'ba-before', label: 'Before Image', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600', aspectRatio: '4:5', width: 600, height: 750, alt: 'Before using Wild Aura' },
  { key: 'ba-after', label: 'After Image', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1602523961353-f8e8e1b1d9f4?w=600', aspectRatio: '4:5', width: 600, height: 750, alt: 'After using Wild Aura' },
  { key: 'social-1', label: 'Social Feed 1', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', aspectRatio: '1:1', width: 400, height: 400, alt: 'Wild Aura social' },
  { key: 'social-2', label: 'Social Feed 2', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400', aspectRatio: '1:1', width: 400, height: 400, alt: 'Wild Aura social' },
  { key: 'social-3', label: 'Social Feed 3', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', aspectRatio: '1:1', width: 400, height: 400, alt: 'Wild Aura social' },
  { key: 'social-4', label: 'Social Feed 4', section: 'home', defaultUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', aspectRatio: '1:1', width: 400, height: 400, alt: 'Wild Aura social' },
  { key: 'about-founder', label: 'About Founder', section: 'about', defaultUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', aspectRatio: '4:5', width: 800, height: 1000, alt: 'Wild Aura founder' },
  { key: 'about-nairobi', label: 'Nairobi Skyline', section: 'about', defaultUrl: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400', aspectRatio: '16:9', width: 800, height: 450, alt: 'Nairobi skyline' },
  { key: 'about-wanjiku', label: 'Founder Portrait', section: 'about', defaultUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800', aspectRatio: '4:5', width: 800, height: 1000, alt: 'Wanjiku Mwangi' },
  { key: 'ingredient-turmeric', label: 'Turmeric Oil', section: 'ingredients', defaultUrl: 'https://images.unsplash.com/photo-1615485290412-1e72c5e1e5c2?w=600', aspectRatio: '4:3', width: 600, height: 450, alt: 'Turmeric Oil' },
  { key: 'ingredient-jojoba', label: 'Jojoba Oil', section: 'ingredients', defaultUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600', aspectRatio: '4:3', width: 600, height: 450, alt: 'Jojoba Oil' },
  { key: 'ingredient-sunflower', label: 'Sunflower Oil', section: 'ingredients', defaultUrl: 'https://images.unsplash.com/photo-1621961452220-72f5a4030a5f?w=600', aspectRatio: '4:3', width: 600, height: 450, alt: 'Sunflower Oil' },
  { key: 'ingredient-tea-tree', label: 'Tea Tree Oil', section: 'ingredients', defaultUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', aspectRatio: '4:3', width: 600, height: 450, alt: 'Tea Tree Oil' },
  { key: 'ingredient-sourcing', label: 'Sourcing Image', section: 'ingredients', defaultUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', aspectRatio: '16:9', width: 800, height: 450, alt: 'Wild Aura ingredient sourcing' },
  { key: 'ingredient-farm', label: 'Farm Field', section: 'ingredients', defaultUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', aspectRatio: '4:3', width: 400, height: 300, alt: 'Farm field' },
];

async function seedDefaults() {
  for (const img of defaultImages) {
    await SiteImage.findOneAndUpdate(
      { key: img.key },
      { ...img, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  }
}

const getAll = async (req, res, next) => {
  try {
    const images = await SiteImage.find().sort({ section: 1, key: 1 });
    res.json(images);
  } catch (error) {
    next(error);
  }
};

const getByKey = async (req, res, next) => {
  try {
    const image = await SiteImage.findOne({ key: req.params.key });
    if (!image) {
      res.status(404);
      throw new Error('Image not found');
    }
    res.json(image);
  } catch (error) {
    next(error);
  }
};

const getBySection = async (req, res, next) => {
  try {
    const images = await SiteImage.find({ section: req.params.section });
    res.json(images);
  } catch (error) {
    next(error);
  }
};

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const upload = async (req, res, next) => {
  try {
    const { key } = req.params;
    const image = await SiteImage.findOne({ key });
    if (!image) {
      res.status(404);
      throw new Error('Image slot not found');
    }
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400);
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
    }
    if (req.file.size > 5 * 1024 * 1024) {
      res.status(400);
      throw new Error('File too large. Maximum size is 5MB');
    }
    const [w, h] = image.aspectRatio.split(':').map(Number);
    const targetWidth = image.width;
    const targetHeight = Math.round(targetWidth * h / w);
    const filename = `${key}-${Date.now()}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    await sharp(req.file.buffer)
      .resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(filepath);
    const oldFile = image.url ? path.basename(image.url) : null;
    image.url = `/uploads/site/${filename}`;
    image.updatedAt = new Date();
    await image.save();
    if (oldFile && oldFile !== filename) {
      const oldPath = path.join(UPLOAD_DIR, oldFile);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    res.json({ success: true, image });
  } catch (error) {
    next(error);
  }
};

const uploadCropped = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { image: base64Data } = req.body;
    const image = await SiteImage.findOne({ key });
    if (!image) {
      res.status(404);
      throw new Error('Image slot not found');
    }
    if (!base64Data) {
      res.status(400);
      throw new Error('No image data provided');
    }
    const matches = base64Data.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
    if (!matches) {
      res.status(400);
      throw new Error('Invalid image format');
    }
    const ext = matches[1] === 'png' ? 'png' : matches[1] === 'webp' ? 'webp' : 'jpeg';
    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400);
      throw new Error('Image too large. Maximum size is 5MB');
    }
    const [w, h] = image.aspectRatio.split(':').map(Number);
    const targetWidth = image.width;
    const targetHeight = Math.round(targetWidth * h / w);
    const filename = `${key}-${Date.now()}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    await sharp(buffer)
      .resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(filepath);
    const oldFile = image.url ? path.basename(image.url) : null;
    image.url = `/uploads/site/${filename}`;
    image.updatedAt = new Date();
    await image.save();
    if (oldFile && oldFile !== filename) {
      const oldPath = path.join(UPLOAD_DIR, oldFile);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    res.json({ success: true, image });
  } catch (error) {
    next(error);
  }
};

const resetImage = async (req, res, next) => {
  try {
    const image = await SiteImage.findOne({ key: req.params.key });
    if (!image) {
      res.status(404);
      throw new Error('Image not found');
    }
    const oldFile = image.url ? path.basename(image.url) : null;
    if (oldFile) {
      const oldPath = path.join(UPLOAD_DIR, oldFile);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    image.url = '';
    image.updatedAt = new Date();
    await image.save();
    res.json({ success: true, image });
  } catch (error) {
    next(error);
  }
};

const seedImages = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized');
    }
    await seedDefaults();
    const images = await SiteImage.find().sort({ section: 1, key: 1 });
    res.json({ success: true, images });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getByKey, getBySection, upload, uploadCropped, resetImage, seedImages, seedDefaults };
