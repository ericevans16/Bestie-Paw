import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { avatarUpload } from '../../middleware/upload';
import {
  createPetHandler,
  deletePetHandler,
  getPetHandler,
  listPetsHandler,
  updatePetHandler,
  uploadPetAvatarHandler
} from './pets.controller';

const router = Router();

/**
 * GET /api/pets
 * List current user's pets. Auth: yes.
 */
router.get('/', authMiddleware, listPetsHandler);

/**
 * POST /api/pets
 * Create a pet profile. Auth: yes.
 */
router.post('/', authMiddleware, createPetHandler);

/**
 * GET /api/pets/:petId
 * Get pet details with summary. Auth: yes.
 */
router.get('/:petId', authMiddleware, getPetHandler);

/**
 * PATCH /api/pets/:petId
 * Update a pet profile. Auth: yes.
 */
router.patch('/:petId', authMiddleware, updatePetHandler);

/**
 * DELETE /api/pets/:petId
 * Delete a pet profile. Auth: yes.
 */
router.delete('/:petId', authMiddleware, deletePetHandler);

/**
 * POST /api/pets/:petId/avatar
 * Upload a pet avatar. Auth: yes.
 */
router.post(
  '/:petId/avatar',
  authMiddleware,
  avatarUpload.single('avatar'),
  uploadPetAvatarHandler
);

export default router;
