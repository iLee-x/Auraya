import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  ReorderImagesInput,
} from '../validators/product.validator';

export const productController = {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as ProductQueryInput;
      const result = await productService.getAll(query);

      res.status(200).json({
        success: true,
        data: result,
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
      const product = await productService.getByIdOrSlug(req.params.idOrSlug);

      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: Request<unknown, unknown, CreateProductInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sellerId = req.user?.role === 'SELLER' ? req.user.userId : undefined;
      const product = await productService.create(req.body, sellerId);

      res.status(201).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ id: string }, unknown, UpdateProductInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const product = await productService.update(
        req.params.id,
        req.body,
        req.user?.userId,
        isAdmin
      );

      res.status(200).json({
        success: true,
        data: { product },
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
      const isAdmin = req.user?.role === 'ADMIN';
      await productService.delete(req.params.id, req.user?.userId, isAdmin);

      res.status(200).json({
        success: true,
        data: { message: 'Product deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  },

  async addImages(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No images provided',
          code: 'NO_IMAGES',
        });
        return;
      }

      const isAdmin = req.user?.role === 'ADMIN';
      const product = await productService.addImages(
        req.params.id,
        files,
        req.user?.userId,
        isAdmin
      );

      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteImage(
    req: Request<{ id: string; imageId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const product = await productService.deleteImage(
        req.params.id,
        req.params.imageId,
        req.user?.userId,
        isAdmin
      );

      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },

  async reorderImages(
    req: Request<{ id: string }, unknown, ReorderImagesInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const product = await productService.reorderImages(
        req.params.id,
        req.body.imageIds,
        req.user?.userId,
        isAdmin
      );

      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
