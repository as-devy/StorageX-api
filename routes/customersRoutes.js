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

router.get('/', getCustomers);
router.post('/', addCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
