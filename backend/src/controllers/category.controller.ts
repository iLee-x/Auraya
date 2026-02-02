import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryInput,
} from '../validators/category.validator';

export const categoryController = {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as CategoryQueryInput;
      const categories = await categoryService.getAll(query);

      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  },

  async getOne(
    req: Request<{ idOrSlug: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.getByIdOrSlug(req.params.idOrSlug);

      res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: Request<unknown, unknown, CreateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.create(req.body);

      res.status(201).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ id: string }, unknown, UpdateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.update(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await categoryService.delete(req.params.id);

      res.status(200).json({
        success: true,
        data: { message: 'Category deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default categoryController;
