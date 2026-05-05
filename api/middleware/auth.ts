import { type Request, type Response, type NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: any
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' })
    return
  }

  // MOCK AUTHENTICATION
  if (token === 'mock-jwt-token') {
    (req as AuthRequest).user = {
      id: 'mock-user-id',
      email: 'admin@celeiro.com',
      name: 'Admin Fictício',
      role: 'admin'
    }
    next()
    return
  }

  res.status(401).json({ error: 'Unauthorized: Invalid token' })
}
