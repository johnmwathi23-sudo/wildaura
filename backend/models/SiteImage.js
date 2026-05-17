const mongoose = require('mongoose');

const siteImageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  section: { type: String, required: true },
  url: { type: String, default: '' },
  defaultUrl: { type: String, default: '' },
  aspectRatio: { type: String, default: '1:1' },
  width: { type: Number, default: 800 },
  height: { type: Number, default: 800 },
  alt: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteImage', siteImageSchema);
