import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validator';

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          isActive: true,
          images: {
            select: { id: true, url: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' as const },
            take: 1,
          },
        },
      },
    },
  },
};

export const cartService = {
  async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: cartInclude,
      });
    }

    return cart;
  },

  async addItem(userId: string, input: AddToCartInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product || product.deletedAt) {
      throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (!product.isActive) {
      throw AppError.badRequest('Product is not available', 'PRODUCT_INACTIVE');
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: input.productId,
        },
      },
    });

    const newQuantity = existingItem
      ? existingItem.quantity + input.quantity
      : input.quantity;

    if (newQuantity > product.stock) {
      throw AppError.badRequest(
        `Only ${product.stock} items available in stock`,
        'INSUFFICIENT_STOCK'
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
        },
      });
    }

    return this.getCart(userId);
  },

  async updateItem(
    userId: string,
    itemId: string,
    input: UpdateCartItemInput
  ) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw AppError.notFound('Cart not found', 'CART_NOT_FOUND');
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      throw AppError.notFound('Cart item not found', 'CART_ITEM_NOT_FOUND');
    }

    if (input.quantity > cartItem.product.stock) {
      throw AppError.badRequest(
        `Only ${cartItem.product.stock} items available in stock`,
        'INSUFFICIENT_STOCK'
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: input.quantity },
    });

    return this.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw AppError.notFound('Cart not found', 'CART_NOT_FOUND');
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw AppError.notFound('Cart item not found', 'CART_ITEM_NOT_FOUND');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  },

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw AppError.notFound('Cart not found', 'CART_NOT_FOUND');
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  },
};

export default cartService;
