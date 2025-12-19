import express from 'express';
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customersController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', requireAuth, getCustomers);
router.post('/', requireAuth, addCustomer);
router.put('/:id', requireAuth, updateCustomer);
router.delete('/:id', requireAuth, deleteCustomer);

export default router;
