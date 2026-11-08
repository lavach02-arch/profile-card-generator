import express from 'express';
import {
  previewProfileCard,
  createProfile,
  listProfiles,
  getProfile,
  getProfileBySlugHandler,
  updateProfileHandler,
  deleteProfileHandler,
} from '../controllers/profileController.js';

const router = express.Router();

// Preview route without saving (for real-time live preview)
router.post('/preview', previewProfileCard);

// Core CRUD routes
router.get('/', listProfiles);
router.post('/', createProfile);
router.get('/slug/:slug', getProfileBySlugHandler);
router.get('/:id', getProfile);
router.put('/:id', updateProfileHandler);
router.delete('/:id', deleteProfileHandler);

export default router;
