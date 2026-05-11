/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.ts'
import contactsRoutes from './routes/contacts.ts'
import listsRoutes from './routes/lists.ts'
import broadcastsRoutes from './routes/broadcasts.ts'
import setupRoutes from './routes/setup.ts'
import conversationsRoutes from './routes/conversations.ts';
import whatsappRoutes      from './routes/whatsapp.ts';
import webhooksRoutes      from './routes/webhooks.ts';
import debugRoutes         from './routes/debug.ts';

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactsRoutes)
app.use('/api/lists', listsRoutes)
app.use('/api/broadcasts', broadcastsRoutes)
app.use('/api/setup', setupRoutes)
app.use('/api/conversations', conversationsRoutes);
app.use('/api/whatsapp',     whatsappRoutes);
app.use('/api/webhooks',     webhooksRoutes);
app.use('/api/debug',        debugRoutes);

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
