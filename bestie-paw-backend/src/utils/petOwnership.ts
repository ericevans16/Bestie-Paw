import { Pet } from '@prisma/client';
import { prisma } from './prisma';
import { AppError } from '../middleware/errorHandler';

export const assertPetOwnership = async (userId: string, petId: string): Promise<Pet> => {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) {
    throw new AppError('NOT_FOUND', 'Pet not found', 404);
  }
  if (pet.ownerId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed', 403);
  }
  return pet;
};
