const express = require('express');
const router = express.Router();
const { submitContact, getMessages, markAsRead, subscribeNewsletter, getSubscribers } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, admin, getMessages);
router.put('/:id/read', protect, admin, markAsRead);
router.post('/newsletter', subscribeNewsletter);
router.get('/newsletter', protect, admin, getSubscribers);

module.exports = router;
