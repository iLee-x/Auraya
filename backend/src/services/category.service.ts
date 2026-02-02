import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import slugify from 'slugify';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryInput,
} from '../validators/category.validator';
import { Category } from '@prisma/client';

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
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
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

const buildCategoryTree = (
  categories: Category[],
  parentId: string | null = null
): CategoryWithChildren[] => {
  const result: CategoryWithChildren[] = [];

  for (const category of categories) {
    if (category.parentId === parentId) {
      const children = buildCategoryTree(categories, category.id);
      const categoryWithChildren: CategoryWithChildren = {
        ...category,
      };
      if (children.length > 0) {
        categoryWithChildren.children = children;
      }
      result.push(categoryWithChildren);
    }
  }

  return result;
};

export const categoryService = {
  async getAll(
    query: CategoryQueryInput
  ): Promise<Category[] | CategoryWithChildren[]> {
    const whereClause = query.parentId ? { parentId: query.parentId } : {};

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    if (query.flat) {
      return categories;
    }

    if (query.parentId) {
      return categories;
    }

    return buildCategoryTree(categories);
  },

  async getByIdOrSlug(idOrSlug: string): Promise<Category> {
    const isCuid = idOrSlug.length === 25 && !idOrSlug.includes('-');

    const category = await prisma.category.findFirst({
      where: isCuid
        ? { id: idOrSlug }
        : { slug: idOrSlug },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
    }

    return category;
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug || (await generateUniqueSlug(input.name));

    if (input.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug },
      });

      if (existingSlug) {
        throw AppError.conflict('Slug already exists', 'SLUG_EXISTS');
      }
    }

    if (input.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) {
        throw AppError.notFound('Parent category not found', 'PARENT_NOT_FOUND');
      }
    }

    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        parentId: input.parentId,
      },
    });

    return category;
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
    }

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: input.slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw AppError.conflict('Slug already exists', 'SLUG_EXISTS');
      }
      slug = input.slug;
    } else if (input.name && input.name !== existing.name && !input.slug) {
      slug = await generateUniqueSlug(input.name, id);
    }

    if (input.parentId !== undefined && input.parentId !== null) {
      if (input.parentId === id) {
        throw AppError.badRequest(
          'Category cannot be its own parent',
          'INVALID_PARENT'
        );
      }

      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) {
        throw AppError.notFound('Parent category not found', 'PARENT_NOT_FOUND');
      }

      let currentParent = parent;
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          throw AppError.badRequest(
            'Circular parent reference detected',
            'CIRCULAR_REFERENCE'
          );
        }
        const nextParent = await prisma.category.findUnique({
          where: { id: currentParent.parentId },
        });
        if (!nextParent) break;
        currentParent = nextParent;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        slug,
        description: input.description !== undefined ? input.description : existing.description,
        parentId: input.parentId !== undefined ? input.parentId : existing.parentId,
      },
    });

    return category;
  },

  async delete(id: string): Promise<void> {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: { take: 1 },
      },
    });

    if (!existing) {
      throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
    }

    if (existing.children.length > 0) {
      throw AppError.badRequest(
        'Cannot delete category with child categories',
        'HAS_CHILDREN'
      );
    }

    if (existing.products.length > 0) {
      throw AppError.badRequest(
        'Cannot delete category with associated products',
        'HAS_PRODUCTS'
      );
    }

    await prisma.category.delete({
      where: { id },
    });
  },
};

export default categoryService;
