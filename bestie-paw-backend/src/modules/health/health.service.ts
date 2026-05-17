import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import type { HealthCreateInput, HealthUpdateInput } from './health.schema';

const assertPetOwnership = async (userId: string, petId: string) => {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) {
    throw new AppError('NOT_FOUND', 'Pet not found', 404);
  }
  if (pet.ownerId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed', 403);
  }
};

const assertRecordOwnership = async (userId: string, petId: string, recordId: string) => {
  const record = await prisma.healthRecord.findFirst({
    where: {
      id: recordId,
      petId,
      pet: { ownerId: userId }
    }
  });

  if (!record) {
    throw new AppError('NOT_FOUND', 'Record not found', 404);
  }

  return record;
};

export const listHealthRecords = async (
  userId: string,
  petId: string,
  type?: string,
  page = 1,
  limit = 20
) => {
  await assertPetOwnership(userId, petId);

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  return prisma.healthRecord.findMany({
    where: {
      petId,
      ...(type ? { type } : {})
    },
    orderBy: { date: 'desc' },
    skip: (safePage - 1) * safeLimit,
    take: safeLimit
  });
};

export const createHealthRecord = async (
  userId: string,
  petId: string,
  input: HealthCreateInput
) => {
  await assertPetOwnership(userId, petId);

  return prisma.healthRecord.create({
    data: {
      ...input,
      petId,
      date: new Date(input.date)
    }
  });
};

export const getHealthRecord = async (userId: string, petId: string, recordId: string) => {
  await assertPetOwnership(userId, petId);

  return assertRecordOwnership(userId, petId, recordId);
};

export const updateHealthRecord = async (
  userId: string,
  petId: string,
  recordId: string,
  input: HealthUpdateInput
) => {
  await assertRecordOwnership(userId, petId, recordId);

  return prisma.healthRecord.update({
    where: { id: recordId },
    data: {
      ...input,
      date: input.date ? new Date(input.date) : undefined
    }
  });
};

export const deleteHealthRecord = async (userId: string, petId: string, recordId: string) => {
  await assertRecordOwnership(userId, petId, recordId);
  await prisma.healthRecord.delete({ where: { id: recordId } });
};

export const addHealthAttachments = async (
  userId: string,
  petId: string,
  recordId: string,
  attachments: string[]
) => {
  await assertRecordOwnership(userId, petId, recordId);

  return prisma.healthRecord.update({
    where: { id: recordId },
    data: {
      attachments: {
        push: attachments
      }
    }
  });
};
