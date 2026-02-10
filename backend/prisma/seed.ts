import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@auraya.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@auraya.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create seller user
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@auraya.com' },
    update: { role: 'SELLER' },
    create: {
      email: 'seller@auraya.com',
      passwordHash: sellerPassword,
      name: 'Auraya Store',
      role: 'SELLER',
    },
  });
  console.log('Seller user created:', seller.email);

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
    },
  });

  const phones = await prisma.category.upsert({
    where: { slug: 'phones' },
    update: {},
    create: {
      name: 'Phones',
      slug: 'phones',
      description: 'Smartphones and mobile devices',
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and notebooks',
      parentId: electronics.id,
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Tech accessories',
      parentId: electronics.id,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
    },
  });

  const womens = await prisma.category.upsert({
    where: { slug: 'womens' },
    update: {},
    create: {
      name: "Women's",
      slug: 'womens',
      description: "Women's clothing",
      parentId: clothing.id,
    },
  });

  const mens = await prisma.category.upsert({
    where: { slug: 'mens' },
    update: {},
    create: {
      name: "Men's",
      slug: 'mens',
      description: "Men's clothing",
      parentId: clothing.id,
    },
  });

  console.log('Categories created');

  // Sample products data
  const products = [
    // Phones
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
      price: 1199.00,
      stock: 50,
      categories: [phones.id],
    },
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Pro-level performance with A17 Pro chip and titanium design.',
      price: 999.00,
      stock: 75,
      categories: [phones.id],
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Ultimate Galaxy experience with S Pen, AI features, and 200MP camera.',
      price: 1299.00,
      stock: 40,
      categories: [phones.id],
    },
    {
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      description: 'Premium Android smartphone with Galaxy AI and stunning display.',
      price: 849.00,
      stock: 60,
      categories: [phones.id],
    },
    {
      name: 'Google Pixel 8 Pro',
      slug: 'google-pixel-8-pro',
      description: 'The best of Google with Tensor G3, advanced AI, and incredible camera.',
      price: 999.00,
      stock: 35,
      categories: [phones.id],
    },
    // Laptops
    {
      name: 'MacBook Pro 16" M3 Max',
      slug: 'macbook-pro-16-m3-max',
      description: 'The most powerful MacBook Pro ever with M3 Max chip for demanding workflows.',
      price: 3499.00,
      stock: 20,
      categories: [laptops.id],
    },
    {
      name: 'MacBook Pro 14" M3 Pro',
      slug: 'macbook-pro-14-m3-pro',
      description: 'Pro performance in a portable design with M3 Pro chip.',
      price: 1999.00,
      stock: 30,
      categories: [laptops.id],
    },
    {
      name: 'MacBook Air 15" M3',
      slug: 'macbook-air-15-m3',
      description: 'Impossibly thin with a stunning 15-inch Liquid Retina display.',
      price: 1299.00,
      stock: 45,
      categories: [laptops.id],
    },
    {
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'Premium Windows laptop with InfinityEdge display and powerful performance.',
      price: 1799.00,
      stock: 25,
      categories: [laptops.id],
    },
    // Accessories
    {
      name: 'AirPods Pro 2nd Gen',
      slug: 'airpods-pro-2',
      description: 'Active Noise Cancellation, Adaptive Audio, and USB-C charging.',
      price: 249.00,
      stock: 100,
      categories: [accessories.id],
    },
    {
      name: 'Apple Watch Ultra 2',
      slug: 'apple-watch-ultra-2',
      description: 'The most rugged and capable Apple Watch for athletes and adventurers.',
      price: 799.00,
      stock: 30,
      categories: [accessories.id],
    },
    {
      name: 'MagSafe Charger',
      slug: 'magsafe-charger',
      description: 'Fast wireless charging perfectly aligned every time.',
      price: 39.00,
      stock: 200,
      categories: [accessories.id],
    },
    {
      name: 'Samsung Galaxy Watch 6',
      slug: 'samsung-galaxy-watch-6',
      description: 'Advanced health tracking and sleek design.',
      price: 329.00,
      stock: 45,
      categories: [accessories.id],
    },
    // Clothing - Women's
    {
      name: 'Cashmere Blend Sweater',
      slug: 'cashmere-blend-sweater',
      description: 'Luxuriously soft cashmere blend sweater in a relaxed fit.',
      price: 149.00,
      stock: 60,
      categories: [womens.id],
    },
    {
      name: 'High-Rise Wide Leg Jeans',
      slug: 'high-rise-wide-leg-jeans',
      description: 'Classic high-rise silhouette with a modern wide leg.',
      price: 98.00,
      stock: 80,
      categories: [womens.id],
    },
    {
      name: 'Silk Midi Dress',
      slug: 'silk-midi-dress',
      description: 'Elegant silk midi dress perfect for any occasion.',
      price: 225.00,
      stock: 35,
      categories: [womens.id],
    },
    {
      name: 'Leather Tote Bag',
      slug: 'leather-tote-bag',
      description: 'Handcrafted Italian leather tote with gold hardware.',
      price: 395.00,
      stock: 25,
      categories: [womens.id],
    },
    // Clothing - Men's
    {
      name: 'Merino Wool Crewneck',
      slug: 'merino-wool-crewneck',
      description: 'Premium merino wool sweater, lightweight and breathable.',
      price: 125.00,
      stock: 70,
      categories: [mens.id],
    },
    {
      name: 'Slim Fit Chinos',
      slug: 'slim-fit-chinos',
      description: 'Versatile slim fit chinos in stretch cotton.',
      price: 85.00,
      stock: 90,
      categories: [mens.id],
    },
    {
      name: 'Oxford Button-Down Shirt',
      slug: 'oxford-button-down-shirt',
      description: 'Classic oxford cloth button-down in crisp white.',
      price: 79.00,
      stock: 100,
      categories: [mens.id],
    },
    {
      name: 'Leather Messenger Bag',
      slug: 'leather-messenger-bag',
      description: 'Full-grain leather messenger bag with padded laptop sleeve.',
      price: 295.00,
      stock: 30,
      categories: [mens.id],
    },
  ];

  // Create products
  for (const productData of products) {
    const { categories, ...data } = productData;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        sellerId: seller.id,
        categories: { connect: categories.map(id => ({ id })) },
      },
    });
  }

  console.log(`Created ${products.length} products`);

  console.log('\n--- Test Credentials ---');
  console.log('Admin:  admin@auraya.com / admin123');
  console.log('Seller: seller@auraya.com / seller123');
  console.log('\nSample customer: Register a new account to test shopping');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
