// Augments Express.Request with tenant context.
// Populated by:
//   - middleware/auth.ts    → userId
//   - middleware/tenant.ts  → organizationId, userRole
import 'express'

declare global {
  namespace Express {
    interface Request {
      userId?:         string
      organizationId?: string
      userRole?:       string
    }
  }
}

export {}
