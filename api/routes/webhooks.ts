import { Router } from 'express';
import { evolutionWebhookHandler } from '../controllers/evolutionWebhookController.ts';

const router = Router();

// POST /api/webhooks/evolution
// Recebe todos os eventos push da Evolution API.
// Configurar no Railway (Evolution API env): WEBHOOK_GLOBAL_URL=https://seu-backend/api/webhooks/evolution
router.post('/evolution', evolutionWebhookHandler);

export default router;
