const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');

const submitContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const msg = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(msg);
  } catch (error) {
    next(error);
  }
};

const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    const exists = await Newsletter.findOne({ email });
    if (exists) {
      if (!exists.isActive) {
        exists.isActive = true;
        await exists.save();
        return res.json({ message: 'Subscription reactivated' });
      }
      return res.json({ message: 'Already subscribed' });
    }
    await Newsletter.create({ email });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    next(error);
  }
};

const getSubscribers = async (req, res, next) => {
  try {
    const subs = await Newsletter.find({}).sort({ subscribedAt: -1 });
    res.json(subs);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact, getMessages, markAsRead, subscribeNewsletter, getSubscribers };
