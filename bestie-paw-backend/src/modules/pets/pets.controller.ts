import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { resolveFileUrl } from '../../middleware/upload';
import {
  createPet,
  deletePet,
  getPetDetail,
  listPets,
  updatePet,
  updatePetAvatar
} from './pets.service';
import { petCreateSchema, petUpdateSchema } from './pets.schema';

export const listPetsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listPets(req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const createPetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = petCreateSchema.parse(req.body);
    const data = await createPet(req.user!.userId, input);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getPetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPetDetail(req.user!.userId, req.params.petId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const updatePetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = petUpdateSchema.parse(req.body);
    const data = await updatePet(req.user!.userId, req.params.petId, input);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const deletePetHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deletePet(req.user!.userId, req.params.petId);
    return sendSuccess(res, { message: 'Pet deleted' });
  } catch (err) {
    return next(err);
  }
};

export const uploadPetAvatarHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return sendSuccess(res, { message: 'No file uploaded' });
    }

    const url = resolveFileUrl(req.file.filename);
    const data = await updatePetAvatar(req.user!.userId, req.params.petId, url);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};
