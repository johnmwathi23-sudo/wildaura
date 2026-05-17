const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

dotenv.config();

const products = [
  {
    name: 'Wild Aura Radiance Oil',
    slug: 'wild-aura-radiance-oil',
    description: 'Our signature formulation combines the brightest botanicals nature has to offer. Cold-pressed Turmeric Oil merges with nurturing Jojoba, lightweight Sunflower, and purifying Tea Tree to create an elixir that transforms skin at the cellular level. This is not just oil — this is liquid confidence. Each drop carries the weight of ancient beauty wisdom, modern science, and the unmistakable truth that your skin deserves more than what the market has been giving you.',
    shortDescription: 'Our signature turmeric-infused oil blend for radiant, clear skin.',
    price: 4200,
    comparePrice: 5200,
    images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800'],
    category: 'face-oils',
    size: '30ml',
    ingredients: ['Turmeric Oil', 'Jojoba Oil', 'Sunflower Oil', 'Tea Tree Oil', 'Vitamin E', 'Rosehip Oil'],
    benefits: ['Clears acne and blemishes', 'Evens skin tone', 'Reduces inflammation', 'Deeply moisturizes', 'Restores natural glow'],
    howToUse: 'Apply 3-4 drops to clean, damp skin morning and evening. Gently press into face, neck, and décolletage. Follow with moisturizer if desired.',
    stock: 150,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    ratings: 4.8,
    numReviews: 127,
    usageFor: 'All skin types, especially acne-prone'
  },
  {
    name: 'Golden Hour Body Oil',
    slug: 'golden-hour-body-oil',
    description: 'Bathe your skin in the warm glow of golden hour with this lavish full-body oil. Enriched with Turmeric and Sunflower oils, it absorbs quickly without greasiness while leaving a subtle luminosity that catches light like morning dew on petals. Your skin will feel like silk because it deserves to feel like silk.',
    shortDescription: 'Full-body oil for luminous, silky skin.',
    price: 5600,
    comparePrice: 0,
    images: ['https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800'],
    category: 'body',
    size: '100ml',
    ingredients: ['Sunflower Oil', 'Jojoba Oil', 'Turmeric Oil', 'Almond Oil', 'Vitamin E', 'Lavender Essential Oil'],
    benefits: ['Deep hydration', 'Improves skin elasticity', 'Leaves skin luminous', 'Calms irritation', 'Non-greasy finish'],
    howToUse: 'Apply generously to damp skin after shower. Massage in circular motions until absorbed. Use daily for best results.',
    stock: 85,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    ratings: 4.7,
    numReviews: 89,
    usageFor: 'All skin types'
  },
  {
    name: 'Dark Spot Correcting Serum',
    slug: 'dark-spot-correcting-serum',
    description: 'Hyperpigmentation tells stories you did not ask to tell. This concentrated serum blends Turmeric Oil with potent botanical brighteners to fade dark spots, sun damage, and post-acne marks. It is forgiveness in a bottle — a chance for your skin to start over, to even out, to become the complexion you have been praying for.',
    shortDescription: 'Targeted serum to fade dark spots and hyperpigmentation.',
    price: 6800,
    comparePrice: 7800,
    images: ['https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=800', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'],
    category: 'serums',
    size: '30ml',
    ingredients: ['Turmeric Oil', 'Niacinamide', 'Vitamin C', 'Jojoba Oil', 'Licorice Root Extract', 'Tea Tree Oil'],
    benefits: ['Fades dark spots', 'Brightens complexion', 'Reduces hyperpigmentation', 'Evens skin texture', 'Boosts radiance'],
    howToUse: 'Apply 2-3 drops after cleansing and before moisturizer. Use morning and evening. Always follow with SPF during the day.',
    stock: 60,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    ratings: 4.9,
    numReviews: 43,
    usageFor: 'All skin types, especially hyperpigmented'
  },
  {
    name: 'The Ritual Set',
    slug: 'the-ritual-set',
    description: 'Some things are better together. Our complete system — Radiance Oil, Dark Spot Serum, and Golden Hour Body Oil — wrapped in a signature Wild Aura box with a guide to your new ritual. This is not a bundle. It is a commitment. A full-body, full-mind approach to becoming the most luminous version of yourself.',
    shortDescription: 'Complete 3-piece skincare ritual in signature packaging.',
    price: 14500,
    comparePrice: 16600,
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'],
    category: 'sets',
    size: 'Gift Set',
    ingredients: ['Turmeric Oil', 'Jojoba Oil', 'Sunflower Oil', 'Tea Tree Oil', 'Niacinamide', 'Vitamin C', 'Vitamin E', 'Rosehip Oil', 'Almond Oil'],
    benefits: ['Complete skincare ritual', 'Saves 13% vs individual', 'Signature gift box', 'All skin concerns addressed', '30-day glow guarantee'],
    howToUse: 'Follow the enclosed ritual guide. Layer Serum first, then Radiance Oil. Use Body Oil post-shower.',
    stock: 40,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    ratings: 5.0,
    numReviews: 28,
    usageFor: 'All skin types'
  },
  {
    name: 'Tea Tree Purifying Drops',
    slug: 'tea-tree-purifying-drops',
    description: 'When your skin rebels, fight back with nature. Concentrated Tea Tree Oil blended with soothing Jojoba and Turmeric creates a targeted treatment for breakouts and congestion. Apply it to trouble spots and watch inflammation retreat. Your skin will thank you with clarity.',
    shortDescription: 'Targeted treatment for breakouts and congestion.',
    price: 3200,
    comparePrice: 0,
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800'],
    category: 'face-oils',
    size: '15ml',
    ingredients: ['Tea Tree Oil', 'Jojoba Oil', 'Turmeric Oil', 'Salicylic Acid', 'Witch Hazel'],
    benefits: ['Clears active breakouts', 'Reduces redness', 'Prevents future acne', 'Unclogs pores', 'Soothes inflammation'],
    howToUse: 'Apply 1-2 drops directly to blemishes after cleansing. Use morning and evening. Do not rinse.',
    stock: 200,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    ratings: 4.6,
    numReviews: 64,
    usageFor: 'Oily, acne-prone skin'
  },
  {
    name: 'Wild Aura Luxury Gift Box',
    slug: 'wild-aura-luxury-gift-box',
    description: 'The ultimate gift of glow. Curated selection of our best-selling products in an heirloom-worthy box finished with gold foil and deep green velvet. Inside: Radiance Oil, Golden Hour Body Oil, Tea Tree Purifying Drops, and a handcrafted gua sha tool. For the woman who has everything except the skin she deserves.',
    shortDescription: 'Ultimate luxury gift set with gua sha tool.',
    price: 18900,
    comparePrice: 21000,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800'],
    category: 'gifts',
    size: 'Gift Box',
    ingredients: ['Full ingredient lists included for each product'],
    benefits: ['Complete luxury experience', 'Includes gua sha tool', 'Signature packaging', 'Perfect for gifting', '10% savings'],
    howToUse: 'Each product includes full usage instructions.',
    stock: 25,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    ratings: 4.9,
    numReviews: 17,
    usageFor: 'Gifting'
  },
  {
    name: 'Turmeric Bright Eye Oil',
    slug: 'turmeric-bright-eye-oil',
    description: 'The eyes carry everything — stress, sleeplessness, years of staring at screens. This ultra-fine oil targets the delicate under-eye area with Turmeric and Jojoba to reduce darkness, depuff, and restore the bright, awake look of someone who actually got 8 hours. Even if you did not.',
    shortDescription: 'Ultra-fine eye oil to brighten and depuff.',
    price: 3800,
    comparePrice: 4500,
    images: ['https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=800', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800'],
    category: 'face-oils',
    size: '15ml',
    ingredients: ['Jojoba Oil', 'Turmeric Oil', 'Rosehip Oil', 'Vitamin E', 'Caffeine', 'Green Tea Extract'],
    benefits: ['Reduces dark circles', 'Depuffs eye area', 'Fine line reduction', 'Brightens tired eyes', 'Cooling sensation'],
    howToUse: 'Gently tap 1 drop under each eye with ring finger. Use morning and evening. Avoid direct contact with eyes.',
    stock: 90,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    ratings: 4.5,
    numReviews: 31,
    usageFor: 'All skin types'
  },
  {
    name: 'Sunflower Silk Moisturizer',
    slug: 'sunflower-silk-moisturizer',
    description: 'Light as silk, powerful as a shield. Our Sunflower Oil-based moisturizer locks in hydration without clogging pores. Turmeric and Vitamin E work beneath the surface to calm inflammation while your skin drinks in the nourishment it has been craving. The finish? Dewy. The feeling? Heaven.',
    shortDescription: 'Lightweight daily moisturizer with sunflower oil.',
    price: 4800,
    comparePrice: 5500,
    images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'],
    category: 'face-oils',
    size: '50ml',
    ingredients: ['Sunflower Oil', 'Jojoba Oil', 'Turmeric Extract', 'Vitamin E', 'Shea Butter', 'Aloe Vera'],
    benefits: ['Locks in moisture', 'Non-comedogenic', 'Calms redness', 'Dewy finish', 'Strengthens skin barrier'],
    howToUse: 'Apply a pea-sized amount after serum or oil. Massage upward and outward. Use morning and evening.',
    stock: 110,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    ratings: 4.7,
    numReviews: 52,
    usageFor: 'All skin types, especially dry'
  }
];

const user = {
  name: 'Admin',
  email: 'admin@wildaura.com',
  password: 'admin123456',
  role: 'admin'
};

const coupons = [
  { code: 'WELCOME20', type: 'percentage', value: 20, minOrderAmount: 3000, maxDiscount: 2000, usageLimit: 100, expiresAt: new Date('2027-12-31') },
  { code: 'GLOW15', type: 'percentage', value: 15, minOrderAmount: 2000, maxDiscount: 1500, usageLimit: 200, expiresAt: new Date('2027-12-31') },
  { code: 'FREESHIP', type: 'fixed', value: 350, minOrderAmount: 3000, maxDiscount: 350, usageLimit: 500, expiresAt: new Date('2027-12-31') }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    await User.deleteMany({});
    await Coupon.deleteMany({});

    await Product.insertMany(products);
    console.log('Products seeded');

    await User.create(user);
    console.log('Admin user created: admin@wildaura.com / admin123456');

    await Coupon.insertMany(coupons);
    console.log('Coupons seeded');

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
