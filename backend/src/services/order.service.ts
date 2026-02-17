import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import {
  CheckoutInput,
  OrderQueryInput,
  UpdateOrderStatusInput,
} from '../validators/order.validator';

export const orderService = {
  async checkout(userId: string, input: CheckoutInput) {
    // 1. Validate address ownership
    const address = await prisma.address.findFirst({
      where: { id: input.addressId, userId },
    });

    if (!address) {
      throw AppError.notFound('Address not found', 'ADDRESS_NOT_FOUND');
    }

    // 2. Fetch cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw AppError.badRequest('Cart is empty', 'EMPTY_CART');
    }

    // 3. Validate stock for all items
    for (const item of cart.items) {
      if (!item.product || item.product.deletedAt || !item.product.isActive) {
        throw AppError.badRequest(
          `Product "${item.product?.name}" is no longer available`,
          'PRODUCT_UNAVAILABLE'
        );
      }
      if (item.quantity > item.product.stock) {
        throw AppError.badRequest(
          `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // 4. Calculate total
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // 5. Create address snapshot
    const shippingAddress = {
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    // 6. Atomic transaction: create order, decrement stock, clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddress,
          status: 'PAID',
          totalAmount,
          stripePaymentId: `mock_${Date.now()}`,
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              productSlug: item.product.slug,
              productPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  },

  async getOrders(userId: string, query: OrderQueryInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
    }

    return order;
  },

  async getAllOrders(query: OrderQueryInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: { items: true, user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count(),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateStatus(orderId: string, input: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: input.status },
      include: { items: true },
    });
  },
};

export default orderService;
