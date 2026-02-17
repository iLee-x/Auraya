import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import {
  CheckoutInput,
  OrderQueryInput,
  UpdateOrderStatusInput,
} from '../validators/order.validator';

export const orderController = {
  async checkout(
    req: Request<unknown, unknown, CheckoutInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const order = await orderService.checkout(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await orderService.getOrders(
        req.user!.userId,
        req.query as unknown as OrderQueryInput
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const order = await orderService.getOrderById(
        req.user!.userId,
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await orderService.getAllOrders(
        req.query as unknown as OrderQueryInput
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(
    req: Request<{ id: string }, unknown, UpdateOrderStatusInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const order = await orderService.updateStatus(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default orderController;
