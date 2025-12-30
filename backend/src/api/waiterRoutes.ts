import { Router } from 'express';
import { getTables, getActiveOrderForTable, createOrUpdateOrder, getReceiptOrder, updateOrderCustomer } from '@/features/controllers/waiterController';
import waiterAuthMiddleware from '@/middleware/waiterAuthMiddleware';

const router = Router();

// Public route - does not require authentication
router.get('/tables', getTables);

// All subsequent routes in this file are protected by the waiter authentication middleware
router.use(waiterAuthMiddleware);

router.get('/orders/table/:tableId', getActiveOrderForTable);
router.post('/orders', createOrUpdateOrder);
router.put('/orders/:orderId/customer', updateOrderCustomer);
router.get('/recibo/:orderId', getReceiptOrder);

export default router;
