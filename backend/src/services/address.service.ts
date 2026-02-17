import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator';

export const addressService = {
  async getAll(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  },

  async getById(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw AppError.notFound('Address not found', 'ADDRESS_NOT_FOUND');
    }

    return address;
  },

  async create(userId: string, input: CreateAddressInput) {
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: { userId, ...input },
    });
  },

  async update(userId: string, addressId: string, input: UpdateAddressInput) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw AppError.notFound('Address not found', 'ADDRESS_NOT_FOUND');
    }

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data: input,
    });
  },

  async remove(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw AppError.notFound('Address not found', 'ADDRESS_NOT_FOUND');
    }

    await prisma.address.delete({ where: { id: addressId } });
  },

  async setDefault(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw AppError.notFound('Address not found', 'ADDRESS_NOT_FOUND');
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return prisma.address.findFirst({ where: { id: addressId } });
  },
};

export default addressService;
