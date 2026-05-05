import dotenv from 'dotenv'
import path from 'path'

// Load .env FIRST
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
})

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {

    // Import app ONLY after dotenv loads
    const { default: app } = await import('./app.ts')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })

  } catch (error) {
    console.error('❌ Failed to start server:', error)
  }
}

startServer()