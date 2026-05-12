import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors    from 'cors'
import path    from 'path'
import fs      from 'fs'
import { fileURLToPath } from 'url'
import authRoutes          from './routes/auth.ts'
import contactsRoutes      from './routes/contacts.ts'
import listsRoutes         from './routes/lists.ts'
import broadcastsRoutes    from './routes/broadcasts.ts'
import setupRoutes         from './routes/setup.ts'
import conversationsRoutes from './routes/conversations.ts'
import whatsappRoutes      from './routes/whatsapp.ts'
import webhooksRoutes      from './routes/webhooks.ts'
import debugRoutes         from './routes/debug.ts'

// ── Path resolution ───────────────────────────────────────────────────────────
// import.meta.url pode variar conforme tsx resolve o arquivo via dynamic import.
// process.cwd() é sempre o diretório onde `npx tsx api/server.ts` foi chamado
// (raiz do projeto no Railway), sendo a fonte mais confiável para o dist/.

const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)
const cwdDistPath   = path.resolve(process.cwd(), 'dist')
const dirnameDistPath = path.resolve(__dirname, '..', 'dist')

// Usa cwdDistPath se existir; fallback para __dirname-based
const distPath = fs.existsSync(cwdDistPath) ? cwdDistPath : dirnameDistPath

console.log('[static] __dirname        =', __dirname)
console.log('[static] process.cwd()    =', process.cwd())
console.log('[static] cwdDistPath      =', cwdDistPath, '| exists:', fs.existsSync(cwdDistPath))
console.log('[static] dirnameDistPath  =', dirnameDistPath, '| exists:', fs.existsSync(dirnameDistPath))
console.log('[static] distPath chosen  =', distPath)
console.log('[static] index.html exists:', fs.existsSync(path.join(distPath, 'index.html')))

// ── App ───────────────────────────────────────────────────────────────────────
const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/contacts',      contactsRoutes)
app.use('/api/lists',         listsRoutes)
app.use('/api/broadcasts',    broadcastsRoutes)
app.use('/api/setup',         setupRoutes)
app.use('/api/conversations', conversationsRoutes)
app.use('/api/whatsapp',      whatsappRoutes)
app.use('/api/webhooks',      webhooksRoutes)
app.use('/api/debug',         debugRoutes)

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'ok' })
})

// ── Static assets (JS/CSS/images gerados pelo Vite) ───────────────────────────
console.log('[static] mounting express.static on:', distPath)
app.use(express.static(distPath))

// ── SPA fallback ──────────────────────────────────────────────────────────────
// Toda rota não-API entrega dist/index.html para o React Router tratar.
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html')

  console.log('[spa] fallback hit:', req.path)
  console.log('[spa] sending file:', indexPath)
  console.log('[spa] file exists: ', fs.existsSync(indexPath))

  res.sendFile(indexPath, (err) => {
    if (err) {
      const code = (err as NodeJS.ErrnoException & { status?: number }).status
      console.error('[spa] sendFile error — status:', code, '| message:', err.message)
      console.error('[spa] distPath on error:', distPath)
      if (!res.headersSent) {
        res.status(503).send(
          `<pre>SPA fallback failed.\n` +
          `distPath: ${distPath}\n` +
          `indexPath: ${indexPath}\n` +
          `exists: ${fs.existsSync(indexPath)}\n` +
          `error: ${err.message}</pre>`
        )
      }
    }
  })
})

// ── Error handler (deve ficar depois de TODAS as rotas) ───────────────────────
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', error.message)
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default app
