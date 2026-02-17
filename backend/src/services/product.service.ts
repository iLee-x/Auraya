import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import slugify from 'slugify';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from '../validators/product.validator';
import { uploadService } from './upload.service';
import { Prisma, Product } from '@prisma/client';

interface ProductWithRelations extends Product {
  images: { id: string; url: string; sortOrder: number }[];
  categories: { id: string; name: string; slug: string }[];
  seller: { id: string; name: string | null } | null;
}

interface PaginatedProducts {
  products: ProductWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const generateSlug = (name: string): string => {
  return slugify(name, { lower: true, strict: true });
};

const generateUniqueSlug = async (
  name: string,
  excludeId?: string
): Promise<string> => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

const productSelect = {
  id: true,
  sellerId: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: {
      id: true,
      url: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  categories: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const productService = {
  async getAll(query: ProductQueryInput): Promise<PaginatedProducts> {
    const { page, limit, categorySlug, search, minPrice, maxPrice, sellerId, sortBy, sortOrder, includeInactive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    if (categorySlug) {
      // Find the category and all its children so parent categories
      // also return products assigned to subcategories
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: { select: { slug: true } } },
      });

      if (category) {
        const slugs = [category.slug, ...category.children.map(c => c.slug)];
        where.categories = {
          some: {
            slug: { in: slugs },
          },
        };
      } else {
        where.categories = {
          some: { slug: categorySlug },
        };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: productSelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products as ProductWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getByIdOrSlug(idOrSlug: string): Promise<ProductWithRelations> {
    const isCuid = idOrSlug.length === 25 && !idOrSlug.includes('-');

    const product = await prisma.product.findFirst({
      where: isCuid
        ? { id: idOrSlug, deletedAt: null }
        : { slug: idOrSlug, deletedAt: null },
      select: productSelect,
    });

    if (!product) {
      throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
    }

    return product as ProductWithRelations;
  },

  async create(
    input: CreateProductInput,
    sellerId?: string
  ): Promise<ProductWithRelations> {
    const slug = input.slug || (await generateUniqueSlug(input.name));

    if (input.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug },
      });

      if (existingSlug) {
        throw AppError.conflict('Slug already exists', 'SLUG_EXISTS');
      }
    }

    if (input.categoryIds && input.categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: input.categoryIds } },
      });

      if (categories.length !== input.categoryIds.length) {
        throw AppError.badRequest(
          'One or more category IDs are invalid',
          'INVALID_CATEGORY'
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        stock: input.stock,
        isActive: input.isActive,
        sellerId,
        categories: input.categoryIds
          ? { connect: input.categoryIds.map((id) => ({ id })) }
          : undefined,
      },
      select: productSelect,
    });

    return product as ProductWithRelations;
  },

  async update(
    id: string,
    input: UpdateProductInput,
    userId?: string,
    isAdmin?: boolean
  ): Promise<ProductWithRelations> {
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (!isAdmin && existing.sellerId && existing.sellerId !== userId) {
      throw AppError.forbidden(
        'You can only update your own products',
        'NOT_OWNER'
      );
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: input.slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw AppError.conflict('Slug already exists', 'SLUG_EXISTS');
      }
      slug = input.slug;
    } else if (input.name && input.name !== existing.name && !input.slug) {
      slug = await generateUniqueSlug(input.name, id);
    }

    if (input.categoryIds) {
      const categories = await prisma.category.findMany({
        where: { id: { in: input.categoryIds } },
      });

      if (categories.length !== input.categoryIds.length) {
        throw AppError.badRequest(
          'One or more category IDs are invalid',
          'INVALID_CATEGORY'
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        slug,
        description:
          input.description !== undefined
            ? input.description
            : existing.description,
        price: input.price ?? existing.price,
        stock: input.stock ?? existing.stock,
        isActive: input.isActive ?? existing.isActive,
        categories: input.categoryIds
          ? {
              set: [],
              connect: input.categoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
      select: productSelect,
    });

    return product as ProductWithRelations;
  },

  async delete(id: string, userId?: string, isAdmin?: boolean): Promise<void> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing || existing.deletedAt) {
      throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (!isAdmin && existing.sellerId && existing.sellerId !== userId) {
      throw AppError.forbidden(
        'You can only delete your own products',
        'NOT_OWNER'
      );
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async addImages(
    productId: string,
    files: Express.Multer.File[],
    userId?: string,
    isAdmin?: boolean
  ): Promise<ProductWithRelations> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product || product.deletedAt) {
      throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (!isAdmin && product.sellerId && product.sellerId !== userId) {
      throw AppError.forbidden(
        'You can only modify your own products',
        'NOT_OWNER'
      );
    }

    const uploadResults = await uploadService.uploadImages(files, {
      folder: `products/${productId}`,
    });

    const maxSortOrder = product.images.reduce(
      (max, img) => Math.max(max, img.sortOrder),
      -1
    );

    await prisma.productImage.createMany({
      data: uploadResults.map((result, index) => ({
        productId,
        url: result.url,
        sortOrder: maxSortOrder + 1 + index,
      })),
    });

    return this.getByIdOrSlug(productId);
  },

  async deleteImage(
    productId: string,
    imageId: string,
    userId?: string,
    isAdmin?: boolean
  ): Promise<ProductWithRelations> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (!isAdmin && product.sellerId && product.sellerId !== userId) {
      throw AppError.forbidden(
        'You can only modify your own products',
        'NOT_OWNER'
      );
    }

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw AppError.notFound('Image not found', 'IMAGE_NOT_FOUND');
    }

    const publicId = uploadService.extractPublicId(image.url);
    if (publicId) {
      await uploadService.deleteImage(publicId);
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return this.getByIdOrSlug(productId);
  },

  async reorderImages(
    productId: string,
    imageIds: string[],
    userId?: string,
    isAdmin?: boolean
  ): Promise<ProductWithRelations> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product || product.deletedAt) {
      throw AppError.notFound('Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (!isAdmin && product.sellerId && product.sellerId !== userId) {
      throw AppError.forbidden(
        'You can only modify your own products',
        'NOT_OWNER'
      );
    }

    const existingIds = product.images.map((img) => img.id);
    const allIdsValid = imageIds.every((id) => existingIds.includes(id));

    if (!allIdsValid || imageIds.length !== existingIds.length) {
      throw AppError.badRequest('Invalid image IDs provided', 'INVALID_IMAGE_IDS');
    }

    await prisma.$transaction(
      imageIds.map((id, index) =>
        prisma.productImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return this.getByIdOrSlug(productId);
  },
};

export default productService;
