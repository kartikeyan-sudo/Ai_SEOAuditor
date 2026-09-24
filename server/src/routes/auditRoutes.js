import { Router } from 'express';
import {
  createAudit,
  getAuditById,
  getAllAudits,
  deleteAudit
} from '../controllers/auditController.js';

const router = Router();

router.post('/', createAudit);
router.get('/', getAllAudits);
router.get('/:id', getAuditById);
router.delete('/:id', deleteAudit);

export default router;
