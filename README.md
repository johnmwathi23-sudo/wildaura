# Wild Aura — Luxury African Skincare E-Commerce Platform

A premium luxury skincare e-commerce website for **Wild Aura**, a natural skincare oil brand. Built with a deep emerald green and metallic gold aesthetic, this is a full-stack production-ready platform.

## Brand

Wild Aura is a luxury natural skincare oil blend made with:
- **Turmeric Oil** — Brightening, anti-inflammatory
- **Jojoba Oil** — Deep hydration, oil-balancing
- **Sunflower Oil** — Barrier repair, Vitamin E
- **Tea Tree Oil** — Acne control, purifying

## Tech Stack

### Frontend
- HTML5, TailwindCSS-inspired custom CSS
- Vanilla JavaScript (ES6+)
- Responsive mobile-first design
- Luxury animations and glassmorphism

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication with bcrypt
- RESTful API architecture

### Payments
- Stripe integration ready
- M-Pesa STK Push ready

## Features

### User Features
- Full-screen cinematic hero with particle effects
- Product browsing with search, filter, sort
- Product detail pages with reviews and ratings
- Shopping cart with coupon support
- Secure checkout with shipping
- User authentication (register/login)
- User dashboard with order history
- Wishlist management
- Newsletter subscription
- Contact form

### Admin Features
- Revenue analytics dashboard
- Product CRUD management
- Order management with delivery tracking
- Coupon code management
- Customer overview

## Project Structure

```
wild-aura/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   ├── couponController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── wishlistController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Contact.js
│   │   ├── Coupon.js
│   │   ├── Newsletter.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   └── wishlistRoutes.js
│   ├── seed/
│   │   └── seed.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── admin/
│   │   ├── css/admin.css
│   │   ├── js/admin.js
│   │   └── index.html
│   ├── css/style.css
│   ├── js/app.js
│   ├── pages/
│   │   ├── about.html
│   │   ├── auth.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── contact.html
│   │   ├── dashboard.html
│   │   ├── ingredients.html
│   │   ├── product.html
│   │   ├── shop.html
│   │   └── testimonials.html
│   └── index.html
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run seed
npm start
```

### Frontend Setup
Serve the `frontend/` directory with any static server:

```bash
# Using VS Code Live Server, or:
npx serve frontend
```

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/wildaura
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
M_PESA_CONSUMER_KEY=...
M_PESA_CONSUMER_SECRET=...
M_PESA_PASSKEY=...
M_PESA_SHORTCODE=174379
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5500
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/forgot-password` — Request password reset
- `GET /api/auth/profile` — Get user profile (auth)
- `PUT /api/auth/profile` — Update profile (auth)
- `GET /api/auth/users` — List users (admin)
- `DELETE /api/auth/users/:id` — Delete user (admin)

### Products
- `GET /api/products` — List products (query: category, search, sort, minPrice, maxPrice, page, limit)
- `GET /api/products/featured` — Featured products
- `GET /api/products/:slug` — Get product by slug
- `GET /api/products/id/:id` — Get product by ID
- `POST /api/products` — Create product (admin)
- `PUT /api/products/:id` — Update product (admin)
- `DELETE /api/products/:id` — Delete product (admin)
- `POST /api/products/:id/reviews` — Add review (auth)

### Orders
- `POST /api/orders` — Create order (auth)
- `GET /api/orders` — Get user orders (auth)
- `GET /api/orders/all` — Get all orders (admin)
- `GET /api/orders/revenue` — Revenue stats (admin)
- `GET /api/orders/:id` — Get order by ID (auth)
- `PUT /api/orders/:id/pay` — Mark paid (auth)
- `PUT /api/orders/:id/deliver` — Mark delivered (admin)

### Coupons
- `GET /api/coupons` — List coupons (admin)
- `POST /api/coupons/validate` — Validate coupon (auth)
- `POST /api/coupons` — Create coupon (admin)
- `PUT /api/coupons/:id` — Update coupon (admin)
- `DELETE /api/coupons/:id` — Delete coupon (admin)

### Contact
- `POST /api/contact` — Submit contact form
- `GET /api/contact` — Get messages (admin)
- `PUT /api/contact/:id/read` — Mark as read (admin)
- `POST /api/contact/newsletter` — Subscribe to newsletter
- `GET /api/contact/newsletter` — List subscribers (admin)

### Wishlist
- `GET /api/wishlist` — Get wishlist (auth)
- `POST /api/wishlist` — Add to wishlist (auth)
- `DELETE /api/wishlist/:productId` — Remove from wishlist (auth)

## Default Admin Access
- **Email:** admin@wildaura.com
- **Password:** admin123456

## Seed Coupons
- `WELCOME20` — 20% off (max KES 2,000)
- `GLOW15` — 15% off (max KES 1,500)
- `FREESHIP` — Free shipping (KES 350 off)
