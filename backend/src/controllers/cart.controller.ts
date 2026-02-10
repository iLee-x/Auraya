import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validator';

export const cartController = {
  async getCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cart = await cartService.getCart(req.user!.userId);

      res.status(200).json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  },

  async addItem(
    req: Request<unknown, unknown, AddToCartInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cart = await cartService.addItem(req.user!.userId, req.body);

      res.status(200).json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateItem(
    req: Request<{ itemId: string }, unknown, UpdateCartItemInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cart = await cartService.updateItem(
        req.user!.userId,
        req.params.itemId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  },

  async removeItem(
    req: Request<{ itemId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cart = await cartService.removeItem(
        req.user!.userId,
        req.params.itemId
      );

      res.status(200).json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  },

  async clearCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cart = await cartService.clearCart(req.user!.userId);

      res.status(200).json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default cartController;
