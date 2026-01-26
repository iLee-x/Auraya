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
      name: 'Seller User',
      role: 'SELLER',
    },
  });
  console.log('Seller user created:', seller.email);

  // Create sample categories
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

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
    },
  });

  console.log('Categories created:', [electronics.name, phones.name, laptops.name, clothing.name]);

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { slug: 'iphone-15-pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Latest Apple smartphone with A17 Pro chip',
      price: 999.99,
      stock: 50,
      isActive: true,
      sellerId: seller.id,
      categories: { connect: [{ id: phones.id }] },
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'macbook-pro-14' },
    update: {},
    create: {
      name: 'MacBook Pro 14"',
      slug: 'macbook-pro-14',
      description: 'Powerful laptop with M3 Pro chip',
      price: 1999.99,
      stock: 30,
      isActive: true,
      sellerId: seller.id,
      categories: { connect: [{ id: laptops.id }] },
    },
  });

  const product3 = await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s24' },
    update: {},
    create: {
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      description: 'Premium Android smartphone',
      price: 849.99,
      stock: 40,
      isActive: true,
      sellerId: seller.id,
      categories: { connect: [{ id: phones.id }] },
    },
  });

  console.log('Products created:', [product1.name, product2.name, product3.name]);

  console.log('\n--- Test Credentials ---');
  console.log('Admin:  admin@auraya.com / admin123');
  console.log('Seller: seller@auraya.com / seller123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
