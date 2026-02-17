import { Request, Response, NextFunction } from 'express';
import { addressService } from '../services/address.service';
import { CreateAddressInput, UpdateAddressInput } from '../validators/address.validator';

export const addressController = {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const addresses = await addressService.getAll(req.user!.userId);

      res.status(200).json({
        success: true,
        data: { addresses },
      });
    } catch (error) {
      next(error);
    }
  },

  async getOne(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const address = await addressService.getById(
        req.user!.userId,
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: Request<unknown, unknown, CreateAddressInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const address = await addressService.create(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ id: string }, unknown, UpdateAddressInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const address = await addressService.update(
        req.user!.userId,
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await addressService.remove(req.user!.userId, req.params.id);

      res.status(200).json({
        success: true,
        data: { message: 'Address deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  },

  async setDefault(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const address = await addressService.setDefault(
        req.user!.userId,
        req.params.id
      );

      res.status(200).json({
        success: true,
        data: { address },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default addressController;
