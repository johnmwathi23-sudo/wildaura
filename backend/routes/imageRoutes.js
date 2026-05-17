const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAll, getByKey, getBySection, upload, uploadCropped, resetImage, seedImages } = require('../controllers/imageController');
const { protect, admin } = require('../middleware/auth');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP'), false);
  }
};
const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/', getAll);
router.get('/seed', protect, admin, seedImages);
router.get('/section/:section', getBySection);
router.get('/:key', getByKey);
router.post('/:key/upload', protect, admin, uploadMiddleware.single('image'), upload);
router.post('/:key/upload-cropped', protect, admin, uploadCropped);
router.delete('/:key/reset', protect, admin, resetImage);

module.exports = router;
