import { z } from 'zod';

const petTypeEnum = z.enum(['DOG', 'CAT', 'RABBIT', 'BIRD', 'FISH', 'OTHER']);
const genderEnum = z.enum(['MALE', 'FEMALE', 'UNKNOWN']);
const neuteredEnum = z.enum(['YES', 'NO', 'UNKNOWN']);

const birthdaySchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.date().max(new Date(), { message: '生日不能是未来的日期' }).optional()
);

const optionalEnum = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

export const petCreateSchema = z.object({
  name: z.string().min(1),
  type: optionalEnum(petTypeEnum),
  breed: z.string().optional(),
  birthday: birthdaySchema,
  gender: optionalEnum(genderEnum),
  weightKg: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.number().min(0, '体重不能为负数').optional()
  ),
  neutered: optionalEnum(neuteredEnum),
  allergies: z.string().max(200).optional(),
  note: z.string().max(300).optional()
});

export const petUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: optionalEnum(petTypeEnum),
  breed: z.string().optional(),
  birthday: birthdaySchema,
  gender: optionalEnum(genderEnum),
  weightKg: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.number().min(0, '体重不能为负数').optional()
  ),
  neutered: optionalEnum(neuteredEnum),
  allergies: z.string().max(200).optional(),
  note: z.string().max(300).optional()
});

export type PetCreateInput = z.infer<typeof petCreateSchema>;
export type PetUpdateInput = z.infer<typeof petUpdateSchema>;
