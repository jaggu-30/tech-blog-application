import { Router } from 'express';
import {
  createBlogHandler,
  getBlogs,
  getMyBlogs,
  getBlogByIdHandler,
  deleteBlogHandler
} from '../controllers/blogController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getBlogs);
router.get('/mine', protect, getMyBlogs);
router.get('/:id', getBlogByIdHandler);
router.post('/', protect, createBlogHandler);
router.delete('/:id', protect, deleteBlogHandler);

export default router;
